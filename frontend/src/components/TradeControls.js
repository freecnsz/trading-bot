import React from "react";
import "../App.css";

const TradeControls = ({
  availableCoins,
  networks,
  intervals,
  selectedCoin,
  setSelectedCoin,
  selectedInterval,
  setSelectedInterval,
  isTrading,
  handleTradeToggle,
}) => (
  <div className="trade-controls">
    <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
      {availableCoins.map((coin) => (
        <option key={coin} value={coin}>
          {coin}
        </option>
      ))}
    </select>
    <select value={selectedInterval} onChange={(e) => setSelectedInterval(e.target.value)}>
      {intervals.map((interval) => (
        <option key={interval} value={interval}>
          {interval} Interval
        </option>
      ))}
    </select>
    <select>
      {networks.map((network) => (
        <option key={network} value={network}>
          {network}
        </option>
      ))}
    </select>
    <button
      style={{
        backgroundColor: isTrading ? "red" : "#0fff6b",
        color: "white",
      }}
      onClick={handleTradeToggle}
    >
      {isTrading ? "Stop Trade" : "Start Trade"}
    </button>
  </div>
);

export default TradeControls;
