app.get('/api/stocks', async (req, res) => {
  try {
    const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];
    const responses = await Promise.all(
      symbols.map(symbol =>
        axios.get(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_API_KEY}`)
          .then(r => r.data)
      )
    );

    const formatted = responses
      .filter(stock => stock && stock.price && !isNaN(parseFloat(stock.price)))
      .map(stock => ({
        symbol: stock.symbol,
        price: parseFloat(stock.price).toFixed(2),
        change: parseFloat(stock.percent_change).toFixed(2),
      }));

    res.json(formatted);
  } catch (err) {
    console.error("Twelve Data error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Stock API failed' });
  }
});
