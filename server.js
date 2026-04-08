import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("."));

const OFFICIAL_PACKET_HINTS = [
  "application for sealing",
  "2953.32",
  "conviction",
  "dismissal",
  "expungement",
  "pdf",
  "forms"
];

const OFFICIAL_DOMAIN_HINTS = [
  ".gov",
  ".us",
  "clerk",
  "court",
  "municipal",
  "county",
  "commonpleas",
  "common-pleas",
  "co."
];

function scoreResult(result, courtQuery) {
  const title = (result.title || "").toLowerCase();
  const url = (result.url || "").toLowerCase();
  const query = (courtQuery || "").toLowerCase();

  let score = 0;

  for (const hint of OFFICIAL_PACKET_HINTS) {
    if (title.includes(hint) || url.includes(hint.replace(/\./g, ""))) score += 2;
  }

  for (const hint of OFFICIAL_DOMAIN_HINTS) {
    if (url.includes(hint)) score += 2;
  }

  if (url.endsWith(".pdf") || url.includes("/view/")) score += 4;
  if (title.includes("application for sealing")) score += 5;
  if (title.includes("conviction")) score += 2;
  if (query && (title.includes(query) || url.includes(query.replace(/\s+/g, "-")))) score += 4;

  if (url.includes("law") && !url.includes("clerk") && !url.includes("court")) score -= 4;
  if (url.includes("blog")) score -= 4;

  return score;
}

function normalizeCourtName(input) {
  return String(input || "").trim().replace(/\s+/g, " ");
}

function buildSearchQueries(court, state, type) {
  return [
    `${court} ${state} ${type} packet pdf`,
    `${court} clerk forms application for sealing pdf`,
    `${court} 2953.32 conviction pdf`
  ];
}

async function searchWeb(query) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("Missing SERPAPI_KEY");
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("num", "10");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const json = await res.json();
  const results = Array.isArray(json.organic_results) ? json.organic_results : [];

  return results.map((r) => ({
    title: r.title || "",
    url: r.link || "",
    snippet: r.snippet || ""
  }));
}

function woodCountyShortcut(court) {
  const c = court.toLowerCase();
  if (!c.includes("wood")) return null;

  return {
    court: "Wood County Court of Common Pleas",
    packetTitle: "Application for Sealing 2953.32 (Conviction)",
    packetUrl: "https://clerkofcourt.co.wood.oh.us/DocumentCenter/View/142/Application-for-Sealing-295332-Conviction-PDF",
    source: "Wood County Clerk of Courts",
    confidence: 0.99
  };
}

app.get("/api/find-packet", async (req, res) => {
  try {
    const court = normalizeCourtName(req.query.court);
    const state = normalizeCourtName(req.query.state || "Ohio");
    const type = normalizeCourtName(req.query.type || "sealing");

    if (!court) {
      return res.status(400).json({ error: "Missing court" });
    }

    const shortcut = woodCountyShortcut(court);
    if (shortcut) {
      return res.json(shortcut);
    }

    const queries = buildSearchQueries(court, state, type);
    const allResults = [];

    for (const q of queries) {
      const results = await searchWeb(q);
      allResults.push(...results);
    }

    const deduped = [];
    const seen = new Set();

    for (const r of allResults) {
      if (!r.url || seen.has(r.url)) continue;
      seen.add(r.url);
      deduped.push(r);
    }

    const ranked = deduped
      .map((r) => ({ ...r, _score: scoreResult(r, court) }))
      .sort((a, b) => b._score - a._score);

    const best = ranked[0];

    if (!best || best._score < 4) {
      return res.json({
        court,
        packetTitle: "",
        packetUrl: "",
        source: "",
        confidence: 0
      });
    }

    let source = "Official court source";
    try {
      source = new URL(best.url).hostname;
    } catch {}

    return res.json({
      court,
      packetTitle: best.title,
      packetUrl: best.url,
      source,
      confidence: Math.min(0.98, 0.5 + best._score / 20)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not search for packet" });
  }
});

app.get("/api/fetch-pdf", async (req, res) => {
  try {
    const url = String(req.query.url || "");
    if (!url.startsWith("http")) {
      return res.status(400).send("Invalid URL");
    }

    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    const allowed =
      host.includes("court") ||
      host.includes("clerk") ||
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
