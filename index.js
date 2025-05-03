const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const TWELVE_API_KEY = process.env.TWELVE_KEY;
const GNEWS_API_KEY = '28c39174f6d1b5a63a3f819e37f7303f'; // Replace with your own GNews API key if needed

const stockSymbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];

// === STOCKS ===
app.get('/api/stocks', async (req, res) => {
  try {
    const responses = await Promise.all(
      stockSymbols.map(symbol =>
        axios.get(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_API_KEY}`)
          .then(r => r.data)
      )
    );

    const formatted = responses
      .filter(stock => stock && stock.close && !isNaN(parseFloat(stock.close)))
      .map(stock => ({
        symbol: stock.symbol,
        price: parseFloat(stock.close).toFixed(2),
        change: parseFloat(stock.percent_change).toFixed(2),
      }));

    res.json(formatted);
  } catch (err) {
    console.error("Twelve Data error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Stock API failed' });
  }
});

// === CRYPTO ===
app.get('/api/crypto', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin,solana&vs_currencies=usd&include_24hr_change=true'
    );
    const data = response.data;

    if (!data || typeof data !== 'object') {
      return res.status(500).json({ error: 'Invalid crypto response' });
    }

    const formatted = Object.keys(data).map((key) => ({
      symbol: key.toUpperCase(),
      price: data[key].usd.toFixed(2),
      change: data[key].usd_24h_change.toFixed(2),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Crypto fetch error:", error.message);
    res.status(500).json({ error: 'Crypto API failed' });
  }
});

// === GNEWS ===
app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=5&apikey=${GNEWS_API_KEY}`
    );
    const articles = response.data.articles.map(article => ({
      title: article.title,
    }));
    res.json(articles);
  } catch (err) {
    console.error("GNews fetch error:", err.response?.data || err.message);
    res.status(500).json({
      error: 'GNews API failed',
      detail: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
