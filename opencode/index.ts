// TestMu AI plugin for OpenCode 1 and 2.
// Adds the hosted TestMu AI MCP server (browser OAuth sign-in) and the
// Kane CLI and Rook CLI skills. No runtime dependencies.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_NAME = "testmu-ai";
const SERVER_URL = "https://mcp.lambdatest.com/mcp";
const HERE = dirname(fileURLToPath(import.meta.url));

// The published package carries a copy of skills/ (made by copy-skills.mjs at
// pack time). In the repository the plugin reads the shared skills/ folder.
const SKILLS_DIR = [join(HERE, "skills"), join(HERE, "..", "skills")].find((dir) => existsSync(dir)) ?? join(HERE, "skills");

// True when a configured server already points at the TestMu AI MCP endpoint,
// whatever it is named (for example "lambdatest").
function isTestMuServer(config: unknown): boolean {
  const url = (config as { url?: unknown } | undefined)?.url;
  if (typeof url !== "string") return false;
  try {
    const a = new URL(url);
    const b = new URL(SERVER_URL);
    return a.host.toLowerCase() === b.host && a.pathname.replace(/\/+$/, "") === b.pathname;
  } catch {
    return false;
  }
}

type SkillFile = { name: string; description: string; path: string; body: string };

// Reads name and description from a SKILL.md front matter without a YAML library.
function readSkill(path: string): SkillFile {
  const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const fence = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const lines = (fence ? fence[1] : "").split("\n");
  const field = (key: string): string => {
    const index = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (index === -1) return "";
    const value = lines[index].slice(key.length + 1).trim();
    if (/^[|>]-?$/.test(value)) {
      const block: string[] = [];
      for (const line of lines.slice(index + 1)) {
        if (line.trim() !== "" && !/^\s/.test(line)) break;
        block.push(line.trim());
      }
      return block.join(value.startsWith(">") ? " " : "\n").trim();
    }
    return value.replace(/^(["'])([\s\S]*)\1$/, "$2");
  };
  return {
    name: field("name"),
    description: field("description"),
    path,
    body: fence ? raw.slice(fence[0].length).trim() : raw.trim(),
  };
}

function listSkills(): SkillFile[] {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(SKILLS_DIR, entry.name, "SKILL.md")))
    .map((entry) => readSkill(join(SKILLS_DIR, entry.name, "SKILL.md")))
    .filter((skill) => skill.name !== "");
}

export default {
  id: "testmu-ai",

  // OpenCode 1 calls server(); the config hook edits the loaded config.
  async server() {
    return {
      async config(input: Record<string, any>) {
        input.mcp ??= {};
        if (!input.mcp[SERVER_NAME] && !Object.values(input.mcp).some(isTestMuServer)) {
          input.mcp[SERVER_NAME] = { type: "remote", url: SERVER_URL, oauth: {} };
        }

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

  // OpenCode 2 calls setup(); the same MCP server and skills go through the
  // plugin context.
  async setup(ctx: any) {
    await ctx.mcp.transform((editor: any) => {
      const servers: [string, unknown][] = editor.list();
      if (!editor.get(SERVER_NAME) && !servers.some(([, config]) => isTestMuServer(config))) {
        editor.set(SERVER_NAME, { type: "remote", url: SERVER_URL, oauth: {} });
      }
    });

    const skills = listSkills();
    await ctx.skill.transform((editor: any) => {
      for (const skill of skills) {
        if (editor.get(skill.name)) continue;
        editor.add({
          id: skill.name,
          name: skill.name,
          description: skill.description,
          path: skill.path,
          content: skill.body,
        });
      }
    });
  },
};
