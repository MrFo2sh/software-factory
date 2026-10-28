# Definition of done

Walk this list before `ship`. Fix, or move to BACKLOG.md with a reason.

- [ ] `node bin/factory.mjs check <slug>` passes: lint, typecheck, test, build, audit.
- [ ] The vertical slice works from a clean clone using only the README quickstart.
- [ ] Every MVP line in SPEC.md is either done or moved to BACKLOG.md.
- [ ] "Done when" checks in SPEC.md are observable and pass.
- [ ] `.env.example` is complete. App refuses to start on missing required config.
- [ ] README has: one-paragraph description, quickstart, config table, screenshot or sample output.
- [ ] CHANGELOG has an Unreleased section with what shipped.
- [ ] CI workflow present and runs the same `check` steps.
- [ ] Release artifact builds: installer, image, package, or deploy URL.
- [ ] No secrets, no absolute local paths, no personal data in the tree.
- [ ] Security review done if the product touches network, files, credentials, or user input.
