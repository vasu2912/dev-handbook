import { readFile, writeFile } from "node:fs/promises";
import { standaloneArt } from "./anatomy.mjs";
const inventory = JSON.parse(
  await readFile(new URL("./anatomy-inventory.json", import.meta.url), "utf8"),
);
for (const item of inventory)
  if (item.asset)
    await writeFile(
      new URL("../../public" + item.asset, import.meta.url),
      standaloneArt(item.id) + "\n",
    );
console.info(
  `Regenerated ${inventory.filter((item) => item.asset).length} standalone Anatomy assets.`,
);
