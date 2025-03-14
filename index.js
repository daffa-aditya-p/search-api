const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Function buat scraping Brave Search
const scrapeBrave = async (query) => {
  try {
    const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const results = [];

    $(".snippet.fdb").each((i, el) => {
      const title = $(el).find(".snippet-title").text().trim();
      const link = $(el).find(".snippet-title a").attr("href");
      const snippet = $(el).find(".snippet-content").text().trim();

      if (title && link) {
        results.push({ title, link, snippet });
      }
    });

    return results;
  } catch (error) {
    console.error("Error scraping Brave:", error);
    return [];
  }
};

// Endpoint pencarian
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  const results = await scrapeBrave(query);
  res.json({ results });
});

// Jalankan server lokal (buat testing)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
