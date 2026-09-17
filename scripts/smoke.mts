import { readAppHtml, resolveAppHtmlPath } from "../src/appsUi.js";
import { listCorpora, listDocs } from "../src/corpus.js";
import { searchDocs } from "../src/search.js";
import { getGovernanceAi02, getApprovedPluginsAndMcps, getGuidePage } from "../src/extracts.js";
import { getSettingsProfile, listSettingsProfiles } from "../src/paradocsSettings.js";

const inventory = listCorpora();
console.log("list_corpora:");
console.log(`  totalDocs: ${inventory.totalDocs}`);
for (const c of inventory.corpora) {
  const areas = c.areas
    ? ` areas=${JSON.stringify(c.areas)}`
    : "";
  console.log(
    `  ${c.id}: present=${c.present} docs=${c.docCount} kind=${c.kind}${areas}`,
  );
  console.log(`    root: ${c.root}`);
}

const docs = listDocs();
console.log(`\nDocs found: ${docs.length}`);
console.log(
  "By corpus:",
  Object.fromEntries(
    inventory.corpora.map((c) => [c.id, docs.filter((d) => d.corpus === c.id).length]),
  ),
);

const abbeySample = docs.find((d) => d.relativePath.startsWith("abbey-view/"));
const techSample = docs.find((d) => d.relativePath.startsWith("tech-arch/"));
if (abbeySample) {
  console.log(`Abbey sample: ${abbeySample.relativePath}`);
}
if (techSample) {
  console.log(`Tech-arch sample: ${techSample.relativePath}`);
}

const legacy = listDocs().find((d) => d.relativePath.startsWith("tech-arch/"));
if (legacy) {
  const viaLegacy = getGuidePage(`external/${legacy.relativePath}`);
  console.log(`Legacy external/ path OK: ${viaLegacy.relativePath}`);
}

const search = searchDocs("Team Marketplace", { corpus: "user-guide" });
console.log(`\nSearch "Team Marketplace": ${search.hits.length} hits (scanned ${search.scannedDocs})`);
for (const h of search.hits.slice(0, 5)) {
  console.log(`- ${h.relativePath} (${h.matchIn})`);
}

const abbeySearch = searchDocs("Abbey View", { corpus: "abbey-view" });
console.log(`\nSearch "Abbey View" in abbey-view: ${abbeySearch.hits.length} hits`);
for (const h of abbeySearch.hits.slice(0, 5)) {
  console.log(`- ${h.relativePath}: ${h.snippet.slice(0, 120)}`);
}

const cigna = searchDocs("Cigna", { corpus: "tech-arch" });
console.log(`\nSearch Cigna in tech-arch: ${cigna.hits.length} hits`);
for (const h of cigna.hits.slice(0, 5)) {
  console.log(`- ${h.relativePath}: ${h.snippet.slice(0, 120)}`);
}

const sample = abbeySample ?? techSample;
if (sample) {
  const page = getGuidePage(sample.relativePath);
  console.log(`\nget_doc ${page.relativePath}: ${page.text.length} chars, title=${page.title}, corpus=${page.corpus}`);
}

const plugins = getApprovedPluginsAndMcps();
console.log(`\nPlugins page chars: ${plugins.text.length}`);

const ai02 = getGovernanceAi02();
console.log(`AI02: ${ai02.relativePath} (${ai02.text.length} chars)`);

const abbeyCount = inventory.corpora.find((c) => c.id === "abbey-view")?.docCount ?? 0;
const techCount = inventory.corpora.find((c) => c.id === "tech-arch")?.docCount ?? 0;
const guidesCount = inventory.corpora.find((c) => c.id === "guides")?.docCount ?? 0;
const expectedAdminGuidePaths = [
  "admin-guide/Admin-Dashboard-Runbook.md",
  "admin-guide/AI02-Business-Use-of-Artificial-Intelligence.md",
  "admin-guide/Backup-Dashboard-Runbook.md",
  "admin-guide/Cursor-Docs-as-Code.md",
  "admin-guide/Cursor-Docs-Changelog.md",
  "admin-guide/Cursor-Security.md",
  "admin-guide/CursorAI-Administration.md",
  "admin-guide/TxQ-Overview-and-AWS-Serverless-Migration.md",
];
const adminGuidePaths = new Set(
  listDocs({ corpus: "admin-guide" }).map((doc) => doc.relativePath),
);
const missingAdminGuidePaths = expectedAdminGuidePaths.filter(
  (relativePath) => !adminGuidePaths.has(relativePath),
);
if (guidesCount < 20) {
  console.error(`FAIL: expected guides corpus, got ${guidesCount}`);
  process.exit(1);
}
if (missingAdminGuidePaths.length > 0) {
  console.error(
    `FAIL: admin-guide corpus is missing canonical pages: ${missingAdminGuidePaths.join(", ")}`,
  );
  process.exit(1);
}
if (abbeyCount < 500) {
  console.error(`FAIL: expected ~595 abbey-view docs, got ${abbeyCount}`);
  process.exit(1);
}
if (techCount < 3000) {
  console.error(`FAIL: expected ~3356 tech-arch docs, got ${techCount}`);
  process.exit(1);
}
if (abbeySearch.hits.length === 0) {
  console.error('FAIL: search_docs "Abbey View" returned no hits');
  process.exit(1);
}

const profileList = listSettingsProfiles();
console.log(`\nSettings profiles: present=${profileList.present} count=${profileList.profiles.length}`);
console.log(`  dataDir: ${profileList.dataDir}`);
console.log(`  default: ${profileList.defaultProfile || "(none)"}`);
for (const p of profileList.profiles.slice(0, 8)) {
  console.log(
    `  - ${p.name}${p.isDefault ? " (default)" : ""} keys=${p.keyCount} hf_pdf=${p.highlights.pdf_header_footer_mode}`,
  );
}
if (!profileList.present || profileList.profiles.length === 0) {
  console.error("FAIL: expected ParaDOCS settings profiles on disk");
  process.exit(1);
}
const mainProfile = getSettingsProfile("Main");
console.log(
  `get_settings_profile Main: source=${mainProfile.source} keys=${Object.keys(mainProfile.settings).length}`,
);
const active = getSettingsProfile("active");
console.log(
  `get_settings_profile active: keys=${Object.keys(active.settings).length} path=${active.path}`,
);

const uiPath = resolveAppHtmlPath();
try {
  const html = readAppHtml();
  console.log(`\nMCP Apps UI: ${uiPath} (${html.length} chars)`);
  if (!html.includes("Paragon Knowledge") || html.length < 1000) {
    console.error("FAIL: MCP Apps UI bundle looks incomplete");
    process.exit(1);
  }
} catch (err) {
  console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

const unavailableHits = searchDocs("SharePoint", { corpus: "tech-arch", contentSearch: false });
const unavailable = unavailableHits.hits.filter((h) => h.unavailable);
console.log(`Unavailable title notices (sample search): ${unavailable.length}`);

const avivaCreative = searchDocs("Aviva Creative Studios architecture", {
  corpus: "tech-arch",
});
const unreadHits = avivaCreative.hits.filter((h) => h.unreadDiagrams);
console.log(
  `Unread-diagram notices (Aviva Creative Studios architecture): ${unreadHits.length} of ${avivaCreative.hits.length} hits`,
);
if (unreadHits.length === 0) {
  // Soft check: corpus may move; still exercise the path via get_doc when possible.
  const avivaDoc = docs.find((d) =>
    d.relativePath.includes("50735  Aviva Creative") &&
    d.relativePath.includes("TDD v2.0.md") &&
    !d.relativePath.includes("GB-LEI"),
  );
  if (avivaDoc) {
    const page = getGuidePage(avivaDoc.relativePath);
    if (!("diagramOcr" in page) || !(page as { diagramOcr?: unknown }).diagramOcr) {
      console.error("FAIL: expected diagramOcr on Aviva Creative Studios TDD get_doc");
      process.exit(1);
    }
    console.log(`get_doc diagramOcr OK on ${avivaDoc.relativePath}`);
  }
} else {
  console.log(`  sample: ${unreadHits[0]?.relativePath}`);
}

console.log("\nSmoke OK");
