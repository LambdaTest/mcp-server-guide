# Output streams of other kane-cli commands

> Moved here from SKILL.md so the main skill file stays within the size Antigravity loads. Content unchanged.

> Internal reference only. Never expose these field names to the user.

`kane-cli generate` (§6) emits a **different** stream — every line is typed `generate_*` (no untyped progress lines), terminated by `generate_done`. Its schema is in `references/generate-parsing.md`.

The assurance conversational commands (`context ingest`/`context extract`, `design tests`, `maintain reconcile`, `cover`) do NOT take `--agent` — they take **`--mode agent`** and speak their own typed stream ending in `done` (open vocabulary — tolerate unknown event types; on 0.7.2+ the stream is strict — every stdout line parses, stderr silent — while on 0.7.1 a merged `context ingest` prints a few prose receipt lines BEFORE the stream — skip to the first `{` line, harmless on 0.7.2+ — and a landing-phase ingest failure ends with prose + exit 1/2 and no stream at all: a refusal, not a crash; on 0.7.2+ those failures ride the stream as `error` + `done`); **for those commands only, exit `3` means paused-and-resumable, not timeout** — schema in `references/assurance-parsing.md`, behavior in `references/assurance.md`. The context sync verbs (`kane-cli context sync`, `kane-cli context push`, `kane-cli context pull`, `kane-cli context clone`; kane-cli 0.8.14+) take `--mode agent` the same way and speak a `sync_*` family ending in `done`; there too exit `3` means a decision or a pull is needed, not a failure — `references/context-sync.md`. `kane-cli context sync setup` refuses without a terminal (`TTY_REQUIRED`): agents use `kane-cli context sync add` and `kane-cli context clone`.

`kane-cli testrun run` also emits its own typed stream (`testrun_plan` … terminal `testrun_done`) — schema in `references/testrun.md`. `kane-cli testmd run` may additionally emit `test_md_evidence_ingest` (replay evidence published) and `test_md_bundle_sync` (test bundle synced) — informational; describe in plain language, never surface raw names. The post-run evidence hint (`` evidence: view locally with `kane-cli evidence serve <path>` ``) is a **stderr** text line, not a stdout event — don't try to parse it from the NDJSON stream; see `references/evidence.md` for how to act on it.

## Command-specific completion

The `run_end` parsing strategy applies to one-shot `run` only. For `testmd run`, collect `test_md_done.overall_status`, `duration_s`, `session_id`, and optional `share_url`; embedded `run_end` events can finish individual steps. Local suites emit `testrun_done`; dispatched remote suites then emit `remote_done` (retain `status`, `exit`, `sessions_path`). `generate` emits `generate_done`. Assurance conversational agent streams end in `done`; review/read verbs have their own contracts. Always check process exit too: early refusal, invalid plan or dry-run can exit without the normal completion event.

Progress is for live display: count only `done`/`failed` completions, retaining child and execution context when step indices repeat.
