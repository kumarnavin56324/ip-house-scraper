
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static("public"));

app.get("/extract", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.json([]);

  try {
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);
    const sources = [];

    $("iframe").each((_, el) => sources.push($(el).attr("src")));
    $("embed").each((_, el) => sources.push($(el).attr("src")));
    $("video").each((_, el) => sources.push($(el).attr("src")));
    const m3u8Matches = data.match(/https?:\/\/[^"']+\.m3u8/g);
    if (m3u8Matches) sources.push(...m3u8Matches);

    const cleaned = sources.filter(Boolean).map(url => url.startsWith("//") ? "https:" + url : url);
    res.json([...new Set(cleaned)]);
  } catch (e) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log("IP House Server running on port", PORT);
});
