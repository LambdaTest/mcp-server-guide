# TestMu AI

Run, debug and triage tests on the TestMu AI (formerly LambdaTest) cloud from Antigravity, using natural language.

This plugin bundles:

- **The TestMu AI MCP server**, a hosted server at `https://mcp.lambdatest.com/mcp`. Nothing is installed locally; you sign in with your TestMu AI account in the browser.
- **The Kane CLI skill** for browser and mobile test automation and AI test authoring.
- **The Rook CLI skill** for testing how AI agents behave before they ship.

## What you can do

| Tool | What it does |
|---|---|
| **HyperExecute** | Generates HyperExecute YAML and test runner commands, triggers jobs and reports their status. |
| **Automation** | Triages failed tests by pulling execution details, command logs, network logs and console errors into one place. |
| **SmartUI** | Explains visual regressions in plain English: pixel, layout, DOM and perceptual differences. |
| **Accessibility** | Runs WCAG audits on hosted URLs or local React apps and returns violations with remediation guidance. |
| **Test Manager** | Covers the test management lifecycle, from AI test case generation to recording results in bulk. |

| Skill | What it does |
|---|---|
| **`/kanecli-skill`** | Drives a real browser with Kane CLI: runs objectives in plain English, generates test cases from a description, designs requirement-linked suites from a spec, and runs mobile app tests on emulators, simulators or the TestMu AI cloud. |
| **`/rook-skill`** | Tests AI agents with Rook CLI: scenarios, profiles, verdicts and CI runs. |

## Requirements

- A [TestMu AI account](https://www.testmuai.com/).
- For the Kane CLI skill: Node.js 18+ and Kane CLI (`npm install -g @testmuai/kane-cli`). The skill checks this and offers to install it.
- For the Rook CLI skill: Rook CLI ([installation](https://github.com/LambdaTest/rook#install)).

## Sign in

The MCP server uses OAuth. The first time Antigravity connects to it, you are asked to sign in to TestMu AI in your browser. No API keys are stored in configuration files.

If the server shows as unauthorized, open **Customizations > MCP Servers**, select **Authenticate** next to `testmu-ai`, and finish the sign-in in your browser.

Kane CLI and Rook CLI have their own sign-in (`kane-cli login`, `rook login`). The skills walk you through it when needed.

## Example prompts

```
My last automation build failed. Pull the console and network logs and tell me why.
```

```
Generate a HyperExecute YAML for my Playwright TypeScript tests and run it.
```

```
Summarize the SmartUI visual differences in my latest build.
```

```
Run an accessibility audit on https://staging.example.com and list WCAG violations by severity.
```

```
Use Kane CLI to open my app's login page, sign in and confirm the dashboard loads.
```

## Troubleshooting

**The MCP server shows "Unauthorized".** Select **Authenticate** for `testmu-ai` under **Customizations > MCP Servers** and complete the browser sign-in. To switch accounts, select **Sign out** first.

**`kane-cli` or `rook` is not found.** Install the CLI (see Requirements) and make sure it is on the `PATH` that Antigravity uses.

## Links

- [TestMu AI MCP server documentation](https://www.testmuai.com/support/docs/testmu-mcp-server/)
- [Product overview](https://www.testmuai.com/mcp/)
- [Kane CLI](https://github.com/LambdaTest/kane-cli)
- [Support](https://www.testmuai.com/support/)
- [Privacy Policy](https://www.testmuai.com/legal/privacy/)
