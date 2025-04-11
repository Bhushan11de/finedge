import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import Chart from "chart.js/auto";
import styles from "./historic.module.css";

interface HistoricData {
  dates: string[];
  prices: number[];
}

const HistoricData: React.FC = () => {
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState<{ symbol: string; quantity: number }[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("1mo");
  const [historicData, setHistoricData] = useState<HistoricData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchUserStocks = async () => {
      if (!currentUser) return;
      
      try {
        const stocksQuery = query(
          collection(db, "users", currentUser.uid, "stocks"),
          where("quantity", ">", 0)
        );
        
        const snapshot = await getDocs(stocksQuery);
        const stocksData = snapshot.docs.map(doc => ({
          symbol: doc.id,
          quantity: doc.data().quantity
        }));
        
        setStocks(stocksData);
        if (stocksData.length > 0) setSelectedStock(stocksData[0].symbol);
      } catch (err) {
        setError("Failed to load portfolio");
        console.error("Error fetching stocks:", err);
      }
    };

    fetchUserStocks();
  }, [currentUser]);

  const handleFetchHistoricData = async () => {
    if (!selectedStock) {
      setError("Please select a stock");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/historic?symbol=${selectedStock}&range=${timeRange}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHistoricData({
        dates: data.dates,
        prices: data.prices.map((priceArray: number[]) => priceArray[0])
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Historic data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initChart = () => {
      if (!historicData || !chartRef.current) return;

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: historicData.dates,
          datasets: [{
            label: "Historic Prices",
            data: historicData.prices,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: (context) => 
                  `$${context.parsed.y.toFixed(2)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              title: { display: true, text: "Date" },
              ticks: { maxTicksLimit: 10 }
            },
            y: {
              title: { display: true, text: "Price (USD)" },
              ticks: { 
                callback: (value) => `$${Number(value).toFixed(2)}` 
              }
            }
          }
        }
      });
    };

    initChart();
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [historicData]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Historical Stock Analysis</h1>
      
      <div className={styles.controls}>
        <div className={styles.selectGroup}>
          <select
            className={styles.select}
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            disabled={stocks.length === 0}
          >
            {stocks.length === 0 ? (
              <option value="">No stocks available</option>
            ) : (
              <>
                <option value="">Select a stock</option>
                {stocks.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol}
                  </option>
                ))}
              </>
            )}
          </select>
          
          <select
            className={styles.select}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {["5d", "1mo", "6mo", "1y", "5y"].map((range) => (
              <option key={range} value={range}>
                {{
                  '5d': '5 Days',
                  '1mo': '1 Month',
                  '6mo': '6 Months',
                  '1y': '1 Year',
                  '5y': '5 Years'
                }[range]}
              </option>
            ))}
          </select>
        </div>

        <button
          className={styles.button}
          onClick={handleFetchHistoricData}
          disabled={isLoading || !selectedStock}
        >
          {isLoading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} /> Loading...
            </span>
          ) : (
            "Analyze History"
          )}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.chartContainer}>
        <canvas ref={chartRef} className={styles.chart} />
      </div>
    </div>
  );
};

export default HistoricData;
