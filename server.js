const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root route to fix "Cannot GET /"
app.get("/", (req, res) => {
  res.send("✅ IP House Media Extractor backend is running. Use POST /extract");
});

app.post("/extract", async (req, res) => {
  const urls = req.body.urls;
  const results = [];

  for (const url of urls) {
    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(data);
      const sources = [];

      $("iframe, video, source, embed").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src && !sources.includes(src)) sources.push(src);
      });

      results.push({ url, sources: sources.length ? sources : ["No sources found"] });
    } catch (err) {
      results.push({ url, sources: ["Failed to fetch"] });
    }
  }

  res.json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
