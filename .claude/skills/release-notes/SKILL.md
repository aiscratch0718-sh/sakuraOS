---
name: release-notes
description: "Generate user-facing release notes from git history, sprint data, and internal changelogs. Translates developer language into clear, engaging user communication."
argument-hint: "[version] [--style brief|detailed|full]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
model: haiku
agent: customer-success-manager
---

## Phase 1: Parse Arguments

- `version`: the release version to generate notes for (e.g., `1.2.0`)
- `--style`: output style — `brief` (bullet points), `detailed` (with context), `full` (with developer commentary). Default: `detailed`.

If no version is provided, ask the user before proceeding.

---

## Phase 2: Gather Change Data

- Read the internal changelog at `production/releases/[version]/changelog.md` if it exists
- Also check `docs/CHANGELOG.md` for the relevant version entry
- Run `git log` between the previous release tag and current tag/HEAD as a fallback
- Read sprint retrospectives in `production/sprints/` for context
- Read any feature tradeoff change documents in `design/feature tradeoff/`
- Read bug fix records from QA if available

**If no changelog data is available** (neither `production/releases/[version]/changelog.md`
nor a `docs/CHANGELOG.md` entry for this version exists, and git log is empty or unavailable):

> "No changelog data found for [version]. Run `/changelog [version]` first to generate the
> internal changelog, then re-run `/release-notes [version]`."

Verdict: **BLOCKED** — stop here without generating notes.

---

## Phase 2b: Detect Tone Guide and Template

**Tone guide detection** — before drafting notes, check for writing style guidance:

1. Check `.claude/docs/technical-preferences.md` for any "tone", "voice", or "style"
 fields or sections.
2. Check `docs/PATCH-NOTES-STYLE.md` if it exists.
3. Check `design/brand/voice-and-tone.md` if it exists.
4. If any source contains tone/voice/style instructions, extract them and apply
 them to the language and framing of the generated notes.
5. If no tone guidance is found anywhere, default to:
 user-friendly, non-technical language; enthusiastic but not hyperbolic;
 focus on what the user experiences, not what the developer changed.

**Template detection** — check whether a release notes template exists:

1. Glob for `docs/release-notes-template.md` and `.claude/docs/templates/release-notes-template.md`.
2. If found at either location, read it and use it as the output structure for Phase 4
 instead of the built-in style templates (Brief / Detailed / Full). Fill in the
 template's sections with the categorized data.
3. If not found, use the built-in style templates as defined in Phase 4.

---

## Phase 3: Categorize and Translate

Categorize all changes into user-facing categories:

- **New Capabilities**: new features, integrations, exports, settings
- **Workflow Changes**: refinements to existing flows, threshold or limit changes
- **Quality of Life**: UI improvements, convenience features, accessibility
- **Bug Fixes**: grouped by area (auth, billing, dashboard, exports, integrations, etc.)
- **Performance**: optimization improvements users might notice
- **Known Issues**: transparency about unresolved problems

Translate developer language to user language:

- "Refactored discount calculation pipeline" → "Improved discount accuracy on multi-line invoices"
- "Fixed null reference in invoice export" → "Fixed a crash when exporting an empty invoice"
- "Reduced query count on dashboard load" → "Dashboard loads noticeably faster"
- Remove purely internal changes that don't affect users
- Preserve specific numbers for visible threshold / limit changes (per-tenant rate limit: 100/min → 200/min)

---

## Phase 4: Generate Release Notes

### Brief Style
```markdown
# Patch [Version] — [Title]

**New**
- [Feature 1]
- [Feature 2]

**Changes**
- [Feature Tradeoff/mechanic change with before → after values]

**Fixes**
- [Bug fix 1]
- [Bug fix 2]

**Known Issues**
- [Issue 1]
```

### Detailed Style
```markdown
# Patch [Version] — [Title]
*[Date]*

## Highlights
[1-2 sentence summary of the most exciting changes]

## New Content
### [Feature Name]
[2-3 sentences describing the feature and why users should be excited]

## User-facing behavior Changes
### Feature Tradeoff
| Change | Before | After | Reason |
| ---- | ---- | ---- | ---- |
| [Item/ability] | [old value] | [new value] | [brief rationale] |

### Mechanics
- **[Change]**: [explanation of what changed and why]

## Quality of Life
- [Improvement with context]

## Bug Fixes
### Core feature interaction
- Fixed [description of what users experienced]

### UI
- Fixed [description]

### Networking
- Fixed [description]

## Performance
- [Improvement users will notice]

## Known Issues
- [Issue and workaround if available]
```

### Full Style
Includes everything from Detailed, plus:
```markdown
## Developer Commentary
### [Topic]
> [Developer insight into a major change — why it was made, what was considered,
> what the team learned. Written in first-person team voice.]
```

---

## Phase 5: Review Output

Check the generated notes for:

- No internal jargon (replace technical terms with user-friendly language)
- No references to internal systems, tickets, or sprint numbers
- Feature Tradeoff changes include before/after values
- Bug fixes describe the user experience, not the technical cause
- Tone matches the product's voice (adjust formality based on product style)

---

## Phase 6: Save Release Notes

Present the completed release notes to the user along with: a count of changes by category, and any internal changes that were excluded (for review).

Ask: "May I write these release notes to `docs/release-notes/[version].md`?"

If yes, write the file to `docs/release-notes/[version].md`, creating the directory
if needed. Also write to `production/releases/[version]/release-notes.md` as the
internal archive copy.

---

## Phase 7: Next Steps

Verdict: **COMPLETE** — release notes generated and saved.

- Run `/release-checklist` to verify all other release gates are met before publishing.
- Share the release notes draft with the customer-success-manager for tone review before posting publicly.
