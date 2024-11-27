import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CandlestickChart = ({ symbol, interval, network }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const tooltipRef = useRef(null);

  // Define the base URLs for mainnet and testnet
  const baseApiUrl =
    network === "TESTNET"
      ? "https://testnet.binance.vision/api/v3/klines"
      : "https://api.binance.com/api/v3/klines";
  const baseWsUrl =
    network === "TESTNET"
      ? "wss://testnet.binance.vision/ws"
      : "wss://stream.binance.com:9443/ws";

  useEffect(() => {
    const chartElement = chartContainerRef.current;
    if (!chartElement) return;

    const chart = createChart(chartElement, {
      width: chartElement.clientWidth,
      height: 400,
      layout: {
        textColor: "#d1d4dc",
        background: { type: "solid", color: "#1c1f26" },
        borderColor: "#2f353b",
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
      },
      crosshair: {
        vertLine: { color: "#7f8c8d", labelBackgroundColor: "#7f8c8d" },
        horzLine: { color: "#7f8c8d", labelBackgroundColor: "#7f8c8d" },
      },
      grid: {
        vertLines: { color: "#2f353b" },
        horzLines: { color: "#2f353b" },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        fontSize: 12,
      },
      timeScale: {
        borderVisible: true,
        borderColor: "#2f353b",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#0fff6b",
      downColor: "#f95c5c",
      borderVisible: false,
      wickUpColor: "#0fff6b",
      wickDownColor: "#f95c5c",
    });

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.background = "#2f353b";
    tooltip.style.color = "#d1d4dc";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.display = "none";
    chartElement.appendChild(tooltip);
    tooltipRef.current = tooltip;

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !tooltipRef.current) {
        tooltip.style.display = "none";
        return;
      }

      tooltip.style.left = `${param.point.x + 10}px`;
      tooltip.style.top = `${param.point.y - 30}px`;
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    return () => {
      chart.remove();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Function to load initial data
  async function loadInitialData() {
    if (!candlestickSeriesRef.current) return;

    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    const startTime = fourMonthsAgo.getTime();
    const endTime = Date.now();

    const url = `${baseApiUrl}?symbol=${symbol.toUpperCase()}&interval=${interval}&endTime=${endTime}&limit=1000`;

    const response = await fetch(url);
    const data = await response.json();

    const formattedData = data.map((item) => ({
      time: item[0] / 1000 + 10800,
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
    }));

    candlestickSeriesRef.current.setData(formattedData);
  }

  // Function to subscribe to live updates
  const subscribeToLiveUpdates = () => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(
      `${baseWsUrl}/${symbol.toLowerCase()}@kline_${interval}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const { k: candle } = message;

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.update({
          time: candle.t / 1000 + 10800,
          open: parseFloat(candle.o),
          high: parseFloat(candle.h),
          low: parseFloat(candle.l),
          close: parseFloat(candle.c),
        });
      }
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    loadInitialData();
    subscribeToLiveUpdates();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [symbol, interval, network]);

  return <div ref={chartContainerRef} className="chart-container"></div>;
};

export default CandlestickChart;
