---
description: Execute an implementation plan step-by-step with validation at each task
argument-hint: <path-to-plan.md>
---

<objective>
Execute the implementation plan at "$ARGUMENTS" by completing each task in order with immediate validation.

**Core Principle**: Execute precisely what the plan specifies. No improvisation, no scope creep.

**Validation Rule**: After each task, run its VALIDATE command. If it fails, fix before proceeding.
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

**CHECKPOINT**: If plan is incomplete or files are missing, STOP and report issues.

---

## Phase 2: Execute Tasks

**For each task in the Step-by-Step Tasks section:**

1. **READ** the task completely (IMPLEMENT, MIRROR, IMPORTS, GOTCHA, VALIDATE)
2. **MIRROR** the referenced pattern exactly
3. **IMPLEMENT** the specific changes described
4. **VALIDATE** immediately with the task's validate command
5. **FIX** any issues before moving to next task

**Task Execution Format:**

```
### Executing Task N: {ACTION} {target}

[Implementation work]

**Validation**: `{command}`
**Result**: PASS | FAIL
**Issues**: {if any}
```

**STOP CONDITIONS:**
- Validation fails and cannot be fixed → Report and await guidance
- Task is ambiguous or missing information → Report and await guidance
- Unexpected error or conflict → Report and await guidance

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

## Phase 4: Completion

**Verify all acceptance criteria are met:**
- Review each criterion from the plan
- Check the box only if truly complete

**Run the Completion Checklist:**
- All tasks completed in order
- Each validation level passed
- No regressions introduced

</process>

<output>
**Execution Report:**

```markdown
# Execution Complete: {Feature Name}

## Summary
- Tasks completed: X/Y
- Validation levels passed: X/6
- Time spent: {if trackable}

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

## Next Steps
- Run `/commit` to commit changes
- Create PR if ready
```
</output>

<verification>
Before reporting completion:

- [ ] All tasks from plan executed
- [ ] All task validations passed
- [ ] All validation levels passed (or skipped with reason)
- [ ] Acceptance criteria from plan verified
- [ ] No uncommitted work that should be included
</verification>

<success_criteria>
**Task Complete**: Every task executed with passing validation
**No Regressions**: Existing tests still pass
**Plan Faithful**: Implementation matches plan exactly
**Ready to Commit**: All changes are complete and validated
</success_criteria>
