const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const TWELVE_API_KEY = process.env.TWELVE_KEY;
const GNEWS_API_KEY = process.env.GNEWS_KEY;

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

// === CRYPTO (CoinCap + Logo URLs) ===
app.get('/api/crypto', async (req, res) => {
  try {
    const response = await axios.get('https://api.coincap.io/v2/assets');
    const coins = response.data?.data;

    if (!Array.isArray(coins)) {
      throw new Error("CoinCap returned invalid data");
    }

    const symbolsWithLogos = {
      BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      DOGE: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
      SOL: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    };

    const filtered = coins.filter(c => Object.keys(symbolsWithLogos).includes(c.symbol.toUpperCase()));

    const formatted = filtered.map(c => ({
      symbol: c.symbol,
      price: parseFloat(c.priceUsd).toFixed(2),
      change: parseFloat(c.changePercent24Hr).toFixed(2),
      logo: symbolsWithLogos[c.symbol.toUpperCase()]
    }));

    res.json(formatted);
  } catch (error) {
    console.error("CoinCap error:", error.message);
    res.status(500).json({ error: 'Crypto API failed', detail: error.message });
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
      description: article.description,
      url: article.url
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

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
