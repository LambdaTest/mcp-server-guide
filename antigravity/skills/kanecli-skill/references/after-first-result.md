# After the first result: three choices, then save

> Moved here from SKILL.md so the main skill file stays within the size Antigravity loads. Content unchanged.

On a first session only, right after the first result card, save the defaults this run used, then ask the three choices from `references/first-run.md` §4 (watch mode, where results go, one-off or saved suite) as the **last thing in your turn**, and save the answers when they arrive. Some hosts hand control back before the person answers: end your turn there and save on their reply. On every later session none of this is asked again.

**The live status strip (Claude Code only) has its own once-only question.** Onboarding is shared by every agent the person uses, but the strip exists only in Claude Code, so the person may have finished their first session in another agent without ever being asked. In Claude Code, in **any** session: if the preflight's `## agent-config` has no `strip.claude-code.offered_at`, kane-cli is 0.8.17 or newer, and `node=` is not empty, ask the strip question once, after that session's first result card, as the last thing in your turn. On a first session it simply rides along as the fourth choice. It is recommended, never turned on without a yes, and you record `offered_at` either way so it is never asked twice. **Read `references/live-strip.md` §3** for the wording.
