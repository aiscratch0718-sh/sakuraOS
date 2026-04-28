---
name: consistency-check
description: "Scan all PRDs against the entity registry to detect cross-document inconsistencies: same entity with different stats, same item with different values, same formula with different variables. Grep-first approach — reads registry then targets only conflicting PRD sections rather than full document reads."
argument-hint: "[full | since-last-review | entity:<name> | item:<name>]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# Consistency Check

Detects cross-document inconsistencies by comparing all PRDs against the
entity registry (`design/registry/entities.yaml`). Uses a grep-first approach:
reads the registry once, then targets only the PRD sections that mention
registered names — no full document reads unless a conflict needs investigation.

**This skill is the write-time safety net.** It catches what `/design-system`'s
per-section checks may have missed and what `/review-all-prds`'s holistic review
catches too late.

**When to run:**
- After writing each new PRD (before moving to the next system)
- Before `/review-all-prds` (so that skill starts with a clean baseline)
- Before `/create-architecture` (inconsistencies poison downstream ADRs)
- On demand: `/consistency-check entity:[name]` to check one entity specifically

**Output:** Conflict report + optional registry corrections

---

## Phase 1: Parse Arguments and Load Registry

**Modes:**
- No argument / `full` — check all registered entries against all PRDs
- `since-last-review` — check only PRDs modified since the last review report
- `entity:<name>` — check one specific entity across all PRDs
- `item:<name>` — check one specific item across all PRDs

**Load the registry:**

```
Read path="design/registry/entities.yaml"
```

If the file does not exist or has no entries:
> "Entity registry is empty. Run `/design-system` to write PRDs — the registry
> is populated automatically after each PRD is completed. Nothing to check yet."

Stop and exit.

Build four lookup tables from the registry:
- **entity_map**: `{ name → { source, attributes, referenced_by } }`
- **item_map**: `{ name → { source, value_gold, weight, ... } }`
- **formula_map**: `{ name → { source, variables, output_range } }`
- **constant_map**: `{ name → { source, value, unit } }`

Count total registered entries. Report:
```
Registry loaded: [N] entities, [N] items, [N] formulas, [N] constants
Scope: [full | since-last-review | entity:name]
```

---

## Phase 2: Locate In-Scope PRDs

```
Glob pattern="design/prd/*.md"
```

Exclude: `product-concept.md`, `systems-index.md`, `product-pillars.md` — these are
not system PRDs.

For `since-last-review` mode:
```bash
git log --name-only --pretty=format: -- design/prd/ | grep "\.md$" | sort -u
```
Limit to PRDs modified since the most recent `design/prd/prd-cross-review-*.md`
file's creation date.

Report the in-scope PRD list before scanning.

---

## Phase 3: Grep-First Conflict Scan

For each registered entry, grep every in-scope PRD for the entry's name.
Do NOT do full reads — extract only the matching lines and their immediate
context (-C 3 lines).

This is the core optimization: instead of reading 10 PRDs × 400 lines each
(4,000 lines), you grep 50 entity names × 10 PRDs (50 targeted searches,
each returning ~10 lines on a hit).

### 3a: Entity Scan

For each entity in entity_map:

```
Grep pattern="[entity_name]" glob="design/prd/*.md" output_mode="content" -C 3
```

For each PRD hit, extract the values mentioned near the entity name:
- any numeric attributes (counts, costs, durations, ranges, rates)
- any categorical attributes (types, tiers, categories)
- any derived values (totals, outputs, results)
- any other attributes registered in entity_map

Compare extracted values against the registry entry.

**Conflict detection:**
- Registry says `[entity_name].[attribute] = [value_A]`. PRD says `[entity_name] has [value_B]`. → **CONFLICT**
- Registry says `[item_name].[attribute] = [value_A]`. PRD says `[item_name] is [value_B]`. → **CONFLICT**
- PRD mentions `[entity_name]` but doesn't specify the attribute. → **NOTE** (no conflict, just unverifiable)

### 3b: Item Scan

For each item in item_map, grep all PRDs for the item name. Extract:
- sell price / value / gold value
- weight
- stack rules (stackable / non-stackable)
- category

Compare against registry entry values.

### 3c: Formula Scan

For each formula in formula_map, grep all PRDs for the formula name. Extract:
- variable names mentioned near the formula
- output range or cap values mentioned

Compare against registry entry:
- Different variable names → **CONFLICT**
- Output range stated differently → **CONFLICT**

### 3d: Constant Scan

For each constant in constant_map, grep all PRDs for the constant name. Extract:
- Any numeric value mentioned near the constant name

Compare against registry value:
- Different number → **CONFLICT**

---

## Phase 4: Deep Investigation (Conflicts Only)

For each conflict found in Phase 3, do a targeted full-section read of the
conflicting PRD to get precise context:

```
Read path="design/prd/[conflicting_gdd].md"
```
(Or use Grep with wider context if the file is large)

Confirm the conflict with full context. Determine:
1. **Which PRD is correct?** Check the `source:` field in the registry — the
 source PRD is the authoritative owner. Any other PRD that contradicts it
 is the one that needs updating.
2. **Is the registry itself out of date?** If the source PRD was updated after
 the registry entry was written (check git log), the registry may be stale.
3. **Is this a genuine design change?** If the conflict represents an intentional
 design decision, the resolution is: update the source PRD, update the registry,
 then fix all other PRDs.

For each conflict, classify:
- **🔴 CONFLICT** — same named entity/item/formula/constant with different values
 in different PRDs. Must resolve before architecture begins.
- **⚠️ STALE REGISTRY** — source PRD value changed but registry not updated.
 Registry needs updating; other PRDs may be correct already.
- **ℹ️ UNVERIFIABLE** — entity mentioned but no comparable attribute stated.
 Not a conflict; just noting the reference.

---

## Phase 5: Output Report

```
## Consistency Check Report
Date: [date]
Registry entries checked: [N entities, N items, N formulas, N constants]
PRDs scanned: [N] ([list names])

---

### Conflicts Found (must resolve before architecture)

🔴 [Entity/Item/Formula/Constant Name]
 Registry (source: [prd]): [attribute] = [value]
 Conflict in [other_gdd].md: [attribute] = [different_value]
 → Resolution needed: [which doc to change and to what]

---

### Stale Registry Entries (registry behind the PRD)

⚠️ [Entry Name]
 Registry says: [value] (written [date])
 Source PRD now says: [new value]
 → Update registry entry to match source PRD, then check referenced_by docs.

---

### Unverifiable References (no conflict, informational)

ℹ️ [prd].md mentions [entity_name] but states no comparable attributes.
 No conflict detected. No action required.

---

### Clean Entries (no issues found)

✅ [N] registry entries verified across all PRDs with no conflicts.

---

Verdict: PASS | CONFLICTS FOUND
```

**Verdict:**
- **PASS** — no conflicts. Registry and PRDs agree on all checked values.
- **CONFLICTS FOUND** — one or more conflicts detected. List resolution steps.

---

## Phase 6: Registry Corrections

If stale registry entries were found, ask:
> "May I update `design/registry/entities.yaml` to fix the [N] stale entries?"

For each stale entry:
- Update the `value` / attribute field
- Set `revised:` to today's date
- Add a YAML comment with the old value: `# was: [old_value] before [date]`

If new entries were found in PRDs that are not in the registry, ask:
> "Found [N] entities/items mentioned in PRDs that aren't in the registry yet.
> May I add them to `design/registry/entities.yaml`?"

Only add entries that appear in more than one PRD (true cross-system facts).

**Never delete registry entries.** Set `status: deprecated` if an entry is removed
from all PRDs.

After writing: Verdict: **COMPLETE** — consistency check finished.
If conflicts remain unresolved: Verdict: **BLOCKED** — [N] conflicts need manual resolution before architecture begins.

### 6b: Append to Reflexion Log

If any 🔴 CONFLICT entries were found (regardless of whether they were resolved),
append an entry to `docs/consistency-failures.md` for each conflict:

```markdown
### [YYYY-MM-DD] — /consistency-check — 🔴 CONFLICT
**Domain**: [system domain(s) involved]
**Documents involved**: [source PRD] vs [conflicting PRD]
**What happened**: [specific conflict — entity name, attribute, differing values]
**Resolution**: [how it was fixed, or "Unresolved — manual action needed"]
**Pattern**: [generalised lesson, e.g. "Pricing values defined in billing PRD were
not referenced in commercial PRD before authoring — always check entities.yaml first"]
```

Only append if `docs/consistency-failures.md` exists. If the file is missing,
skip this step silently — do not create the file from this skill.

---

## Next Steps

- **If PASS**: Run `/review-all-prds` for holistic design-theory review, or
 `/create-architecture` if all MVP PRDs are complete.
- **If CONFLICTS FOUND**: Fix the flagged PRDs, then re-run
 `/consistency-check` to confirm resolution.
- **If STALE REGISTRY**: Update the registry (Phase 6), then re-run to verify.
- Run `/consistency-check` after writing each new PRD to catch issues early,
 not at architecture time.
