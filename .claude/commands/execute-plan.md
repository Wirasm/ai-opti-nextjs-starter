---
description: Execute an implementation plan step-by-step, validate, commit, and create PR
argument-hint: <path-to-plan.md>
---

<objective>
Execute the implementation plan at "$ARGUMENTS" by completing each task in order with immediate validation, then commit and create a PR.

**Core Principle**: Execute precisely what the plan specifies. No improvisation, no scope creep. Run to completion.

**Validation Rule**: After each task, run its VALIDATE command. If it fails, fix and retry until it passes.

**Completion Rule**: This command runs autonomously to completion. Always finish with a commit and PR.
</objective>

<context>
Plan file: @$ARGUMENTS
</context>

<process>

## Phase 1: Plan Validation

**Before starting, verify the plan is ready:**

- [ ] Plan file exists and is readable
- [ ] Mandatory Reading section has files that exist
- [ ] Tasks are ordered and each has a VALIDATE command
- [ ] Validation Commands section is complete

**Read the Mandatory Reading files first** - understand the patterns before implementing.

**If plan has issues**: Note them but proceed with best effort. Document issues in final report.

---

## Phase 2: Execute Tasks

**For each task in the Step-by-Step Tasks section:**

1. **READ** the task completely (IMPLEMENT, MIRROR, IMPORTS, GOTCHA, VALIDATE)
2. **MIRROR** the referenced pattern exactly
3. **IMPLEMENT** the specific changes described
4. **VALIDATE** immediately with the task's validate command
5. **FIX** any issues until validation passes, then proceed

**Task Execution Format:**

```
### Executing Task N: {ACTION} {target}

[Implementation work]

**Validation**: `{command}`
**Result**: PASS
```

**Recovery Strategy:**
- If validation fails → Fix the issue and retry until it passes
- If task is ambiguous → Use best judgment based on codebase patterns
- If unexpected error → Debug, fix, and continue

---

## Phase 3: Run Validation Levels

**After all tasks complete, run each validation level:**

### Level 1: Static Analysis
```bash
bun run lint && npx tsc --noEmit
```

### Level 2: Unit Tests
```bash
bun test
```

### Level 3: Full Suite
```bash
bun test && bun run build
```

### Level 4: Database Validation (if applicable)
Use Supabase MCP to verify schema, RLS, migrations.

### Level 5: Browser Validation (if applicable)
Use Browser MCP to verify UI, flows, forms.

### Level 6: Manual Validation
Execute manual validation steps from plan.

---

## Phase 4: Commit Changes

**Create atomic commit:**

```bash
git add -A
git commit -m "feat: {Feature name from plan}

- {Summary of what was implemented}
- {Key changes made}
"
```

**Commit message guidelines:**
- Use conventional commit prefix (feat/fix/refactor)
- Reference the feature name from the plan
- List key changes in bullet points

---

## Phase 5: Create Pull Request

**Create PR with comprehensive description:**

```bash
gh pr create --title "feat: {Feature name}" --body "## Summary
{Brief description of the feature}

## Changes
- {Change 1}
- {Change 2}

## Testing
- All validation levels passed
- {Specific tests added}

## Plan Reference
Executed from: $ARGUMENTS
"
```

**After PR creation**: Report the PR URL in the output.

</process>

<output>
**Execution Report:**

```markdown
# Execution Complete: {Feature Name}

## Summary
- Tasks completed: X/Y
- Validation levels passed: X/6
- PR created: {PR URL}

## Tasks Executed
- [x] Task 1: {description} - PASS
- [x] Task 2: {description} - PASS
...

## Validation Results
- [x] Level 1: Static Analysis - PASS
- [x] Level 2: Unit Tests - PASS
- [x] Level 3: Full Suite - PASS
- [x] Level 4: Database - PASS/SKIP
- [x] Level 5: Browser - PASS/SKIP
- [x] Level 6: Manual - PASS

## Files Changed
- `path/to/new.ts` - Created
- `path/to/existing.ts` - Modified

## Issues Encountered
{Any issues and how they were resolved, or "None"}

## Result
- Commit: {commit hash}
- PR: {PR URL}
- Status: COMPLETE
```
</output>

<verification>
Before reporting completion:

- [ ] All tasks from plan executed
- [ ] All task validations passed
- [ ] All validation levels passed (or skipped with reason)
- [ ] Acceptance criteria from plan verified
- [ ] Changes committed with descriptive message
- [ ] PR created with comprehensive description
</verification>

<success_criteria>
**Task Complete**: Every task executed with passing validation
**No Regressions**: Existing tests still pass
**Plan Faithful**: Implementation matches plan exactly
**Committed**: All changes committed with conventional commit message
**PR Created**: Pull request created with summary, changes, and testing notes
</success_criteria>
