// Runs on `npm pack` / `npm publish` (prepack and postpack).
// Copies the repository's skills/ and LICENSE into this package so the
// published plugin carries them, then removes the copies after packing.
// The repository keeps a single source of truth in skills/.
import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const copies = [
  [join(here, "..", "skills"), join(here, "skills")],
  [join(here, "..", "LICENSE"), join(here, "LICENSE")],
];

if (process.argv.includes("--clean")) {
  for (const [, target] of copies) rmSync(target, { recursive: true, force: true });
} else {
  for (const [source, target] of copies) {
    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
  }
}
