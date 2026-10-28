# Products

Each product is its own git repository, checked out here so the factory can run `check` and `ship`
on it. The factory repository ignores their contents; clone them separately.

| Product | Repository | Blueprint |
|---|---|---|
| agent-globe | `products/agent-globe` (own git repo; add remote and push to publish) | desktop-app |
| phosphor-theme | `products/phosphor-theme` (own git repo; add remote and push to publish) | vscode-theme |

To add a product repository after cloning the factory:

```
git clone <product-url> products/<slug>
node bin/factory.mjs check <slug>
```
