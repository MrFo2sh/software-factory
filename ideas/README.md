# Ideas

One markdown file per idea in `inbox/`. Front matter fields: `title`, `slug`, `type` (a blueprint
name), `one_liner`, `priority` (1 = first), `status` (`inbox` | `building` | `shipped`), `push`.
`node bin/factory.mjs new` sets status to `building`; `ship` moves the file to `done/`.


## Lifecycle of an idea

```
ideas/inbox/NNN-slug.md   ->  node bin/factory.mjs new   ->  products/<slug>/  (built, checked)
                          ->  node bin/factory.mjs ship  ->  products/<slug>/.git (own repo, tagged)
                          ->  ideas/done/NNN-slug.md     ->  SHIPPED.md row
```

The factory repository never contains product code. Each product is its own repository under
`products/<slug>`; publish it with `gh repo create <slug> --private --source=products/<slug> --push`
or by adding a remote and pushing. Set `push: true` in the idea to let `ship` push automatically.
