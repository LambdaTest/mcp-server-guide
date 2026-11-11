# Generate test cases (authoring, no browser)

> Moved here from SKILL.md so the main skill file stays within the size Antigravity loads. Content unchanged.

`kane-cli generate` authors **Test Scenarios → Test Cases** from a plain-language description. It does **not** drive a browser. **Use it whenever a task needs quick test cases or scenarios from a description — don't hand-author them in chat or a file.** (Requirement documents + coverage accounting → assurance instead: `references/assurance.md`.) Reach for it to: turn a feature / requirement description into a test suite; expand or refine coverage (more edge cases, negative paths, a narrower focus); or save the Functional cases as runnable `_test.md` and hand them to `kane-cli testmd run`. Full details + event schema: **Read `references/generate.md`**.

Three explicit modes, each runs **one turn then exits**:

| Mode | Command |
|---|---|
| **New** | `kane-cli generate "<what to test>" --agent` |
| **Refine** | `kane-cli generate "<change>" --refine --req <id> --agent` |
| **Save** | `kane-cli generate --save --req <id> --agent` → writes runnable `_test.md` |

**Launch + present** — same as §1: use `Bash` (not Monitor), emit "Generating test cases…" before launch, then parse the output when it returns. Generate is a **quick single turn** — it exits on its own at `generate_done`.

**After Bash returns**, parse the NDJSON and present only what matters:

| Show | Event | How |
|------|-------|-----|
| **The deliverable** | `generate_snapshot` | Present scenarios + cases (see below) |
| **Clarifications** | `generate_clarification` | Surface the question — it needs an answer |
| **Save results** | `generate_save_result` | List files written |
| **Errors** | `error` | Surface the message |
| **Skip everything else** | `generate_thinking`, `generate_progress`, `generate_chat`, `generate_start` | Noise — don't narrate |

At `generate_done`, **present the result adaptively**:
- **≤ ~30 cases** → a nested tree: each scenario, then its cases tagged Positive / Negative / Edge.
- **more than that** → a summary line + a bulleted scenario list (title + case count); expand a scenario's cases only when asked.

Then offer the next commands from the terminal line's Refine / Save hints (they carry the request id) — don't hand-build them.

**Clarification → refine (do not skip):** if the turn ends with a clarification, that's **exit 0 — not an error**. Act on it: answer it yourself, or ask your own user, then **re-invoke** `kane-cli generate "<answer>" --refine --req <id> --agent`. Never drop a clarification.

**Attach files:** `--files a,b,c` adds local files (docs / images / PDF / CSV — up to 10, ≤ 50 MB each) as generation context on a **new** or **`--refine`** turn (not `--save`); each emits a `generate_upload` line before `generate_start`. Details in `references/generate.md`.

**Save is Functional-only:** `--save` writes only **Functional** cases to `_test.md` (under `<cwd>/.testmuai/tests` by default). Non-functional cases (Security, Performance, …) are generated and shown but not saved. Run saved files with **`kane-cli testmd run`** (`references/testmd.md`) — that's the generate → testmd pipeline.

Internal event/field names (`generate_snapshot`, `request_id`, …) are for parsing only — never show them to the user (§5 rule). Wire schema: `references/generate-parsing.md`.
