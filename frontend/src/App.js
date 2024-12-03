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
  const [selectedNetwork, setSelectedNetwork] = useState("MAINNET");
  const [isTrading, setIsTrading] = useState(false);
  const [, setTimeElapsed] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [trades, setTrades] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [notification, setNotification] = useState(""); // Notification state
  const [balance, setBalance] = useState(10000);

  const stopTrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/trade/stop_trade", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to stop trade");
      }

      const responseData = await response.json();
      setBalance(responseData.balance);

      console.log("API Response:", responseData);
      setNotification("Trade stopped successfully!");
    } catch (error) {
      console.error("Error stopping trade:", error);
      setNotification("An error occurred while stopping the trade.");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsTrading(false);
      setIsLoading(false);
    }
  };

  const handleTradeToggle = async () => {
    setIsInfoVisible(true);
    setIsLoading(true);
    if (isTrading) {
      await stopTrade();
      if (socket) {
        socket.close();
        console.log("WebSocket disconnected.");
      }
      setSocket(null);
      setIsTrading(false);
    } else {
      setTrades([]);
      try {
        const response = await fetch(
          `http://localhost:8000/trade/start_trade?symbol=${selectedCoin.toLowerCase()}&interval=${selectedInterval}`,
          { method: "POST" }
        );

        if (!response.ok) {
          throw new Error("Failed to start trade");
        }

        const responseData = await response.json();
        console.log("API Response:", responseData);
        setNotification("Trade started successfully!");
        setTimeout(() => setNotification(null), 3000);

        const newSocket = new WebSocket("ws://localhost:8765");
        newSocket.onopen = () => console.log("WebSocket connected.");
        newSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("WebSocket message:", data);

          const newTrade = {
            id : data.id,
            coin: data.symbol,
            type: data.action.toLocaleString().toLowerCase(),
            price: data.price,
            amount: data.amount,
            interval: selectedInterval,
            profit_loss: data.profit_loss,
            timestamp: new Date(data.timestamp).toLocaleString(),
          };
          setTrades((prevTrades) => [...prevTrades, newTrade]);
          setBalance(data.balance);
        };
        newSocket.onerror = (error) => console.error("WebSocket error:", error);
        newSocket.onclose = () => console.log("WebSocket disconnected.");
        setSocket(newSocket);
        setIsTrading(true);
        setTimeElapsed(0);
      } catch (error) {
        console.error("Error starting trade:", error);
        setNotification("An error occurred while starting the trade.");
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCoinChange = (e) => {
    setSelectedCoin(e.target.value);
    if (isTrading)
      stopTrade();
  };

  const handleIntervalChange = (e) => {
    setSelectedInterval(e.target.value);
    if (isTrading)
      stopTrade();
  };

  useEffect(() => {
    let interval;
    if (isTrading) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrading]);

  return (
    <div className="app">
      <Header username="Alper Özcan" balance={balance} />
      <div className="main-container">
        <div className="chart-section">
          <div className="chart-and-editor">
            <div className="chart-container">
              <div className="selectors">
                <select
                  className="coin-selector"
                  value={selectedCoin}
                  onChange={(e) => handleCoinChange(e)}
                >
                  {availableCoins.map((coin) => (
                    <option key={coin} value={coin}>
                      {coin}
                    </option>
                  ))}
                </select>
                <select
                  className="interval-selector"
                  value={selectedInterval}
                  onChange={(e) => handleIntervalChange(e)}
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                </select>
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
              <div className="trade-buttons">
                <button
                  className={`toggle-info-button ${isInfoVisible ? "up" : ""}`}
                  onClick={() => setIsInfoVisible((prev) => !prev)}
                ></button>
                <button
                  className="start-trade-button"
                  style={{
                    backgroundColor: isTrading ? "red" : "#0fff6b",
                    color: "white",
                  }}
                  onClick={handleTradeToggle}
                  disabled={isLoading} // Disable button during loading
                >
                  {isLoading ? (
                    <span className="spinner"></span> // Spinner component
                  ) : isTrading ? (
                    "Stop Trade"
                  ) : (
                    "Start Trade"
                  )}
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
                      <th>Price ($)</th>
                      <th>Interval</th>
                      <th>Profit/Loss (%)</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
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
                        <td>
                          {trade.profit_los = 0 ? (
                            <span>Firts Trade</span>
                          ) : trade.profit_loss < 0 ? (
                            <span style={{ color: "red" }}>
                              {trade.profit_loss}
                            </span>
                          ) : (
                            <span style={{ color: "green" }}>
                              {trade.profit_loss}
                            </span>
                          )}
                        </td>
                        <td>{trade.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {notification && (
        <div className="notification">
          <p>{notification}</p>
        </div>
      )}
    </div>
  );
};

export default App;
