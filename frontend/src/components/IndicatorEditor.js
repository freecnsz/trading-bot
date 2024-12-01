import React, { useState } from "react";
import "../App.css";

const IndicatorEditor = () => {
  const [indicators, setIndicators] = useState([
    {
      name: "RSI",
      enabled: true,
      collapsed: false,
      period: 14,
      overbought: 70,
      oversold: 30,
    },
    {
      name: "SMA Crossover",
      enabled: true,
      collapsed: false,
      period: 20,
      deviation: 2,
    },
    {
      name: "MACD",
      enabled: true,
      collapsed: false,
      fastLength: 12,
      slowLength: 26,
      signalLength: 9,
    },
    {
      name: "Bollinger Bands",
      enabled: true,
      collapsed: false,
      period: 20,
      deviation: 2,
    },
  ]);

  const toggleEnabled = (index) => {
    setIndicators((prev) =>
      prev.map((ind, i) =>
        i === index
          ? {
              ...ind,
              enabled: !ind.enabled,
              collapsed: !ind.enabled ? false : ind.collapsed,
            }
          : ind
      )
    );
  };

  const toggleCollapsed = (index) => {
    setIndicators((prev) =>
      prev.map((ind, i) =>
        i === index ? { ...ind, collapsed: !ind.collapsed } : ind
      )
    );
  };

  const handleChange = (index, key, value) => {
    setIndicators((prev) =>
      prev.map((ind, i) => (i === index ? { ...ind, [key]: value } : ind))
    );
  };

  const renderIndicatorSettings = (indicator, index) => {
    switch (indicator.name) {
      case "RSI":
        return (
          <>
            <label>
              Period:
              <input
                type="number"
                value={indicator.period}
                onChange={(e) => handleChange(index, "period", e.target.value)}
                className="indicator-input"
              />
            </label>
            <label>
              Overbought:
              <input
                type="number"
                value={indicator.overbought}
                onChange={(e) =>
                  handleChange(index, "overbought", e.target.value)
                }
                className="indicator-input"
              />
            </label>
            <label>
              Oversold:
              <input
                type="number"
                value={indicator.oversold}
                onChange={(e) => handleChange(index, "oversold", e.target.value)}
                className="indicator-input"
              />
            </label>
          </>
        );
      case "SMA Crossover":
        return (
          <>
            <label>
              Period:
              <input
                type="number"
                value={indicator.period}
                onChange={(e) => handleChange(index, "period", e.target.value)}
                className="indicator-input"
              />
            </label>
            <label>
              Deviation:
              <input
                type="number"
                value={indicator.deviation}
                onChange={(e) => handleChange(index, "deviation", e.target.value)}
                className="indicator-input"
              />
            </label>
          </>
        );
      case "MACD":
        return (
          <>
            <label>
              Fast Length:
              <input
                type="number"
                value={indicator.fastLength}
                onChange={(e) =>
                  handleChange(index, "fastLength", e.target.value)
                }
                className="indicator-input"
              />
            </label>
            <label>
              Slow Length:
              <input
                type="number"
                value={indicator.slowLength}
                onChange={(e) =>
                  handleChange(index, "slowLength", e.target.value)
                }
                className="indicator-input"
              />
            </label>
            <label>
              Signal Length:
              <input
                type="number"
                value={indicator.signalLength}
                onChange={(e) =>
                  handleChange(index, "signalLength", e.target.value)
                }
                className="indicator-input"
              />
            </label>
          </>
        );
      case "Bollinger Bands":
        return (
          <>
            <label>
              Period:
              <input
                type="number"
                value={indicator.period}
                onChange={(e) => handleChange(index, "period", e.target.value)}
                className="indicator-input"
              />
            </label>
            <label>
              Deviation:
              <input
                type="number"
                value={indicator.deviation}
                onChange={(e) => handleChange(index, "deviation", e.target.value)}
                className="indicator-input"
              />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  const handleSave = async () => {
    const transformedIndicators = indicators
      .filter((indicator) => indicator.enabled) // Sadece aktif olanları dahil et
      .map((indicator) => {
        const formattedIndicator = { name: indicator.name };
        
        if (indicator.name === "RSI") {
          formattedIndicator.period = indicator.period;
          formattedIndicator.overbought = indicator.overbought;
          formattedIndicator.oversold = indicator.oversold;
        } else if (indicator.name === "SMA Crossover") {
          formattedIndicator.period = indicator.period;
          formattedIndicator.deviation = indicator.deviation;
        } else if (indicator.name === "MACD") {
          formattedIndicator.fastLength = indicator.fastLength;
          formattedIndicator.slowLength = indicator.slowLength;
          formattedIndicator.signalLength = indicator.signalLength;
        } else if (indicator.name === "Bollinger Bands") {
          formattedIndicator.period = indicator.period;
          formattedIndicator.deviation = indicator.deviation;
        }
  
        return formattedIndicator;
      });
  
    console.log("Formatted Indicators:", transformedIndicators);
  
    try {
      const response = await fetch("http://localhost:8000/strategy/set_strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedIndicators),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save strategy");
      }
  
      const responseData = await response.json();
      console.log("API Response:", responseData);
    } catch (error) {
      console.error("Error saving strategy:", error);
    }
  };
  

  return (
    <div className="indicator-editor">
      <div className="grid-layout">
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className={`indicator-item ${indicator.enabled ? "" : "disabled"}`}
          >
            <div className="indicator-header">
              <h5
                onClick={() => toggleCollapsed(index)}
                className="indicator-name"
              >
                {indicator.name}
              </h5>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={indicator.enabled}
                  onChange={() => toggleEnabled(index)}
                />
                <span className="slider"></span>
              </label>
            </div>
            {indicator.enabled && !indicator.collapsed && (
              <div>
                {renderIndicatorSettings(indicator, index)}
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="save-button" onClick={handleSave}>
        save
      </button>
    </div>
  );
};

export default IndicatorEditor;
