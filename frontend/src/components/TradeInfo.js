import React from "react";
import "../App.css";

const TradeInfo = ({
  trades,
  timeElapsed,
  calculateProfitLoss,
  isInfoVisible,
  setIsInfoVisible,
}) => (
  <div className="trade-info">
    <button onClick={() => setIsInfoVisible(!isInfoVisible)}>
      {isInfoVisible ? "Hide Trade Info" : "Show Trade Info"}
    </button>
    {isInfoVisible && (
      <div className="trade-info-content">
        <h3>Elapsed Time: {timeElapsed * 5} seconds</h3>
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
                  <td style={{ color: trade.type === "buy" ? "green" : "red" }}>
                    {trade.type === "buy" ? "↑ Buy" : "↓ Sell"}
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
);

export default TradeInfo;
