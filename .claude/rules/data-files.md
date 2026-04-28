---
paths:
 - "config/**"
 - "src/config/**"
 - "src/server/seed/**"
 - "data/**"
---

# Data & Config File Rules

Applies to JSON / YAML / TOML files used as configuration, seed data, fixtures,
or static lookup tables. Does NOT apply to migrations (which have their own
ADR-governed lifecycle).

- All JSON / YAML files must be syntactically valid — a broken config blocks
  the build, the deploy, or the test suite
- Every config schema is validated at runtime via Zod (or `class-validator`).
  An invalid file fails fast at startup with a useful error message — never
  silently falls back to defaults for required values
- File naming: kebab-case, descriptive — `pricing-tiers.json`,
  `feature-flags.yaml`, `seed-roles.json`
- Numeric values that represent prices, limits, durations, or thresholds must
  include a unit comment or a companion doc — `30` is meaningless;
  `30 // seconds` or `30 // requests-per-minute` is reviewable
- Use consistent key naming: `camelCase` for JSON / YAML keys, `snake_case`
  for SQL seed data
- No orphaned entries — every config entry must be referenced by code or
  another config file. Dead config rots quickly
- Version a config file (or the surrounding directory) when a breaking schema
  change ships. Include a migration note in the commit message and the ADR
- Provide sensible defaults for optional fields; required fields fail loudly
  when missing
- Secrets never appear in committed config. Use environment variables, a
  secret manager, or a per-env override file that is gitignored
- Multi-tenant config: never bake tenant-specific values into shared config.
  Per-tenant overrides live in the database, not in a file

## Examples

**Correct** (`pricing-tiers.json`):

```json
{
  "free": {
    "monthlyPriceUsd": 0,
    "seatLimit": 3,
    "apiCallsPerMonth": 10000,
    "supportTier": "community"
  },
  "pro": {
    "monthlyPriceUsd": 49,
    "seatLimit": 25,
    "apiCallsPerMonth": 1000000,
    "supportTier": "business-hours"
  }
}
```

Validated at startup with a Zod schema; every numeric value has a clear unit
in its key name (`monthlyPriceUsd`, `apiCallsPerMonth`).

**Incorrect** (`pricing.json`):

```json
{
  "Pro": { "p": 49, "l": 25 }
}
```

Violations: uppercase key, opaque field names, no documented unit, no schema
validation possible from these names alone.
