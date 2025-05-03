
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.ALPHA_KEY;
const NEWS_API_KEY = process.env.NEWS_KEY;
const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];

app.get('/api/stocks', async (req, res) => {
  const results = [];

  for (const symbol of symbols) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
      const response = await axios.get(url);
      const quote = response.data['Global Quote'];

      results.push({
        symbol,
        price: parseFloat(quote['05. price']).toFixed(2),
        change: parseFloat(quote['10. change percent']).toFixed(2),
      });

      await new Promise((r) => setTimeout(r, 15000)); // Alpha Vantage rate limit
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err.message);
    }
  }

  res.json(results);
});

app.get('/api/crypto', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin,solana&vs_currencies=usd&include_24hr_change=true'
    );
    const data = response.data;
    const formatted = Object.keys(data).map((key) => ({
      symbol: key.toUpperCase(),
      price: data[key].usd.toFixed(2),
      change: data[key].usd_24h_change.toFixed(2),
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Crypto API failed' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    const articles = response.data.articles.map(article => ({
      title: article.title,
    }));
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'News API failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
