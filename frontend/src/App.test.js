import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import CandlestickChart from "./components/CandlestickChart";
import IndicatorEditor from "./components/IndicatorEditor";

const App = () => {
  const availableCoins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT"];
  const [selectedCoin, setSelectedCoin] = useState(availableCoins[0]);
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [trades, setTrades] = useState([]);
  const [isTrading, setIsTrading] = useState(false); // Tracks trading state
  const [initialPrice, setInitialPrice] = useState(0); // Tracks price at the start of trade

  // Handler for Start/Stop Trade
  const handleTradeToggle = () => {
    if (isTrading) {
      // Stop trade
      setIsTrading(false);
    } else {
      // Start trade
      setInitialPrice((Math.random() * 50000 + 1000).toFixed(2)); // Set initial price randomly
      setIsTrading(true);
    }
  };

  // Simulate trades and updates while trading
  useEffect(() => {
    let interval;
    if (isTrading) {
      interval = setInterval(() => {
        // Placeholder trading logic: random buy/sell
        const newTrade = {
          id: trades.length + 1,
          coin: selectedCoin,
          interval: selectedInterval,
          type: Math.random() > 0.5 ? "buy" : "sell", // Random for demo (Buy or Sell)
          price: (Math.random() * 50000 + 1000).toFixed(2), // Random price
          timestamp: new Date().toLocaleString(),
        };

        setTrades((prevTrades) => [...prevTrades, newTrade]);
      }, 5000); // Trade happens every 5 seconds
    }

    return () => clearInterval(interval); // Cleanup interval on stop
  }, [isTrading, selectedCoin, selectedInterval, trades.length]);

  // Calculate profit/loss for each trade
  const calculateProfitLoss = (price) => {
    const diff = price - initialPrice;
    const percentChange = ((diff / initialPrice) * 100).toFixed(2);
    return { percentChange, profit: diff > 0 };
  };

  return (
    <div className="app">
      <Header username="JohnDoe" balance="1000" />
      <div className="main-container">
        <div className="chart-section">
          <div className="chart-and-editor">
            <div className="chart-container">
              <div className="selectors">
                {/* Dropdown to select coin */}
                <select
                  className="coin-selector"
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                >
                  {availableCoins.map((coin) => (
                    <option key={coin} value={coin}>
                      {coin}
                    </option>
                  ))}
                </select>

                {/* Dropdown to select interval */}
                <select
                  className="interval-selector"
                  value={selectedInterval}
                  onChange={(e) => setSelectedInterval(e.target.value)}
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                </select>
              </div>
              <CandlestickChart symbol={selectedCoin} interval={selectedInterval} />

              {/* Start/Stop Trade Button */}
              <div className="trade-buttons">
                <button className="start-trade-button" onClick={handleTradeToggle}>
                  {isTrading ? "Stop Trade" : "Start Trade"}
                </button>
              </div>
            </div>
            <div className="editor-container">
              <IndicatorEditor />
            </div>
          </div>

          {/* Trade List */}
          <div className="trade-list">
            <h3>Trade List</h3>
            <table className="trade-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Coin</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Interval</th>
                  <th>Profit/Loss (%)</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const { percentChange, profit } = calculateProfitLoss(trade.price);
                  return (
                    <tr key={trade.id}>
                      <td>{trade.id}</td>
                      <td>{trade.coin}</td>
                      <td>
                        {trade.type === "buy" ? (
                          <span style={{ color: "green" }}>↑ Buy</span>
                        ) : (
                          <span style={{ color: "red" }}>↓ Sell</span>
                        )}
                      </td>
                      <td>{trade.price}</td>
                      <td>{trade.interval}</td>
                      <td style={{ color: profit ? "green" : "red" }}>
                        {profit ? "+" : ""}
                        {percentChange}%
                      </td>
                      <td>{trade.timestamp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
