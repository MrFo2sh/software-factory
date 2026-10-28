# Products

Each product is its own git repository, checked out here so the factory can run `check` and `ship`
on it. The factory repository ignores their contents; clone them separately.

| Product | Repository | Blueprint |
|---|---|---|
| agent-globe | https://github.com/MrFo2sh/agent-globe | desktop-app |
| phosphor-theme | https://github.com/MrFo2sh/phosphor-theme | vscode-theme |

To add a product repository after cloning the factory:

```
git clone https://github.com/MrFo2sh/<slug>.git products/<slug>
node bin/factory.mjs check <slug>
```
