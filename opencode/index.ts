// TestMu AI plugin for OpenCode 1.
// Adds the hosted TestMu AI MCP server (browser OAuth sign-in) and the
// Kane CLI and Rook CLI skills. No runtime dependencies.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_NAME = "testmu-ai";
const SERVER_URL = "https://mcp.lambdatest.com/mcp";
const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), "skills");

export default {
  id: "testmu-ai",

  async server() {
    return {
      // Runs once the config is loaded. An existing "testmu-ai" MCP entry in
      // the user's config is left as it is.
      async config(input: Record<string, any>) {
        input.mcp ??= {};
        input.mcp[SERVER_NAME] ??= { type: "remote", url: SERVER_URL, oauth: {} };

        // OpenCode 1 reads extra skill folders from `skills.paths`.
        if (Array.isArray(input.skills)) {
          if (!input.skills.includes(SKILLS_DIR)) input.skills.push(SKILLS_DIR);
        } else {
          if (!input.skills || typeof input.skills !== "object") input.skills = {};
          input.skills.paths ??= [];
          if (!input.skills.paths.includes(SKILLS_DIR)) input.skills.paths.push(SKILLS_DIR);
        }
      },
    };
  },
};
