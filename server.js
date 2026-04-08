import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("."));

const OFFICIAL_PACKET_HINTS = [
  "application",
  "petition",
  "sealing",
  "expungement",
  "expunction",
  "nondisclosure",
  "record",
  "pdf",
  "form",
  "forms",
  "packet"
];

const OFFICIAL_DOMAIN_HINTS = [
  ".gov",
  ".us",
  "court",
  "courts",
  "clerk",
  "judiciary",
  "judicial",
  "county",
  "state"
];

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function scoreResult(result, courtQuery, stateQuery) {
  const title = (result.title || "").toLowerCase();
  const url = (result.url || "").toLowerCase();
  const snippet = (result.snippet || "").toLowerCase();
  const court = (courtQuery || "").toLowerCase();
  const state = (stateQuery || "").toLowerCase();

  let score = 0;

  for (const hint of OFFICIAL_PACKET_HINTS) {
    if (title.includes(hint)) score += 2;
    if (url.includes(hint)) score += 2;
    if (snippet.includes(hint)) score += 1;
  }

  for (const hint of OFFICIAL_DOMAIN_HINTS) {
    if (url.includes(hint)) score += 2;
  }

  if (url.endsWith(".pdf")) score += 6;
  if (url.includes("/view/")) score += 3;
  if (title.includes("application")) score += 2;
  if (title.includes("petition")) score += 2;
  if (title.includes("local forms")) score += 2;

  if (court && (title.includes(court) || snippet.includes(court))) score += 5;
  if (state && (title.includes(state) || snippet.includes(state) || url.includes(state.replace(/\s+/g, "")))) score += 3;

  if (url.includes("lawyer") || url.includes("attorney") || url.includes("blog")) score -= 6;
  if (url.includes("youtube") || url.includes("facebook")) score -= 10;

  return score;
}

function buildQueries({ court, county, state, type }) {
  const parts = [court, county, state].filter(Boolean).join(" ");
  return [
    `${parts} ${type} packet pdf`,
    `${parts} ${type} forms pdf`,
    `${parts} application petition ${type} pdf`,
    `${parts} clerk court forms ${type}`
  ];
}

async function searchWeb(query) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("Missing SERPAPI_KEY");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("num", "10");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);

  const json = await res.json();
  const results = Array.isArray(json.organic_results) ? json.organic_results : [];

  return results.map((r) => ({
    title: r.title || "",
    url: r.link || "",
    snippet: r.snippet || ""
  }));
}

function getHardcodedMapping({ court, county, state, type }) {
  const c = `${court} ${county} ${state}`.toLowerCase();

  if (
    type === "sealing" &&
    c.includes("wood") &&
    c.includes("common pleas") &&
    c.includes("ohio")
  ) {
    return {
      court: "Wood County Court of Common Pleas",
      county: "Wood County",
      state: "Ohio",
      packetTitle: "Application for Sealing 2953.32 (Conviction)",
      packetUrl: "https://clerkofcourt.co.wood.oh.us/DocumentCenter/View/142/Application-for-Sealing-295332-Conviction-PDF",
      source: "Wood County Clerk of Courts",
      confidence: 0.99,
      mappingKey: "wood-county-common-pleas-conviction-sealing"
    };
  }

  return null;
}

app.get("/api/find-packet", async (req, res) => {
  try {
    const court = normalize(req.query.court);
    const county = normalize(req.query.county);
    const state = normalize(req.query.state);
    const type = normalize(req.query.type || "sealing");

    if (!court || !state) {
      return res.status(400).json({ error: "court and state are required" });
    }

    const hardcoded = getHardcodedMapping({ court, county, state, type });
    if (hardcoded) return res.json(hardcoded);

    const queries = buildQueries({ court, county, state, type });
    const all = [];

    for (const q of queries) {
      const results = await searchWeb(q);
      all.push(...results);
    }

    const deduped = [];
    const seen = new Set();

    for (const item of all) {
      if (!item.url || seen.has(item.url)) continue;
      seen.add(item.url);
      deduped.push(item);
    }

    const ranked = deduped
      .map((r) => ({
        ...r,
        _score: scoreResult(r, `${court} ${county}`.trim(), state)
      }))
      .sort((a, b) => b._score - a._score);

    const best = ranked[0];

    if (!best || best._score < 4) {
      return res.json({
        court,
        county,
        state,
        packetTitle: "",
        packetUrl: "",
        source: "",
        confidence: 0,
        mappingKey: ""
      });
    }

    let source = "Official court source";
    try {
      source = new URL(best.url).hostname;
    } catch {}

    return res.json({
      court,
      county,
      state,
      packetTitle: best.title,
      packetUrl: best.url,
      source,
      confidence: Math.min(0.98, 0.5 + best._score / 20),
      mappingKey: ""
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not search for packet" });
  }
});

app.get("/api/fetch-pdf", async (req, res) => {
  try {
    const url = String(req.query.url || "");
    if (!url.startsWith("http")) {
      return res.status(400).send("Invalid URL");
    }

    const host = new URL(url).hostname.toLowerCase();
    const allowed =
      host.includes("court") ||
      host.includes("courts") ||
      host.includes("clerk") ||
      host.includes("judiciary") ||
      host.endsWith(".gov") ||
      host.endsWith(".us");

    if (!allowed) {
      return res.status(403).send("Only official court sources are allowed");
    }

    const pdfRes = await fetch(url);
    if (!pdfRes.ok) {
      return res.status(502).send("Could not fetch PDF");
    }

    const contentType = pdfRes.headers.get("content-type") || "";
    if (!contentType.includes("pdf")) {
      return res.status(400).send("Source is not a PDF");
    }

    const bytes = Buffer.from(await pdfRes.arrayBuffer());
    res.setHeader("Content-Type", "application/pdf");
    res.send(bytes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch PDF");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
