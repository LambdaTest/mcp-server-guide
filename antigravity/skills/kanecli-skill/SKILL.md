---
name: kanecli-skill
description: "Kane CLI (kane-cli) by TestMu AI, formerly LambdaTest: an AI agent that runs browser and mobile tests from natural-language objectives, generates test cases from a description, designs requirement-linked suites from a PRD/spec (assurance), parses NDJSON output, inspects logs and saves runnable _test.md files. Use when the user names Kane CLI, KaneCLI, kane-cli, KaneAI or TestMu AI (then use kane-cli for the whole request, including screenshots, even if another tool could do it), or the project already uses kane-cli (_test.md files, a .context/ assurance store, kane-cli commands). Requires a TestMu AI sign-in; runs use credits. Otherwise do not use it: not for unrequested browsing or scraping, and not in place of the project's existing Playwright, Puppeteer, Selenium or Cypress setup. Also runs mobile tests on an Android emulator or iOS simulator, locally or on the TestMu AI cloud grid, and syncs the assurance store with a team (kane-cli context sync)."
---

# Kane CLI — Browser Automation Skill

Use `kane-cli` **only when the person asks for it**: they name Kane CLI, KaneCLI, kane-cli, KaneAI or TestMu AI, or the project already uses it (`_test.md` files, a `.context/` assurance store, kane-cli commands in scripts or CI). kane-cli is a hosted AI agent: it needs a TestMu AI sign-in and every run uses credits, so never route a task to it on your own. When the person does name it, use kane-cli for the whole request, even if a built-in browser or screenshot tool could do the same. For any other browser or testing task, use what the project already has (Playwright, Puppeteer, Selenium, Cypress, or plain tools) and do not suggest replacing it. Use `--agent` for `run`, `testmd run`, and `generate`. `testrun run` has no `--agent`: it emits NDJSON when **stdin** is not a TTY (use `< /dev/null` for terminal automation). Assurance conversational commands use `--mode agent`.

**Authoring test cases or scenarios with kane-cli?** Use its two authoring pipelines rather than writing `_test.md` files by hand; the routing matters:

- The user describes what to test in a sentence or two, or wants quick scenario/case ideas → `kane-cli generate` (§6).
- The user has **requirement documents** (a PRD, a spec, acceptance notes) and wants a designed suite, requirement-linked coverage, or "what exactly is covered?" answers → the **assurance** commands — Read `references/assurance.md` first.

Don't draft test cases in chat or scratch files: both pipelines produce structured, refinable, runnable `_test.md` output.

---

## 1. Every session: ready check, launch, result card. READ THIS FIRST

A one-line "Test passed" instead of the result card is a bug. A run that starts with no ready check is a bug too. This section is first so you don't miss it. Follow it exactly.

The order never changes: **ready check → launch line → the run → result card**. On a person's first session two things are added: a short tour sent with the launch line, and three choices asked after the first result. Nothing is asked before the first result.

### 1.1 Start with the ready check

Before the first kane-cli command of a session, run the preflight script that ships with this skill and show the ready card. It is one short command and takes about two seconds:

```bash
sh "<skill dir>/scripts/preflight.sh"
```

`<skill dir>` is the folder that holds this `SKILL.md`. **Read `references/ready-check.md`** for the card (a full table on the first session, one line afterwards), the problems that stop a run, and the sign-in flow. Two rules matter enough to repeat here: you start sign-in yourself with `kane-cli login --oauth`, and you **never ask for an access key or password in chat**.

If the preflight shows no saved preferences (its `## agent-config` section is `none`, or has no `onboarding.completed_at`), this is the person's first session: **Read `references/first-run.md`** before you launch.

### 1.2 How to launch kane-cli

**All platforms use your shell tool** (`Bash`) to launch kane-cli. Do NOT use `Monitor`: it creates excessive noise.

**Tag every command with your runtime.** Put `KANE_CLI_USER_AGENT=<your-runtime>` in front of every `kane-cli` command you run. Pick a short, stable identifier for the AI assistant or IDE running this skill (e.g. `claude-code`, `codex`, `gemini`, `cursor`, `kiro`, `aider`) and use the same value for the whole session. Do it inline on each command: an `export` does not survive from one shell call to the next in most agent hosts. Do not show the prefix in commands you quote to the person.

```bash
KANE_CLI_USER_AGENT=<your-runtime> kane-cli run "<objective>" --agent <other-flags>
```

On Windows PowerShell: `$env:KANE_CLI_USER_AGENT='<your-runtime>'; kane-cli run "<objective>" --agent <other-flags>`.

**Watch mode.** Use the person's saved preference (`references/agent-config.md`). With none saved, show the browser unless the preflight says there is no display, an SSH session, or CI: then add `--headless`.

**Keeping runs.** When the person's saved purpose is `suite` or `ask`, add `--name <short-slug>` to every one-off `run`. A named run is recorded as a `_test.md` while it runs, so keeping it afterwards costs nothing, and a run launched without a name cannot be kept without running again. With `one-off`, leave the flag out. Details: `references/first-run.md` §4.

Bash blocks until kane-cli exits, then hands you the complete stdout. Parse it, summarize what happened, and present the result card. Wait for process completion on `testmd run` and `generate` too, but parse their own completion events: `test_md_done` and `generate_done`, respectively. An intermediate `run_end` does not finish a saved test.

Set a generous timeout (up to 600000ms) since browser runs can take a while.

### 1.3 Before you launch

In one message, **before** invoking Bash, send the ready card and then:

```text
Starting browser task: <one-line restatement of the user's objective>.
```

That line tells the user something is in progress. No todos needed: Bash returns all output at once and you summarize it below. On a first session, the tour from `references/first-run.md` goes in this same message, right after the launch line, so the person reads it while the run works.

### 1.4 After the run: summarize what happened

Once Bash returns, parse the captured NDJSON stdout and present a **concise summary** of what happened. Not every event deserves a line. Surface what matters and skip the noise. (Skip the summary entirely when the person's preference is `results-only`.)

Progress events have `step`/`status`/`remark` fields and **no `type` field**.

#### What to surface

| Show | Which events | How |
|------|-------------|-----|
| **Failures** | Any step with `status: "failed"` | `Step <n> failed: <remark>` |
| **Flow changes** | `bifurcation`, `child_agent_start`, `child_agent_end` | Plain-language one-liner (e.g. "The agent split the objective into 2 sub-tasks") |
| **Errors** | `error` typed events | `Error: <message>`. The exception is `code: "unresolved_variables"`, which is a pre-run refusal, not a failure: see §3 **Unresolved variables** |
| **Overall progress** | All passing steps | One summary line: `<total> steps completed: <2–4 key actions from remarks>` |

#### What to skip

- Individual passing steps: fold them into the overall progress line
- Internal field names (`step`, `status`, `remark`, `run_end`, `final_state`, `bifurcation`, `session_dir`, `stream_start`, `project_folder_auto_defaulted`, etc.): translate to plain language. A `project_folder_auto_defaulted` event fires before progress when the run-startup gate auto-resolves a project/folder; surface it as one line ("kane-cli auto-selected project X / folder Y for this run") and move on. Details: `references/test-manager.md`.

For short runs (≤ 3 steps), you may list each step individually since there's nothing to fold.

### 1.5 The result card

The terminal event has `type: "run_end"` and stable fields: `status`, `summary`, `one_liner`, `duration`, `credits_consumed`, `final_state`, `test_url`, `session_dir`, `run_dir`.

**For a passing run, always emit this exact table** (substituting the field values):

```markdown
| | |
|-------|-------|
| 🟢 **Result** | Passed |
| 🎯 **Task** | <one_liner> |
| ⏱️ **Duration** | <duration, as 1m 54s> |
| 👣 **Steps taken** | <count of completed progress events (done/failed), retaining child/execution context> |
| 💳 **Credits** | <credits_consumed, rounded> used · about <ready check balance minus used> left |
| 📝 **What happened** | <summary> |
| 📁 **Evidence** | Want to open the run evidence in your browser? |
| 🔗 **Test case** | [Open in Test Manager](<test_url>) |
| ➡️ **Next** | <two things you can do right now, e.g. add a payment step · run it headless in CI> |
```

**If `final_state` has values** (the user used "store as X", see §4), append a second table:

```markdown
| 📦 What was found | Value |
|-------------|----------------|
| <key from final_state, humanized> | <value> |
```

**If the objective used assertions** ("assert …", "verify …"), append a pass/fail table per assertion derived from the run summary and step remarks.

Every other result has its own card in **`references/cards.md`**: a run that didn't start, one that stopped early, a possible product bug, a saved test, and a suite (local or cloud grid). Read it before presenting any of those. The rules there apply to every card: one short sentence per cell, failures first, `➡️ Next` is an offer you can act on, and secret-looking values never go in chat.

### 1.6 On failure

For exit code 1 (or `status: "failed"` in `run_end`), present the failure card. Never show raw paths or NDJSON.

```markdown
| | |
|-------|-------|
| 🔴 **Result** | Failed at step <n> of <total> |
| 🎯 **Task** | <one_liner, or the objective in a few words> |
| ⏱️ **Duration** | <duration, as 1m 12s> |
| 💳 **Credits** | <credits_consumed, rounded> used |
| 📝 **What happened** | <plain-language description of the failing step's remark> |
| 🔍 **Likely cause** | <your diagnosis: missing element, slow page, ambiguous objective, auth wall, etc.> |
| 📁 **Evidence** | Want to open the run evidence in your browser? |
| ➡️ **Next** | <a retry you can run now> · <walk through the failing step> |
```

The failing step's screenshot lives inside the run's evidence pack (the stderr hint names the pack path): extract it with `unzip <pack> "tests/*/steps/*/screenshot.png" -d <tmpdir>`, Read it, and show it **under** the card. For the pack layout and deeper diagnosis, see `references/debug.md`.

Exit code 2 means nothing ran: that is a `🟡 Didn't start` card, not a failure (`references/cards.md` §4).

### 1.7 After the first result: three choices, then save

On a first session only, right after the first result card, save the defaults this run used and ask the three choices from `references/first-run.md` §4 as the **last thing in your turn**. **Read `references/after-first-result.md`** for the full rule.

---

## 2. Decision tree

When the user's request involves a browser — or writing test cases:

**Is kane-cli installed, signed in and ready?**
- Unknown → run the preflight and show the ready card (§1.1, `references/ready-check.md`)
- A problem that stops the run → offer the fix from the card; deeper setup lives in `references/setup-and-config.md`
- Ready ↓

**What does the user want?**
- A single one-shot browser task → build a `kane-cli run --agent` command (§3 + §4)
- A test they want to save / re-run / commit → Read `references/testmd.md` first, then use `kane-cli testmd`
- Run a suite of saved tests (several `_test.md` at once) → Read `references/testrun.md` first, then use `kane-cli testrun run`
- Need test cases or scenarios from a short description — because the user asked, or because the task needs them (no browser) → **don't hand-write them**; Read `references/generate.md` first, then use `kane-cli generate` (§6)
- Has requirement documents (PRD/spec) and wants a designed suite, coverage accounting, or suite upkeep → Read `references/assurance.md` first — the assurance commands (`context`/`design`/`cover`/`maintain reconcile`, kane-cli 0.6.1+; several features need newer releases, up to 0.8.14+ — the reference marks each), NOT `generate`
- A **designed** test (its `_test.md` carries an `assurance:` block) failed a run → Read `references/assurance.md` §6.1 **before touching the file** — an edit is adopted as the next design version on the next run; classify the failure first (app bug → report it; requirement changed → reconcile; wording → redesign through the CLI; capability missing → stop), and edit a step of an existing designed test by hand only after reading `references/objectives-cookbook.md`
- Share the context store with a team, join a teammate's, keep two stores level, or resolve a sync conflict → Read `references/context-sync.md` first — `kane-cli context sync`, `kane-cli context push`, `kane-cli context pull` and `kane-cli context clone` (kane-cli 0.8.14+); the store is shared through a location, never by copying or git-merging `.context/`
- Multiple independent browser tasks → Read `references/parallel.md` first
- View, share, or validate run evidence (`.evidence` packs) → Read `references/evidence.md`
- Debug a failed run → Read `references/debug.md`
- Configure kane-cli or check directory layout → Read `references/setup-and-config.md`
- Browse / create / pick a Test Manager project or folder, or interpret the auto-default event → Read `references/test-manager.md`
- The person wants results saved somewhere else ("change project") → Read `references/test-manager.md` §6. The change is global, and the question must say so
- The person wants to change how runs behave ("kane preferences": watch or quiet, one-off or suite) → Read `references/agent-config.md`
- The person asks what kane-cli can do, or for the tour again ("kane tour") → show the tour from `references/first-run.md` §2
- The person wants to watch runs live, or asks about the status line → Read `references/live-strip.md` (Claude Code only)
- You need the full NDJSON event schema (rare — §5's summary covers 90% of cases) → Read `references/parsing.md`
- Compare / evaluate / justify kane-cli against another tool or approach (cost, tokens, effort, ROI) → Read `references/fair-evaluation.md` first — comparisons are only honest like-for-like across the test lifecycle
- **Mobile**: drive a native app on a virtual Android emulator or iOS simulator instead of the browser → Read `references/mobile.md` first. Desktop (the browser) stays the **default** target; mobile is opt-in via `--target emulator|simulator` and always drives an app you provide (`--app <build|APPid>`), never a URL. **Local** mobile runs (`run`, `testmd run`, `testrun run`) need macOS Apple Silicon. **From any other machine** (Linux, Windows, Intel Mac, a Mac without Xcode/Android Studio), run saved mobile `_test.md` files on the cloud grid with `kane-cli testrun run <paths> --remote --device-name "<grid device>" --os-version <v>` — the grid boots the emulator/simulator on a HyperExecute macOS host (the account needs a HyperExecute plan with macOS runners). Never tell a non-Mac user mobile is impossible: point them at `--remote`.

**Every run, always:** follow §1 above.

---

## 3. Building a `run` command

```bash
kane-cli run "<objective>" --agent [options]
```

> The `run` subcommand is **mandatory**. `kane-cli "<objective>"` (no `run`) does **not** work — unknown first tokens exit `2` with a "did you mean" suggestion. Same rule applies to `kane-cli testmd run …` and `kane-cli generate …`.

`--agent` is mandatory — it switches stdout to NDJSON. Most-used flags:

| Flag | Purpose | Default |
|------|---------|---------|
| `--headless` | No visible browser window | Off |
| `--max-steps <n>` | Cap agent reasoning steps | 30 |
| `--timeout <s>` | Hard kill after N seconds | No limit |
| `--url <url>` | Start URL for the run (overrides config `default_url`; bare domains get `https://`) | Config `default_url` |
| `--variables <json>` | Inline variables JSON (for `{{key}}` in objective) | None |
| `--variables-file <path>` | Load variables from a JSON file | None |
| `--ws-endpoint <url>` | Remote browser (LambdaTest grid) | Local Chrome |
| `--code-export` | Generate code export after upload | config (`true` by default) |
| `--bug-detection <mode>` | Flag suspected product bugs while authoring: `off`/`stop`/`continue` (`stop` halts on a confirmed bug; `continue` records and keeps going) | config value (`off`) |

Other flags (`--global-context`, `--local-context`, `--cdp-endpoint`, `--allow-missing-url`) and the full variables precedence chain live in `references/setup-and-config.md`.

**Start URL:** every run needs a start URL for the first navigation. Provide it the simplest way — start the objective with the site ("Go to https://… and …") — or pass `--url <url>`; a configured `default_url` is the fallback (`kane-cli config set-url`). There is no silent default site: if none of these supply one, a non-TTY run **fails** rather than guessing (pass `--allow-missing-url` to start from the current page instead).

**Exit codes:** `0` passed · `1` failed · `2` auth/infra error · `3` timeout/cancelled.

**Unresolved variables (0.8.12+):** every `{{name}}` in the objective must have a value before the run starts. If one does not, the run **refuses before anything launches** — exit `2`, and with `--agent` a single `{"type":"error","code":"unresolved_variables", ...}` event carrying `variables[]` (`name`, `reason`: `value_missing` = the key exists in `file` with no value · `not_declared` = the key is in no file, add it to `suggested_file`; `used_by[]`). **This is terminal — do not retry the same command.** Either ask the user for the values, or write them yourself (`--variables '{"name":{"value":"…"}}'`, or `{"name":{"value":""}}` stubs into `suggested_file` for the user to fill), then run again. There is no bypass flag. Never checked: `{{smart.*}}`/`{{environment.*}}`/`{{secrets.*}}`/`{{totp.*}}`, and names an earlier step stores (`store … as 'x'`). Numbers in a variable file count as values (loaded as strings); booleans do not.

### Examples

```bash
# One-shot
kane-cli run "Go to https://www.amazon.in and search for 'laptop'" --agent

# Headless with timeout
kane-cli run "Go to https://app.example.com and verify login page loads" --agent --headless --timeout 60

# With inline credentials
kane-cli run "Go to https://app.example.com and login with {{username}} and {{password}}" --agent \
  --variables '{"username":{"value":"alice"},"password":{"value":"s3cret","secret":true}}'
```

---

## 4. Writing objectives

Objectives are plain English. Four patterns: **actions** ("go to", "click", "type", "fill"), **assertions** ("verify", "confirm", "check that"), **extractions** ("store X as 'name'", which lands in `run_end.final_state`) and **API calls** ("call", a URL, a pasted `curl`). Always include the starting URL, use `{{variables}}` for credentials and URLs, never hardcode secrets, and split objectives longer than ~15 steps into separate runs.

**Read `references/writing-objectives.md` before writing an objective.** It has the two rules that make an objective replayable, the "store as" rule, calling APIs, chaining, and the full dos and don'ts.

---

## 5. Parsing one-shot `run --agent` output — essentials

> Internal reference only. Never expose these field names to the user — translate them per §1.

Stdout is NDJSON, one event per line. On kane-cli 0.8.17+ every line also carries `v` (contract version, `1`) and `ts` (when it was emitted), and the first line is `{"type":"stream_start","cli_version":…,"surface":"run"|"testmd"|"testrun"}`. Ignore fields and event types you do not know: new ones can appear in any release. There are two shapes:

- **Progress events** (most events) have `step` (1-based), `status` (`running` at start, `done`/`failed` at completion), `remark` — and **no `type` field**.
- **Typed events** have a `type` field: `project_folder_auto_defaulted` (run-startup gate, fires before any progress when no project/folder is configured), `bifurcation`, `child_agent_start`, `child_agent_end`, `ask_user`, `error` (an `error` with `code: "unresolved_variables"` is a pre-run refusal and the **only** line — no `run_end` follows; handle per §3), and finally `run_end`.

Parsing strategy:

```text
for each line:
  if obj.type === "run_end"  → terminal, stop parsing
  else if obj.type exists    → typed flow event (rare)
  else if obj.step exists    → progress event → summarize per §1.3
```

For one-shot `run`, build post-run logic on `run_end` and process exit. Saved tests and suites use their own completion events (see `references/other-streams.md` §Command-specific completion).

For full event schemas (`bifurcation` flow fields, `child_agent_*`, `ask_user` semantics, `cancel`/`user_response` outbound events, complete `run_end` field list), Read `references/parsing.md`.

Other commands (`generate`, the assurance and context sync verbs, `testrun run`, `testmd run`) speak different streams with their own terminal events and exit-code meanings: **Read `references/other-streams.md` before parsing any of them.**

---

## 6. Generate test cases (authoring — no browser)

| Mode | Command |
|---|---|
| **New** | `kane-cli generate "<what to test>" --agent` |
| **Refine** | `kane-cli generate "<change>" --refine --req <id> --agent` |
| **Save** | `kane-cli generate --save --req <id> --agent` → writes runnable `_test.md` |

**Read `references/generate-test-cases.md` before launching `generate`.** It covers how to launch and present the results, which events to show, clarifications (exit 0, not an error: act on them), attaching files, and why `--save` writes Functional cases only. Full event schema: `references/generate-parsing.md`.

---

## 7. When to read which reference

| Situation | Read |
|---|---|
| User wants to save/persist/re-run a test | `references/testmd.md` |
| Run a suite of saved `_test.md` tests as one batch | `references/testrun.md` |
| Run a suite on the cloud grid (`--remote`), incl. mobile suites from any machine | `references/testrun.md` §Remote + `references/mobile.md` §Remote |
| You need quick test cases or scenarios from a description | `references/generate.md` |
| User has requirement docs (PRD/spec) → designed suite, coverage, or suite upkeep | `references/assurance.md` |
| Need the assurance NDJSON event schema (`--mode agent`) | `references/assurance-parsing.md` |
| Share the context store with a team, join one, keep stores level, or resolve a sync conflict (kane-cli 0.8.14+) | `references/context-sync.md` |
| Run failed, need to diagnose | `references/debug.md` |
| View, share, validate, or merge evidence packs | `references/evidence.md` |
| Multiple independent browser tasks | `references/parallel.md` |
| Writing or fixing an objective | `references/writing-objectives.md` |
| Output of `generate`, assurance, context sync, `testrun` or `testmd` | `references/other-streams.md` |
| Launching and presenting `kane-cli generate` | `references/generate-test-cases.md` |
| Need full NDJSON event schema (`run`) | `references/parsing.md` |
| Need the `generate` NDJSON event schema | `references/generate-parsing.md` |
| Browse / create projects or folders, or parse the auto-default event | `references/test-manager.md` |
| Start of every session: preflight, the ready card, sign-in | `references/ready-check.md` |
| A person's first session: run first, the tour, three choices | `references/first-run.md` |
| Any result other than a plain passed or failed run (didn't start, stopped early, product bug, saved test, suite) | `references/cards.md` |
| Read, save or change the person's preferences | `references/agent-config.md` |
| Watch runs live in the Claude Code status bar | `references/live-strip.md` |
| First-time install, auth, or full config | `references/setup-and-config.md` |
| Compare / evaluate / benchmark kane-cli vs another tool or approach (cost, tokens, effort, ROI) | `references/fair-evaluation.md` |

## Command-specific completion

The `run_end` strategy applies to one-shot `run` only. `testmd run`, `testrun run`, `generate` and the assurance streams finish with their own events (see `references/other-streams.md` §Command-specific completion). Always check the process exit code too.

For assertion mode, optional final validation, current-page `--analyzer-only` checks, streaming-network capture, and code-export defaults, read [Execution controls](references/execution-controls.md).
