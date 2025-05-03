
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];

app.get('/api/stocks', async (req, res) => {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
    );
    const quotes = response.data.quoteResponse.result;
    const formatted = quotes.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice.toFixed(2),
      change: q.regularMarketChangePercent.toFixed(2),
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Yahoo fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Yahoo fetch failed' });
  }
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
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=5&apiKey=${process.env.NEWS_KEY}`
    );
    const articles = response.data.articles.map(article => ({
      title: article.title,
    }));
    res.json(articles);
  } catch (err) {
    console.error("News fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: 'News API failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
