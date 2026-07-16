# Documentation authoring guide

This repository publishes tapstate documentation. Use **tapstate** in reader-facing copy and examples. Capitalize it as **Tapstate** only when it is the first word of a sentence or title. The current documentation contract uses `tapstate`, `.tapstate.yml`, and `version: tapstate/v1`; preserve connector IDs and inherited configuration keys until their individual product contracts change.

## Scope

- This file defines the repository-wide defaults for authoring and review.
- Start from the changed scope. Review the diff first when one is available, and avoid generalized comments on untouched content.

## Sources of truth

- Use `tapstate/northstar` as the upstream source for product narrative, positioning, terminology, and reusable concepts. Check each source file's `status` and `publication` metadata before adapting it.
- Treat Northstar content marked `approved` and `external-eligible` as the strongest reusable messaging source. Draft or internal material can guide structure and terminology, but it is not automatically publishable unless a stakeholder explicitly approves its use.
- Use published release contracts, runtime verification, committed product code, tests, schemas, and the connector catalog for behavior and capability claims. Northstar does not prove that a runtime feature is available.
- Use `docs-en` and upstream connector documentation as migration, compatibility, and external-system preparation baselines. They do not prove a tapstate UI, command, field, maturity, or runtime behavior.
- Agent memory may restore prior decisions and unresolved context, but it is not product evidence. Keep durable decisions in this repository or Northstar so a review never depends on one person's local memory.

## Default review mode

- When asked for a review, prioritize issues that can mislead readers, break navigation, break anchors, fail the build, or introduce factual errors over broad copy-editing.
- Prefer concrete findings with file and line references, and explain the reader impact.
- Style preferences alone are not findings. Do not rewrite already-clear text only to make it sound more polished.
- If no issues are found, state `No findings` and list any remaining risks or unverified areas.

## Severity

- `P1`: Breaks links, navigation, anchors, builds, or directly misleads users through incorrect steps, commands, parameters, prerequisites, capability claims, or compatibility guidance.
- `P2`: Creates clear confusion or mild misinformation, including inconsistent terminology, heading hierarchy, navigation labels, paths, screenshots, or source-to-page drift.
- `P3`: Typos, grammar issues, minor ambiguity, or small consistency problems that do not change meaning.
- Aesthetic preference or phrasing taste alone is not a finding.

## Review output

- Keep one finding focused on one issue. Include its location, the problem, reader impact, and a verification hint when useful.
- Prefer the smallest actionable correction. Do not propose a full-page rewrite unless the user asks for one or the structure itself causes the problem.
- Do not guess about behavior, defaults, limits, compatibility, connector capabilities, or release status. Mark them `unverified` or `needs product/implementation confirmation`.
- For procedures, verify prerequisites, sequence, and an observable result.

## Published content

- Use concise, professional, natural US English. Prefer reader goals, prerequisites, actions, results, and limitations over internal implementation commentary.
- Avoid marketing filler, unsupported superlatives, obvious AI phrasing, and internal validation notes.
- Use sentence-style capitalization for headings. Preserve technical identifiers, code, commands, fields, example values, connector IDs, and compatibility keys exactly.
- Keep the page body canonical for readers, search, `llms.txt`, and page-level Markdown. Do not maintain a second reader-facing facts document.
- When changing titles, slugs, headings, navigation metadata, or links, verify the sidebar label, route, anchor, canonical URL, and page-level Markdown together.
- Images and screenshots must use stable repository paths, accurate alt text, and match the current product or external-system flow.

## Connector documentation

- Use the current tapstate connector catalog for connector ID, role, modes, configuration fields, defaults, enums, sink capability, and maturity when the catalog exposes the fact.
- Use `docs-en` and upstream connector documentation to preserve external-system preparation, permissions, CDC setup, authentication flows, limitations, and necessary screenshots.
- Cross-check high-impact claims against implementation or metadata when feasible: CDC, write support, incremental behavior, data types, authentication, network and permission prerequisites, and limitations.
- If implementation evidence is private, unavailable, or cannot be matched reliably, do not invent certainty. Record the verification gap outside reader-facing copy.

## AI-readable documentation contract

- Use concise `ai` frontmatter for pages that need agent discovery. It identifies the content kind, maturity, supported uses or modes, and aliases.
- Keep the page body canonical for both readers and agents. Do not maintain a parallel facts document unless a stable external API consumer requires one.
- Keep evidence and product-boundary notes close to the claims they qualify. Record detailed migration provenance in the pull request or migration playbook rather than reader-facing frontmatter.
- Do not infer a tapstate UI, connection test, runtime execution, TLS field, or advanced connector option from upstream documentation or connector code alone. Mark it as pending unless the tapstate catalog or product surface exposes it.

## Verification

Before aligning release status, commands, installers, runtime behavior, or other product facts, confirm that the latest product implementation is committed and its tapstate rebrand has landed. If either condition is not met, defer the claim instead of presenting it as current behavior.

Run these before handing off a documentation change:

```bash
git diff --check
pnpm brand:check
pnpm types:check
pnpm build
```

For an implementation cross-check, set `TAPSTATE_CATALOG_DIR` to the directory containing the product repository's connector catalog JSON files.
