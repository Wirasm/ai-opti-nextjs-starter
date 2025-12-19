---
description: Deep root cause analysis - finds the actual cause, not just symptoms
argument-hint: <issue|error|stacktrace> [quick]
---

<objective>
Find the **actual root cause** of: $ARGUMENTS

Not symptoms. Not intermediate failures. The specific code, config, or logic that, if changed, would prevent this issue.

**The Test**: "If I changed THIS, would the issue be prevented?" If the answer is "maybe" or "partially", keep digging.

**Mode**: If input ends with "quick" → surface scan (2-3 Whys). Otherwise → deep analysis (5+ Whys with git history).
</objective>

<context>
Project structure: !`ls -la src/`
Recent commits: !`git log --oneline -10`
Current branch: !`git branch --show-current`
</context>

<process>

## Phase 1: CLASSIFY - Parse the Input

**Determine input type:**

| Type | Description | Action |
|------|-------------|--------|
| RAW_SYMPTOM | Vague description, error message, stack trace | INVESTIGATE - form hypotheses, test them |
| PRE_DIAGNOSED | Already identifies location/problem | VALIDATE - confirm diagnosis, check for related issues |

**EXTRACT from input:**
- Stack trace → error type, message, call chain
- Error message → system, error code, context
- Vague description → what's actually being claimed
- Pre-diagnosis → claimed cause and affected code

**RESTATE** the symptom in one sentence: What is actually failing?

---

## Phase 2: HYPOTHESIZE - Generate Candidates

**Form 2-4 hypotheses** about what could cause this:

| # | Hypothesis | Would Need to Be True | Evidence to Confirm/Refute |
|---|------------|----------------------|---------------------------|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |

**RANK** by likelihood. Start with most probable.

---

## Phase 3: INVESTIGATE - The 5 Whys

Execute 5 Whys on your leading hypothesis:

```
WHY 1: Why does [symptom] occur?
→ BECAUSE: [intermediate cause A]
→ EVIDENCE: [file:line with actual code snippet]

WHY 2: Why does [cause A] happen?
→ BECAUSE: [intermediate cause B]
→ EVIDENCE: [proof - code, log, or test output]

WHY 3: Why does [cause B] happen?
→ BECAUSE: [intermediate cause C]
→ EVIDENCE: [proof]

WHY 4: Why does [cause C] happen?
→ BECAUSE: [intermediate cause D]
→ EVIDENCE: [proof]

WHY 5: Why does [cause D] happen?
→ ROOT_CAUSE: [specific code/config/logic]
→ EVIDENCE: [exact file:line reference with snippet]
```

**RULES:**
- Stop when you hit code you can change
- Every "BECAUSE" MUST have evidence - no speculation
- If evidence refutes hypothesis, pivot to next one
- If dead end, backtrack and try alternative branches

**EVIDENCE_STANDARDS (STRICT):**
| Valid | Invalid |
|-------|---------|
| `file.ts:123` with actual code snippet | "likely includes...", "probably because..." |
| Command output you actually ran | Logical deduction without code proof |
| Test you executed proving behavior | Explaining how technology works in general |

**If you cannot prove a step:**
1. Run a test/command to get proof, OR
2. Omit that step (skip to what you CAN prove)

---

## Phase 4: VALIDATE - Confirm Root Cause

Before declaring victory, verify:

| Test | Question | Pass? |
|------|----------|-------|
| CAUSATION | Does root cause logically lead to symptom through evidence chain? | |
| NECESSITY | If root cause didn't exist, would symptom still occur? | |
| SUFFICIENCY | Is root cause alone enough, or are there co-factors? | |

If any test fails → root cause is incomplete. Go deeper or broader.

---

## Mode-Specific Behavior

**QUICK mode** (input ends with "quick"):
- Limit to 2-3 Whys
- Accept high-confidence hypotheses without exhaustive validation
- Focus on single most likely path
- Skip git history analysis

**DEEP mode** (default):
- Full 5 Whys minimum
- Validate alternative hypotheses to rule them out
- Check for contributing factors and co-causes
- **REQUIRED**: Git history analysis with `git log` and `git blame`
- **REQUIRED**: Test at least one hypothesis with execution (not just reading)

---

## Investigation Techniques

**CRITICAL: Test, Don't Just Read**

Reading code = what it's supposed to do
Running code = what it actually does

| Issue Type | Techniques |
|------------|------------|
| Code bugs | Grep error messages, read full context, git blame, find working patterns elsewhere, **run with edge inputs** |
| Runtime issues | Check env/config, initialization order, race conditions, error handling |
| Integration issues | Trace data flow across boundaries, check type mismatches, verify assumptions |
| Regressions | `git log --oneline -20`, `git diff HEAD~10`, mental git bisect |

---

## Git History Analysis (DEEP mode only)

**REQUIRED** - Run these commands on affected files:

```bash
# When was problematic code introduced?
git log --oneline -10 -- <affected-file>

# Who wrote this specific line?
git blame -L <start>,<end> <affected-file>

# What changed recently?
git diff HEAD~10 -- <affected-file>
```

**Document:**
- Commit that introduced the issue
- Author and date
- Whether it's a regression, original bug, or long-standing issue

---

## Phase 5: GENERATE - Output Report

**Create directory**: `mkdir -p .agents/rca-reports`

**Find next number**: Check existing reports, use next available

**Save to**: `.agents/rca-reports/rca-report-{N}.md`

</process>

<output>
**OUTPUT_FILE**: `.agents/rca-reports/rca-report-{N}.md`

**REPORT_STRUCTURE**:

```markdown
# Root Cause Analysis

**Issue**: [One-line symptom description]
**Root Cause**: [One-line actual cause]
**Severity**: Critical | High | Medium | Low
**Confidence**: High | Medium | Low (based on evidence strength)

---

## Evidence Chain

### From Symptom to Cause

WHY: [Symptom occurs]
↓ BECAUSE: [First level cause]
  EVIDENCE: `file.ts:123` - [code snippet]

WHY: [First level cause]
↓ BECAUSE: [Second level cause]
  EVIDENCE: `file.ts:456` - [code snippet]

[...continue...]

↓ ROOT_CAUSE: [The fixable thing]
  EVIDENCE: `source.ts:789` - [problematic code]

### Alternative Hypotheses Ruled Out

| Hypothesis | Why Ruled Out |
|------------|---------------|
| ... | ... |

### Git History Context (deep mode)

- **Introduced**: [commit] - [message] - [date]
- **Author**: [who]
- **Recent changes**: [yes/no, when]
- **Classification**: Regression | Original Bug | Long-standing Issue

---

## Fix Specification

### What Needs to Change

- **File(s)**: [paths]
- **Logic change**: [what behavior must change]
- **Correct behavior**: [what it should do instead]

### Implementation Guidance

```typescript
// CURRENT (problematic):
[simplified example of what's wrong]

// REQUIRED (correct):
[simplified example of correct pattern]
```

### Key Considerations

- [Edge case or constraint]
- [Related code that might need updates]
- [Testing approach]

### Files to Examine

| File | Lines | Why |
|------|-------|-----|
| `path/to/file.ts` | 10-50 | [reason] |

---

## Verification

1. [Specific test to run]
2. [Expected outcome if fixed]
3. [How to reproduce original issue]
```

**REPORT_TO_USER**:
```
RCA Complete.

File: .agents/rca-reports/rca-report-{N}.md

Root Cause: [one-line summary]
Confidence: [High/Medium/Low]
Severity: [Critical/High/Medium/Low]

To fix: /fix-rca .agents/rca-reports/rca-report-{N}.md
```
</output>

<verification>
Before finalizing report:

- [ ] Root cause points to specific, changeable code (not vague concept)
- [ ] Every "BECAUSE" has concrete evidence with file:line
- [ ] No speculation words: "likely", "probably", "may", "might"
- [ ] Git history included (deep mode)
- [ ] At least one hypothesis tested with execution (deep mode)
- [ ] Fix specification is actionable
- [ ] Verification steps are executable
</verification>

<success_criteria>
**CAUSE_IDENTIFIED**: Root cause points to exact code/config that needs change
**EVIDENCE_BACKED**: Every step in chain has proof (not speculation)
**ACTIONABLE_FIX**: Fix specification enables immediate implementation
**TESTABLE**: Verification steps can confirm the fix works
</success_criteria>
