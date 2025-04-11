import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import styles from "./realtime.module.css";

interface Stock {
  symbol: string;
  quantity: number;
}

interface RealTimeData {
  symbol: string;
  price: number;
  change?: number;
}

const RealTimeData: React.FC = () => {
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserStocks = async () => {
      if (!currentUser) return;

      try {
        const stocksQuery = query(
          collection(db, "users", currentUser.uid, "stocks"),
          where("quantity", ">", 0)
        );

        const unsubscribe = onSnapshot(stocksQuery, (snapshot) => {
          const stocksData = snapshot.docs.map(doc => ({
            symbol: doc.id,
            quantity: doc.data().quantity
          }));
          setStocks(stocksData);
          fetchRealTimeData(stocksData);
        });

        return unsubscribe;
      } catch (err) {
        setError("Failed to load portfolio");
        console.error("Error fetching stocks:", err);
      }
    };

    fetchUserStocks();
  }, [currentUser]);

  const fetchRealTimeData = async (stocks: Stock[]) => {
    try {
      setIsLoading(true);
      const dataPromises = stocks.map(async (stock) => {
        const response = await fetch(
          `http://localhost:3001/api/stock?symbol=${stock.symbol}`
        );
        if (!response.ok) throw new Error("Price fetch failed");
        const data = await response.json();
        return {
          symbol: stock.symbol,
          price: data.regularMarketPrice,
          change: data.regularMarketChangePercent
        };
      });

      const realTimeData = await Promise.all(dataPromises);
      setRealTimeData(realTimeData);
      setError("");
    } catch (err) {
      setError("Failed to fetch real-time data");
      console.error("Real-time data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return styles.neutral;
    return change >= 0 ? styles.positive : styles.negative;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Real-Time Portfolio</h1>
      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading market data...
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const rtData = realTimeData.find(d => d.symbol === stock.symbol);
                const value = rtData ? stock.quantity * rtData.price : 0;
                
                return (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol}</td>
                    <td>{stock.quantity}</td>
                    <td>${rtData?.price.toFixed(2) || "N/A"}</td>
                    <td className={getChangeColor(rtData?.change)}>
                      {rtData?.change ? `${rtData.change.toFixed(2)}%` : "-"}
                    </td>
                    <td>${value.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RealTimeData;
