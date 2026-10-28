# Ideas

One markdown file per idea in `inbox/`. Front matter fields: `title`, `slug`, `type` (a blueprint
name), `one_liner`, `priority` (1 = first), `status` (`inbox` | `building` | `shipped`), `push`.
`node bin/factory.mjs new` sets status to `building`; `ship` moves the file to `done/`.
