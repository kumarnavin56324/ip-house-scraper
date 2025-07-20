
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function extractSources(html) {
  const $ = cheerio.load(html);
  const sources = [];
  $("iframe, embed, video").each((_, el) => {
    const src = $(el).attr("src");
    if (src) sources.push(src.startsWith("//") ? "https:" + src : src);
  });
  const m3u8Matches = html.match(/https?:[^"']+\.m3u8/g);
  if (m3u8Matches) sources.push(...m3u8Matches);
  return [...new Set(sources)];
}

app.post("/extract", async (req, res) => {
  const urls = req.body.urls || [];
  const results = [];

  for (const url of urls) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const html = response.data;
      const sources = extractSources(html);
      results.push({ url, sources });
    } catch (err) {
      results.push({ url, sources: [] });
    }
  }

  res.json({ results });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`IP House Server running on port ${PORT}`));
