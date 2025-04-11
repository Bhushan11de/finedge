import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/auth/AuthContext";
import { db } from "../../firebaseconfig";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import AddStockPopup from "./AddStockPopup";
import StockDetailsPopup from "./StockDetailsPopup";
import SellStockPopup from "./SellStockPopup";
import styles from "./portfolio.module.css";

interface Stock {
  id: string;
  symbol: string;
  quantity: number;
  price?: number;
}

const Portfolio: React.FC = () => {
  const { currentUser } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isDetailsPopupVisible, setIsDetailsPopupVisible] = useState(false);
  const [isSellPopupVisible, setIsSellPopupVisible] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", currentUser.uid, "stocks"),
      (snapshot) => {
        const stocksData: Stock[] = [];
        snapshot.forEach(doc => {
          stocksData.push({ id: doc.id, ...doc.data() } as Stock);
        });
        setStocks(stocksData);
        setLoading(false);
      },
      (err) => {
        setError("Error fetching portfolio data");
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            const response = await fetch(
              `http://localhost:3001/api/stock?symbol=${stock.symbol}`
            );
            const data = await response.json();
            return { ...stock, price: data.regularMarketPrice };
          })
        );
        
        const total = updatedStocks.reduce(
          (acc, stock) => acc + (stock.price || 0) * stock.quantity,
          0
        );
        
        setStocks(updatedStocks);
        setTotalValue(total);
      } catch (err) {
        setError("Error fetching stock prices");
        console.error(err);
      }
    };

    if (stocks.length > 0) fetchPrices();
  }, [stocks.length]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{currentUser?.displayName || "Portfolio"}</h1>
        <h3>
          Total Value:{" "}
          {loading ? "Loading..." : `$${totalValue.toFixed(2)}`}
        </h3>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.buttonContainer}>
        <button 
          className={styles.button}
          onClick={() => setIsDetailsPopupVisible(true)}
        >
          📊 View Details
        </button>
        <button 
          className={styles.button}
          onClick={() => setIsPopupVisible(true)}
        >
          ➕ Add Stock
        </button>
        <button 
          className={styles.button}
          onClick={() => setIsSellPopupVisible(true)}
        >
          ➖ Sell Stock
        </button>
      </div>

      {isPopupVisible && (
        <AddStockPopup
          onClose={() => setIsPopupVisible(false)}
          onAddStock={(newStock) => setStocks(prev => [...prev, newStock])}
        />
      )}

      {isDetailsPopupVisible && (
        <StockDetailsPopup
          onClose={() => setIsDetailsPopupVisible(false)}
          stocks={stocks}
          totalValue={totalValue}
        />
      )}

      {isSellPopupVisible && (
        <SellStockPopup
          onClose={() => setIsSellPopupVisible(false)}
          stocks={stocks}
          onSellStock={(symbol, quantity) => {
            setStocks(prev => prev.map(stock => 
              stock.symbol === symbol 
                ? { ...stock, quantity: stock.quantity - quantity }
                : stock
            ));
          }}
        />
      )}
    </div>
  );
};

export default Portfolio;
