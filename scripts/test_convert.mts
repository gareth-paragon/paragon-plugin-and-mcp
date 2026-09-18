import { convertFile, listProfilesEngine } from "../src/convert/engine.js";

async function main() {
  const profiles = await listProfilesEngine();
  console.log("profiles:", (profiles.profiles as unknown[])?.length ?? 0);
  const result = await convertFile({
    inputPath: "/tmp/paradocs-test/sample.pdf",
    outputPath: "/tmp/paradocs-test/sample-via-ts.md",
    overwrite: true,
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
