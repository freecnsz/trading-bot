import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import CandlestickChart from "./components/CandlestickChart";
import IndicatorEditor from "./components/IndicatorEditor";
import Timer from "./components/Timer";
import Footer from "./components/Footer";

const App = () => {
  const availableCoins = [
    "ETHUSDT",
    "BTCUSDT",
    "AVAXUSDT",
    "SOLUSDT",
    "RENDERUSDT",
    "FETUSDT",
  ];
  const networks = ["MAINNET", "TESTNET"];
  const [selectedCoin, setSelectedCoin] = useState(availableCoins[0]);
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [selectedNetwork, setSelectedNetwork] = useState("TESTNET"); // Default to MAINNET
  const [isTrading, setIsTrading] = useState(false); // Tracks trading state
  const [initialPrice, setInitialPrice] = useState(0); // Tracks price at the start of trade
  const [timeElapsed, setTimeElapsed] = useState(0); // Tracks elapsed time
  const [isInfoVisible, setIsInfoVisible] = useState(false); // Toggles visibility of trade info
  const [trades, setTrades] = useState([]); // Stores trade history


  // Handler for Start/Stop Trade
  const handleTradeToggle = () => {
    if (isTrading) {
      // Stop trade
      setIsTrading(false);
    } else {
      // Start trade
      setInitialPrice((Math.random() * 50000 + 1000).toFixed(2)); // Set initial price randomly
      setIsTrading(true);
      setIsInfoVisible(true);
      setTimeElapsed(0); // Reset timer
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
        setTimeElapsed((prevTime) => prevTime + 1); // Increment timer
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
                  <option value="1d">1 Day</option>
                </select>

                {/* Dropdown to select network */}
                <select
                  className="network-selector"
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                >
                  {networks.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>
              <CandlestickChart
                symbol={selectedCoin}
                interval={selectedInterval}
                network={selectedNetwork}
              />

              {/* Start/Stop Trade Button */}
              <div className="trade-buttons">
                <button
                  className={`toggle-info-button ${isInfoVisible ? "up" : ""}`}
                  onClick={() => {
                    isInfoVisible
                      ? setIsInfoVisible(false)
                      : setIsInfoVisible(true);
                  }}
                ></button>

                <button
                  className="start-trade-button"
                  style={{
                    backgroundColor: isTrading ? "red" : "#0fff6b", // Red when trading, green otherwise
                    color: "white", // Ensure text remains visible
                  }}
                  onClick={handleTradeToggle}
                >
                  {isTrading ? "Stop Trade" : "Start Trade"}
                </button>
              </div>
            </div>
            <div className="editor-container">
              <IndicatorEditor />
            </div>
          </div>

          <div className="separator"></div>
          <div className="trade-info">
            {isInfoVisible && (
              <div className="trade-info-content">
                <Timer isTrading={isTrading} />
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
                      const { percentChange, profit } = calculateProfitLoss(
                        trade.price
                      );
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
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
