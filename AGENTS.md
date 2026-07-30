# Project Agent Guidance

## Content Lifecycle Changes

- When terms move between `catalogued`, `draft`, and `verified`, update the production plan, research packets, public facts, unit assertions, and E2E status totals in the same change.
- Search tests and documentation for the previous verified, draft, catalogued, public-term, and public-relation counts before running CI.
- Regenerate and stage `src/generated/term-registry.json` and `src/generated/graph.json` before the CI generated-artifact drift check.
