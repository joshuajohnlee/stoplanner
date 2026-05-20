import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const abilities = [
  "Beams: Fire at Will",
  "Attack Pattern Beta",
  "Attack Pattern Omega",
  "Aceton Beam",
  // Add more abilities here
];

const outputDir = "./icons";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]+/g, "").trim();
}

async function getIconUrl(abilityName) {
  const pageTitle = `Ability:${abilityName}`;

  const apiUrl =
    "https://sto.fandom.com/api.php" +
    `?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}` +
    "&format=json";

  const res = await fetch(apiUrl);
  const data = await res.json();

  const pages = data?.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (!page?.images) return null;

  const iconImage = page.images.find(img =>
    img.title.toLowerCase().includes("_icon")
  );

  if (!iconImage) return null;

  const imageInfoUrl =
    "https://sto.fandom.com/api.php" +
    `?action=query&titles=${encodeURIComponent(iconImage.title)}` +
    "&prop=imageinfo&iiprop=url&format=json";

  const imageRes = await fetch(imageInfoUrl);
  const imageData = await imageRes.json();

  const imagePages = imageData?.query?.pages;
  if (!imagePages) return null;

  const imagePage = Object.values(imagePages)[0];
  return imagePage?.imageinfo?.[0]?.url || null;
}

async function downloadIcon(abilityName) {
  const cleanName = sanitizeFileName(abilityName);
  const outputPath = path.join(outputDir, `${cleanName}.png`);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✓ Skipped (already exists): ${abilityName}`);
    return "skipped";
  }

  const iconUrl = await getIconUrl(abilityName);

  if (!iconUrl) {
    console.log(`✗ Missing Icon: ${abilityName}`);
    return "missing";
  }

  console.log(`Downloading: ${abilityName}`);
  const response = await fetch(iconUrl);

  if (!response.ok) {
    console.log(`✗ Failed download: ${abilityName}`);
    return "missing";
  }

  const buffer = await response.buffer();
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${abilityName}`);
  return "downloaded";
}

async function run() {
  const missed = [];
  let downloaded = 0;
  let skipped = 0;

  for (const ability of abilities) {
    const result = await downloadIcon(ability);

    if (result === "missing") missed.push(ability);
    if (result === "downloaded") downloaded++;
    if (result === "skipped") skipped++;
  }

  console.log("\n===== Summary =====");
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Missing: ${missed.length}`);

  if (missed.length > 0) {
    console.log("\nMissing Icons:");
    missed.forEach(a => console.log(`- ${a}`));
  }
}

run();