# Using TestMu AI with Strands Agents

Connect a [Strands Agents](https://strandsagents.com/) agent to the TestMu AI MCP Server so it can run, debug and triage tests in natural language across HyperExecute, Automation, Native App Automation, SmartUI, Accessibility and Test Manager.

## How it works

The TestMu AI MCP Server is a remote MCP server at `https://mcp.lambdatest.com/mcp`. It signs users in with OAuth. Strands connects to it through `mcp-remote`, which handles the OAuth sign-in in your browser and passes the server's tools to your agent.

## Prerequisites

- A TestMu AI account: https://www.testmuai.com/
- Node.js 18 or later (for `npx mcp-remote`)
- Python 3.10+ with `strands-agents`, or Node.js with `@strands-agents/sdk`
- Model provider credentials for Strands (Amazon Bedrock by default)

## Python

```bash
pip install strands-agents
```

```python
from mcp import stdio_client, StdioServerParameters
from strands import Agent
from strands.tools.mcp import MCPClient

testmu = MCPClient(lambda: stdio_client(
    StdioServerParameters(
        command="npx",
        args=["-y", "mcp-remote", "https://mcp.lambdatest.com/mcp"],
    )
))

agent = Agent(
    tools=[testmu],
    system_prompt=(
        "You are a testing assistant. Use the TestMu AI tools to look up "
        "test runs, logs, visual diffs and accessibility results."
    ),
)

agent("Why did my last HyperExecute job fail?")
```

## TypeScript

```bash
npm install @strands-agents/sdk @modelcontextprotocol/sdk
```

```typescript
import { Agent, McpClient } from '@strands-agents/sdk'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const testmu = new McpClient({
  transport: new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.lambdatest.com/mcp'],
  }),
})

const agent = new Agent({ tools: [testmu] })
await agent.invoke('Why did my last HyperExecute job fail?')
```

On first run a browser window opens. Sign in to TestMu AI and approve access. `mcp-remote` stores the token, so later runs don't ask again.

## What your agent can do

| Use case | What it does |
|---|---|
| Test orchestration with HyperExecute | Generate HyperExecute YAML and test runner commands, monitor jobs and fetch session details. |
| Automation failure triage | Pull execution data and command, network and console logs to find the root cause of a failed automation test. |
| Native app test debugging | Triage native mobile app tests on real or virtual devices. |
| Visual regression debugging | Get natural language summaries of pixel, layout, DOM and perceptual differences from SmartUI comparison runs. |
| Accessibility audits | Run accessibility checks on hosted URLs and get remediation guidance. |
| Test management | Generate test cases with AI, build test runs, record results in bulk, and track milestones and coverage. |

## Example prompts

- "Generate a HyperExecute YAML for my Selenium Java project."
- "Get the console and network logs for the failed test in my last build and tell me the likely cause."
- "Summarize the differences in my latest SmartUI comparison."
- "Run an accessibility check on https://example.com and list the critical issues."

## Resources

- TestMu AI MCP Server docs: https://www.testmuai.com/support/docs/testmu-mcp-server/
- MCP server on GitHub: https://github.com/LambdaTest/mcp-server-guide
- Strands MCP tools: https://strandsagents.com/docs/user-guide/sdk/tools/mcp-tools/
- Support: support@testmuai.com
