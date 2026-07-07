import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export const getStockPrice = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const yahooSymbol = symbol.endsWith(".NS")
      ? symbol
      : `${symbol}.NS`;

    const quote = await yahooFinance.quote(yahooSymbol);

    if (!quote || quote.regularMarketPrice == null) {
      return res.status(404).json({
        message: "Stock price not found",
      });
    }

    return res.json({
      symbol,
      yahooSymbol,
      name: quote.longName || quote.shortName || symbol,
      price: quote.regularMarketPrice,
      currency: quote.currency || "INR",
      exchange: quote.fullExchangeName || "NSE",
    });
  } catch (error) {
    console.error("MARKET API ERROR:", error.message);

    return res.status(500).json({
      message: "Could not fetch stock price",
      error: error.message,
    });
  }
};