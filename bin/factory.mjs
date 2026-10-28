#!/usr/bin/env node
// Software factory CLI. Zero dependencies.
// Commands: next | new <idea.md> | check <slug> | ship <slug> | status
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IDEAS = path.join(ROOT, "ideas");
const PRODUCTS = path.join(ROOT, "products");
const FACTORY = path.join(ROOT, "factory");

const [, , cmd, arg] = process.argv;
const commands = { next, new: create, check, ship, status, help };
if (!commands[cmd]) help();
else {
  try {
    commands[cmd](arg);
  } catch (e) {
    console.error("factory:", e.message);
    process.exit(1);
  }
}

// ---------- helpers ----------
function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^\[.*\]$/.test(v)) {
      v = v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else if (v === "true") v = true;
    else if (v === "false") v = false;
    else if (/^\d+$/.test(v)) v = Number(v);
    else v = v.replace(/^["']|["']$/g, "");
    meta[kv[1]] = v;
  }
  return { meta, body: m[2] };
}

function writeFrontMatter(meta, body) {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`);
  return `---\n${lines.join("\n")}\n---\n${body}`;
}

function listIdeas(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "TEMPLATE.md")
    .sort()
    .map((f) => {
      const file = path.join(dir, f);
      const { meta, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
      return { file, name: f, meta, body };
    });
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function render(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

function copyDir(src, dst, vars) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyDir(s, d, vars);
    } else if (!fs.existsSync(d)) {
      fs.writeFileSync(d, render(fs.readFileSync(s, "utf8"), vars));
    }
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function productDir(slug) {
  const d = path.join(PRODUCTS, slug);
  if (!fs.existsSync(path.join(d, "factory.json"))) {
    throw new Error(`no product '${slug}' (missing products/${slug}/factory.json)`);
  }
  return d;
}

function run(command, cwd) {
  const shell = process.platform === "win32" ? "cmd.exe" : "/bin/sh";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", command] : ["-c", command];
  return spawnSync(shell, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, CI: "1", FORCE_COLOR: "0" },
  });
}

// ---------- commands ----------
function help() {
  console.log(`factory commands:
  next              show the highest-priority idea in ideas/inbox
  new <idea.md>     create products/<slug> from an idea file
  check <slug>      run lint/typecheck/test/build/audit from factory.json, log to .factory/logs
  ship <slug>       refuse unless last check passed; tag, changelog, ledger, archive idea
  status            ideas and products overview`);
}

function next() {
  const ideas = listIdeas(path.join(IDEAS, "inbox")).filter((i) => (i.meta.status ?? "inbox") === "inbox");
  if (!ideas.length) {
    console.log("inbox empty");
    return;
  }
  ideas.sort((a, b) => (a.meta.priority ?? 99) - (b.meta.priority ?? 99) || a.name.localeCompare(b.name));
  const i = ideas[0];
  console.log(`${path.relative(ROOT, i.file)}\n  title: ${i.meta.title}\n  type: ${i.meta.type}\n  priority: ${i.meta.priority ?? "-"}`);
}

function create(ideaPath) {
  if (!ideaPath) throw new Error("usage: new <ideas/inbox/file.md>");
  const file = path.resolve(ROOT, ideaPath);
  const raw = fs.readFileSync(file, "utf8");
  const { meta, body } = parseFrontMatter(raw);
  const slug = meta.slug ? slugify(meta.slug) : slugify(meta.title ?? path.basename(file, ".md").replace(/^\d+-/, ""));
  const dir = path.join(PRODUCTS, slug);
  if (fs.existsSync(dir)) throw new Error(`products/${slug} already exists`);
  const blueprintFile = path.join(FACTORY, "blueprints", `${meta.type}.md`);
  if (!fs.existsSync(blueprintFile)) throw new Error(`unknown type '${meta.type}'. See factory/blueprints/README.md`);
  const vars = {
    SLUG: slug,
    NAME: meta.title ?? slug,
    ONE_LINER: meta.one_liner ?? "",
    TYPE: meta.type,
    AUTHOR: meta.author ?? process.env.FACTORY_AUTHOR ?? "Factory",
    YEAR: String(new Date().getFullYear()),
    DATE: new Date().toISOString().slice(0, 10),
    IDEA_BODY: body.trim(),
    BLUEPRINT: `factory/blueprints/${meta.type}.md`,
  };
  fs.mkdirSync(dir, { recursive: true });
  copyDir(path.join(FACTORY, "templates"), dir, vars);
  copyDir(path.join(FACTORY, "overlay", "common"), dir, vars);
  fs.mkdirSync(path.join(dir, ".factory", "logs"), { recursive: true });
  fs.writeFileSync(file, writeFrontMatter({ ...meta, status: "building", product: `products/${slug}` }, body));
  console.log(`created products/${slug}\n  blueprint: ${vars.BLUEPRINT}\n  next: fill SPEC.md, scaffold per blueprint, fill factory.json commands`);
}

function check(slug) {
  if (!slug) throw new Error("usage: check <slug>");
  const dir = productDir(slug);
  const cfg = readJson(path.join(dir, "factory.json"));
  const steps = cfg.check ?? ["lint", "typecheck", "test", "build", "audit"];
  const logs = path.join(dir, ".factory", "logs");
  fs.mkdirSync(logs, { recursive: true });
  const results = [];
  let allOk = true;
  for (const step of steps) {
    const command = cfg.commands?.[step];
    if (!command) {
      results.push({ step, status: "SKIP" });
      console.log(`SKIP  ${step} (no command)`);
      continue;
    }
    const started = Date.now();
    const r = run(command, dir);
    const out = `$ ${command}\n\n${r.stdout ?? ""}\n${r.stderr ?? ""}`;
    fs.writeFileSync(path.join(logs, `${step}.log`), out);
    const ok = r.status === 0;
    allOk &&= ok;
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    results.push({ step, status: ok ? "PASS" : "FAIL", ms: Date.now() - started, command });
    console.log(`${ok ? "PASS" : "FAIL"}  ${step}  (${secs}s)`);
    if (!ok) {
      const tail = out.trim().split("\n").slice(-20).join("\n");
      console.log(tail.replace(/^/gm, "      "));
      console.log(`      full log: products/${slug}/.factory/logs/${step}.log`);
      if (cfg.stopOnFail !== false) break;
    }
  }
  fs.writeFileSync(
    path.join(dir, ".factory", "last-check.json"),
    JSON.stringify({ at: new Date().toISOString(), ok: allOk, results }, null, 2),
  );
  console.log(allOk ? "\nCHECK PASSED" : "\nCHECK FAILED");
  if (!allOk) process.exit(1);
}

function ship(slug) {
  if (!slug) throw new Error("usage: ship <slug>");
  const dir = productDir(slug);
  const cfg = readJson(path.join(dir, "factory.json"));
  const lastPath = path.join(dir, ".factory", "last-check.json");
  if (!fs.existsSync(lastPath)) throw new Error("run check first");
  const last = readJson(lastPath);
  if (!last.ok) throw new Error(`last check failed at ${last.at}; fix and re-run check`);
  const version = cfg.version ?? "0.1.0";
  const date = new Date().toISOString().slice(0, 10);

  const cl = path.join(dir, "CHANGELOG.md");
  let text = fs.existsSync(cl) ? fs.readFileSync(cl, "utf8") : "# Changelog\n\n## Unreleased\n";
  if (!text.includes(`## ${version} `)) {
    text = text.replace(/## Unreleased\s*/, `## Unreleased\n\n## ${version} - ${date}\n`);
  }
  fs.writeFileSync(cl, text);

  if (cfg.commands?.release) {
    const r = run(cfg.commands.release, dir);
    fs.writeFileSync(path.join(dir, ".factory", "logs", "release.log"), `$ ${cfg.commands.release}\n\n${r.stdout}\n${r.stderr}`);
    if (r.status !== 0) throw new Error("release command failed; see .factory/logs/release.log");
    console.log("release command: PASS");
  }

  // Every product is its own git repository. First ship creates it; later ships commit and tag.
  const idea = listIdeas(path.join(IDEAS, "inbox")).find((i) => i.meta.product === `products/${slug}`);
  if (!fs.existsSync(path.join(dir, ".git"))) {
    run("git init -q -b main", dir);
    console.log("initialized git repository");
  }
  const gitLog = [];
  for (const cmd of ["git add -A", `git -c core.safecrlf=false commit -q -m "release: v${version}"`, `git tag -f v${version}`]) {
    const r = run(cmd, dir);
    gitLog.push(`$ ${cmd}\n${r.stdout ?? ""}${r.stderr ?? ""}(exit ${r.status})\n`);
  }
  fs.writeFileSync(path.join(dir, ".factory", "logs", "git.log"), gitLog.join("\n"));
  const head = run("git log --oneline -1", dir).stdout?.trim() ?? "";
  console.log(`committed and tagged v${version} at ${head} (details: .factory/logs/git.log)`);
  const remote = run("git remote get-url origin", dir);
  if (remote.status !== 0) {
    console.log(`no remote yet. To publish:\n  gh repo create ${slug} --private --source=products/${slug} --push\n  or: git -C products/${slug} remote add origin <url> && git -C products/${slug} push -u origin main --tags`);
  } else if (idea?.meta.push === true) {
    const p = run("git push -u origin main --tags", dir);
    console.log(p.status === 0 ? `pushed to ${remote.stdout.trim()}` : `push failed:\n${(p.stderr ?? "").trim()}`);
  } else {
    console.log(`remote ${remote.stdout.trim()} set; not pushed (idea has push: false). Push with: git -C products/${slug} push --tags`);
  }

  const link = remote.status === 0 ? remote.stdout.trim().replace(/[.]git$/, "") : `products/${slug}`;
  fs.appendFileSync(
    path.join(ROOT, "SHIPPED.md"),
    `| ${date} | [${slug}](${link}) | ${version} | ${cfg.blueprint ?? "-"} | ${cfg.one_liner ?? ""} |\n`,
  );

  for (const i of listIdeas(path.join(IDEAS, "inbox"))) {
    if (i.meta.product === `products/${slug}`) {
      fs.mkdirSync(path.join(IDEAS, "done"), { recursive: true });
      fs.writeFileSync(
        path.join(IDEAS, "done", i.name),
        writeFrontMatter({ ...i.meta, status: "shipped", shipped: date, version }, i.body),
      );
      fs.unlinkSync(i.file);
    }
  }
  console.log(`SHIPPED ${slug} v${version}`);
}

function status() {
  console.log("ideas/inbox:");
  for (const i of listIdeas(path.join(IDEAS, "inbox"))) {
    console.log(`  [${i.meta.status ?? "inbox"}] p${i.meta.priority ?? "-"} ${i.name} - ${i.meta.title}`);
  }
  console.log("ideas/done:");
  for (const i of listIdeas(path.join(IDEAS, "done"))) {
    console.log(`  [shipped ${i.meta.shipped}] ${i.name} - ${i.meta.title}`);
  }
  console.log("products:");
  if (!fs.existsSync(PRODUCTS)) return;
  for (const d of fs.readdirSync(PRODUCTS)) {
    const fj = path.join(PRODUCTS, d, "factory.json");
    if (!fs.existsSync(fj)) continue;
    const cfg = readJson(fj);
    const lc = path.join(PRODUCTS, d, ".factory", "last-check.json");
    const last = fs.existsSync(lc) ? readJson(lc) : null;
    const lastText = last ? `${last.ok ? "PASS" : "FAIL"} ${last.at}` : "never";
    console.log(`  ${d}  v${cfg.version ?? "?"}  ${cfg.blueprint ?? "?"}  last check: ${lastText}`);
  }
}
