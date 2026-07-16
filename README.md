<p align="center">
  <img src="./app/icon.svg" alt="tapstate logo" width="72" height="72" />
</p>

<h1 align="center">Tapstate documentation</h1>

<p align="center">
  Source for the product documentation at <a href="https://tapstate.dev/docs">tapstate.dev/docs</a>.
</p>

<p align="center">
  <a href="https://tapstate.dev/docs"><img alt="Documentation" src="https://img.shields.io/badge/docs-tapstate.dev%2Fdocs-0f766e" /></a>
  <a href="https://github.com/tapstate/docs/blob/main/LICENSE"><img alt="License: CC BY 4.0" src="https://img.shields.io/badge/license-CC%20BY%204.0-2d7969" /></a>
  <img alt="Node.js 20.9 or later" src="https://img.shields.io/badge/node.js-%3E%3D20.9-339933?logo=nodedotjs&amp;logoColor=white" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&amp;logoColor=white" />
</p>

This repository contains the tapstate documentation site, connector guides, searchable content, and AI-readable documentation endpoints. It is built with Next.js, Fumadocs, MDX, and static export.

## Get started

### Requirements

- Node.js 20.9 or later
- pnpm 10 or later

### Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the documentation home page or [http://localhost:3000/docs](http://localhost:3000/docs) for the documentation index.

Use `pnpm install` without `--frozen-lockfile` only when intentionally changing dependencies and updating `pnpm-lock.yaml`.

## Common commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the local development server. |
| `pnpm lint` | Check the application and documentation source with ESLint. |
| `pnpm brand:check` | Check public source for retired product names and identifiers. |
| `pnpm types:check` | Regenerate content and route types, then run TypeScript checks. |
| `pnpm build` | Create the static production export in `out/`. |
| `pnpm preview` | Serve the generated `out/` directory locally. |

Run the full local gate before opening a pull request:

```bash
git diff --check
pnpm brand:check
pnpm lint
pnpm types:check
pnpm build
```

## Repository layout

```text
content/docs/        Documentation source and connector guides
public/images/       Images referenced by published pages
scripts/             Repository validation scripts
app/                 Next.js routes and metadata
components/          Shared documentation and MDX components
lib/                 Content loading, navigation, and Markdown export
source.config.ts     Fumadocs collections and frontmatter schema
netlify.toml         Netlify static-export configuration
```

Generated files under `.next/`, `.source/`, and `out/` are not source files. Update the MDX or application code and rebuild instead of editing generated output.

## Contributing

Before changing documentation or application code, follow [AGENTS.md](./AGENTS.md) for terminology, sourcing, review, and verification rules.

- Keep one canonical page body for readers, search, and AI-generated Markdown.
- Put published connector metadata in `lib/connector-directory.ts` and keep it aligned with connector frontmatter.
- Store images under `public/images/` and use stable paths with descriptive alt text.
- Preserve technical identifiers, connector IDs, commands, fields, and example values exactly.

## AI-readable documentation

The static site publishes the same canonical content in formats designed for agents and retrieval systems:

| Route | Purpose |
|---|---|
| `/llms.txt` | Compact documentation index. |
| `/llms-full.txt` | Combined documentation context. |
| `/llms.mdx/docs/<page>/content.md` | Markdown for an individual page. |

## Deployment

The site is statically exported to `out/`. The committed [netlify.toml](./netlify.toml) runs `pnpm build` and publishes that directory.

Set `TAPSTATE_SITE_URL` at build time so canonical links, structured data, the sitemap, and AI-readable routes use the deployed origin. All committed Netlify contexts currently set `TAPSTATE_SITE_INDEXABLE=false`; keep previews and pre-release deployments non-indexable. Enable indexing for production only after the release is approved.

For another static host, use:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `out`

## License

Documentation in this repository, including this README and files under `content/docs/`, is licensed under [CC BY 4.0](https://github.com/tapstate/docs/blob/main/LICENSE). Third-party dependencies and other repository materials remain subject to their respective license terms.
