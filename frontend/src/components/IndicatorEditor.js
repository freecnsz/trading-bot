import React, { useState } from 'react';

const IndicatorEditor = () => {
  const [indicators, setIndicators] = useState([
    {
      name: 'Moving Average',
      type: 'SMA',
      period: 20,
      enabled: true,
      collapsed: false,
    },
    {
      name: 'RSI',
      period: 14,
      overbought: 70,
      oversold: 30,
      enabled: true,
      collapsed: false,
    },
    {
      name: 'Bollinger Bands',
      period: 20,
      deviation: 2,
      enabled: true,
      collapsed: false,
    },
    {
      name: 'MACD',
      fastLength: 12,
      slowLength: 26,
      signalLength: 9,
      enabled: true,
      collapsed: false,
    },
  ]);

  const toggleEnabled = (index) => {
    setIndicators((prev) =>
      prev.map((ind, i) =>
        i === index ? { ...ind, enabled: !ind.enabled, collapsed: !ind.enabled ? false : ind.collapsed } : ind
      )
    );
  };

  const toggleCollapsed = (index) => {
    setIndicators((prev) =>
      prev.map((ind, i) => (i === index ? { ...ind, collapsed: !ind.collapsed } : ind))
    );
  };

  const handleChange = (index, field, value) => {
    setIndicators((prev) =>
      prev.map((ind, i) => (i === index ? { ...ind, [field]: value } : ind))
    );
  };

  return (
    <div className="indicator-editor">
      <div className="grid-layout">
        {indicators.map((indicator, index) => (
          <div key={index} className={`indicator-item ${indicator.enabled ? '' : 'disabled'}`}>
            <div className="indicator-header">
              <h5 onClick={() => toggleCollapsed(index)} className="indicator-name">
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
              <div className="indicator-settings">
                {indicator.name === 'Moving Average' && (
                  <>
                    <label>
                      Type:
                      <select
                        value={indicator.type}
                        onChange={(e) => handleChange(index, 'type', e.target.value)}
                        className="indicator-input"
                      >
                        <option value="SMA">SMA</option>
                        <option value="EMA">EMA</option>
                      </select>
                    </label>
                    <label>
                      Period:
                      <input
                        type="number"
                        value={indicator.period}
                        onChange={(e) => handleChange(index, 'period', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                  </>
                )}
                {indicator.name === 'RSI' && (
                  <>
                    <label>
                      Period:
                      <input
                        type="number"
                        value={indicator.period}
                        onChange={(e) => handleChange(index, 'period', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                    <label>
                      Overbought:
                      <input
                        type="number"
                        value={indicator.overbought}
                        onChange={(e) => handleChange(index, 'overbought', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                    <label>
                      Oversold:
                      <input
                        type="number"
                        value={indicator.oversold}
                        onChange={(e) => handleChange(index, 'oversold', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                  </>
                )}
                {indicator.name === 'Bollinger Bands' && (
                  <>
                    <label>
                      Period:
                      <input
                        type="number"
                        value={indicator.period}
                        onChange={(e) => handleChange(index, 'period', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                    <label>
                      Deviation:
                      <input
                        type="number"
                        value={indicator.deviation}
                        onChange={(e) => handleChange(index, 'deviation', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                  </>
                )}
                {indicator.name === 'MACD' && (
                  <>
                    <label>
                      Fast Length:
                      <input
                        type="number"
                        value={indicator.fastLength}
                        onChange={(e) => handleChange(index, 'fastLength', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                    <label>
                      Slow Length:
                      <input
                        type="number"
                        value={indicator.slowLength}
                        onChange={(e) => handleChange(index, 'slowLength', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                    <label>
                      Signal Length:
                      <input
                        type="number"
                        value={indicator.signalLength}
                        onChange={(e) => handleChange(index, 'signalLength', e.target.value)}
                        className="indicator-input"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorEditor;
