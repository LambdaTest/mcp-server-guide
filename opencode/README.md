# TestMu AI plugin for OpenCode

TestMu AI (Formerly LambdaTest) is an Agentic AI Quality Engineering platform that assures AI deployments across the enterprise and the real world. It runs agentic testing for web and mobile apps on 3,000+ browsers and 50,000+ real devices, and for chat, voice, IVR, video, and image agents.

This plugin brings TestMu AI into [OpenCode](https://opencode.ai). One line in your config adds:

- **The TestMu AI MCP server**, hosted at `https://mcp.lambdatest.com/mcp`. Run, debug and triage tests on the TestMu AI cloud: HyperExecute, web automation logs, SmartUI visual testing, accessibility scans and Test Manager. Nothing is installed locally; you sign in with your TestMu AI account in the browser.
- **The Kane CLI skill** for browser and mobile test automation and test authoring from natural-language objectives.
- **The Rook CLI skill** for testing how AI agents behave before they ship.

## Install

Add the plugin to `opencode.json` (project) or `~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@testmuai/opencode-plugin"]
}
```

OpenCode installs it on the next start. The plugin supports OpenCode 1 (1.19.3 or newer) and OpenCode 2 (2.3.2 or newer).

## Sign in

The MCP server uses OAuth. The first time OpenCode connects to it, sign in to TestMu AI in your browser, or run:

```bash
opencode mcp auth testmu-ai
```

No API keys are stored in your config. If your config already has the TestMu AI MCP server (under any name, matched by its URL), the plugin leaves it as it is and doesn't add a second one.

The skills call their own CLIs, which have their own sign-in:

- Kane CLI: `npm install -g @testmuai/kane-cli`, then `kane-cli login`
- Rook CLI: see the [Rook install guide](https://github.com/LambdaTest/rook#install), then `rook login`

## Example prompts

```
My last automation build failed. Pull the console and network logs and tell me why.
```

```
Generate a HyperExecute YAML for my Playwright TypeScript tests and run it.
```

```
Use Kane CLI to open my app's login page, sign in and confirm the dashboard loads.
```

```
Use Rook to test the refund agent in this repository against its refund policy.
```

## Links

- [TestMu AI MCP server documentation](https://www.testmuai.com/support/docs/testmu-mcp-server/)
- [Kane CLI](https://github.com/LambdaTest/kane-cli)
- [Rook](https://github.com/LambdaTest/rook)
- [Support](https://www.testmuai.com/support/)
