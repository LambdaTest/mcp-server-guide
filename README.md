# TestMu AI MCP Server

[![smithery badge](https://smithery.ai/badge/testmuai/testmu-mcp)](https://smithery.ai/servers/testmuai/testmu-mcp)

Run, debug, and triage tests using natural language, directly from your IDE.

The TestMu AI MCP Server connects any [MCP](https://modelcontextprotocol.io)-compatible client to the TestMu AI (formerly LambdaTest) platform — so you can orchestrate test runs, debug failures, analyze visual regressions, and run accessibility audits without leaving your editor or switching between dashboards.

> This repository is the setup guide and reference for the hosted MCP server. The server itself runs as a managed service at `https://mcp.lambdatest.com/mcp` — there is nothing to install or self-host.

---

## Tools

| Tool | What it does |
|---|---|
| **HyperExecute** | AI-native test orchestration. Generates HyperExecute YAML and test runner commands, triggers jobs, and reports status — no manual YAML authoring. |
| **Automation** | Triages test failures by pulling execution details, command logs, network logs, and console errors into one place for root-cause analysis. |
| **SmartUI** | Explains visual regressions in plain English — pixel, layout, DOM, and perceptual differences, summarized rather than eyeballed. |
| **Accessibility** | Runs WCAG and a11y audits against hosted URLs or local React apps, returning violations with remediation guidance. |
| **Test Manager** | Covers the test management lifecycle — AI test case generation through to bulk result recording. |

---

## Prerequisites

- A [TestMu AI account](https://www.testmuai.com/)
- An MCP-compatible client (see below)
- Node.js 18+ — only if your client needs the STDIO fallback

Authentication is handled over OAuth. On first connection your client opens a browser window to authorize against testmuai.com; no API keys need to be stored in config files.

---

## Setup

The server endpoint is:

```
https://mcp.lambdatest.com/mcp
```

### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

```json
{
  "mcpServers": {
    "mcp-lambdatest": {
      "url": "https://mcp.lambdatest.com/mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http mcp-lambdatest https://mcp.lambdatest.com/mcp
```

### VS Code / GitHub Copilot

Add to your MCP configuration:

```json
{
  "servers": {
    "mcp-lambdatest": {
      "type": "http",
      "url": "https://mcp.lambdatest.com/mcp"
    }
  }
}
```

### Claude Desktop and other STDIO-only clients

Clients that don't yet support remote HTTP transport can connect through `mcp-remote`:

```json
{
  "mcpServers": {
    "mcp-lambdatest": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.lambdatest.com/mcp"]
    }
  }
}
```

### Via Smithery

```bash
npm install -g smithery
smithery mcp add testmuai/testmu-mcp
```

---

## Supported clients

Cursor · Claude Code · Claude Desktop · GitHub Copilot · OpenAI Codex · Windsurf · Cline · Continue · Zed AI · JetBrains AI Assistant · Antigravity

Any client implementing the Model Context Protocol should work. Clients with native remote HTTP support connect directly; the rest use the `mcp-remote` fallback above.

---

## Example prompts

Once connected, ask your assistant things like:

```
Generate a HyperExecute YAML for my Playwright TypeScript tests and run it.
```

```
My last automation build failed — pull the console and network logs and tell me why.
```

```
Summarise the SmartUI visual differences in my latest build.
```

```
Run an accessibility audit on https://staging.example.com and list WCAG violations by severity.
```

---

## Troubleshooting

**Server doesn't appear after editing config**
Fully quit and reopen the client. Reloading the window is not enough for most clients to re-read MCP configuration.

**Config not being picked up**
Validate the JSON. A trailing comma or mismatched brace will cause the client to silently skip the entry.

**`npx` not found (STDIO fallback)**
Confirm Node.js is on your PATH — `which npx` on macOS/Linux, `where npx` on Windows. Some clients don't inherit your shell environment, so an absolute path to `npx` may be needed.

**Authentication loop or expired session**
Clear the stored authentication for this server in your client's MCP settings and reconnect to re-trigger the OAuth flow.

---

## Documentation

- [MCP Server documentation](https://www.testmuai.com/support/docs/testmu-mcp-server/)
- [Product overview](https://www.testmuai.com/mcp/)
- [Smithery listing](https://smithery.ai/servers/testmuai/testmu-mcp)

## Support

- [TestMu AI Support](https://www.testmuai.com/support/)
- Open an issue in this repository for problems with the setup guide itself

---

<p align="center">
  Built by <a href="https://www.testmuai.com/">TestMu AI</a> (formerly LambdaTest)
</p>
