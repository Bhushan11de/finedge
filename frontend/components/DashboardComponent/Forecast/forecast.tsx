import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import Chart from "chart.js/auto";
import styles from "./forecast.module.css";

interface Stock {
  id: string;
  symbol: string;
  quantity: number;
}

interface ForecastData {
  dates: string[];
  prices: number[];
  prediction: number[];
}

const Forecast: React.FC = () => {
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
          id: doc.id,
          ...doc.data()
        }) as Stock);
        
        setStocks(stocksData);
      } catch (err) {
        setError("Failed to load portfolio");
        console.error("Error fetching stocks:", err);
      }
    };

    fetchUserStocks();
  }, [currentUser]);

  const handleForecast = async () => {
    if (!selectedStock) {
      setError("Please select a stock");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          stock_symbol: selectedStock,
          days: 30 // Add configurable parameter
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ForecastData = await response.json();
      
      if (data.dates.length === 0) {
        throw new Error("No forecast data received");
      }

      setForecastData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Forecast failed");
      console.error("Forecast error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initChart = () => {
      if (!forecastData || !chartRef.current) return;

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      // Destroy previous chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const allPrices = [...forecastData.prices, ...forecastData.prediction];
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [...forecastData.dates, "Future"],
          datasets: [
            {
              label: "Historical Prices",
              data: forecastData.prices,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: false,
            },
            {
              label: "Predicted Prices",
              data: [...forecastData.prices.slice(-1), ...forecastData.prediction],
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Date"
              },
              grid: {
                display: false
              }
            },
            y: {
              title: {
                display: true,
                text: "Price ($)"
              },
              min: minPrice * 0.95,
              max: maxPrice * 1.05,
            }
          },
          plugins: {
            tooltip: {
              mode: "index",
              intersect: false,
            },
            legend: {
              position: "top",
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
  }, [forecastData]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stock Price Forecast</h1>
      
      <div className={styles.controls}>
        <select
          className={styles.select}
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          disabled={isLoading}
        >
          <option value="">{stocks.length ? "Select Stock" : "No stocks available"}</option>
          {stocks.map((stock) => (
            <option key={stock.id} value={stock.symbol}>
              {stock.symbol} ({stock.quantity} shares)
            </option>
          ))}
        </select>

        <button
          className={styles.button}
          onClick={handleForecast}
          disabled={isLoading || !selectedStock}
        >
          {isLoading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} /> Forecasting...
            </span>
          ) : (
            "Generate Forecast"
          )}
        </button>

        {forecastData && (
          <button
            className={styles.resetButton}
            onClick={() => {
              setForecastData(null);
              setSelectedStock("");
            }}
          >
            Reset
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {forecastData && (
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} className={styles.chart} />
        </div>
      )}
    </div>
  );
};

export default Forecast;
