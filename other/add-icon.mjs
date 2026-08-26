/**
 * Adds one or more phosphor icons to the local SVG sprite.
 *
 *   node ./other/add-icon.mjs star heart truck
 *   node ./other/add-icon.mjs star-fill leaf-duotone caret-down-bold
 *
 * Icon names are phosphor icons from the iconify `ph` set (the same source
 * declared in other/sly/sly.json). Browse/search names at https://phosphoricons.com
 * — the URL slug is the name. Weight variants are separate icons: append
 * `-fill`, `-duotone`, `-light`, `-thin`, or `-bold` (regular has no suffix).
 *
 * Downloads each SVG into other/sly/icons, then regenerates
 * app/components/icons/{sprite.svg,name.d.ts}. Commit all three changes.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(here, "sly", "icons");
const names = process.argv.slice(2);

if (names.length === 0) {
  console.error("Usage: node ./other/add-icon.mjs <name> [<name> ...]");
  console.error("Example: node ./other/add-icon.mjs star truck heart-duotone");
  process.exit(1);
}

for (const name of names) {
  const res = await fetch(`https://api.iconify.design/ph/${name}.svg`);
  const svg = await res.text();
  if (!res.ok || !svg.includes("<svg")) {
    console.error(
      `✗ "${name}" was not found in the phosphor (ph) set.\n` +
        "  Check the exact slug (incl. weight suffix) at https://phosphoricons.com",
    );
    process.exit(1);
  }
  writeFileSync(join(iconsDir, `${name}.svg`), svg);
  console.log(`✓ fetched ${name}`);
}

await import("./build-icons.mjs");
