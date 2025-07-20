const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/extract', async (req, res) => {
  const urls = req.body.urls || [];
  const results = [];

  for (const url of urls) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const sources = [];

      $('iframe, video, embed, source').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !sources.includes(src)) sources.push(src);
      });

      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.endsWith('.m3u8') && !sources.includes(href)) {
          sources.push(href);
        }
      });

      results.push({ url, sources });
    } catch (error) {
      results.push({ url, sources: ['Error fetching'] });
    }
  }

  res.json({ results });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
