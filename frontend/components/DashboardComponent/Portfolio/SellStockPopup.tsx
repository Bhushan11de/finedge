import React, { useState } from "react";
import { db } from "@/src/firebaseconfig"; // Adjust the path as needed
import { doc, updateDoc, getDoc } from "firebase/firestore";
import styles from "./sellstockpopup.module.css";

interface SellStockPopupProps {
  onClose: () => void;
  email: string;
  stocks: { symbol: string; quantity: number }[];
  onSellStock: (symbol: string, quantity: number) => void;
}

const SellStockPopup: React.FC<SellStockPopupProps> = ({
  onClose,
  email,
  stocks,
  onSellStock,
}) => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(0);

  const handleSellStock = async () => {
    if (selectedStock && quantity > 0) {
      const stockRef = doc(db, "userstocks", email, "stocks", selectedStock);
      const stockDoc = await getDoc(stockRef);
      if (stockDoc.exists()) {
        const currentQuantity = stockDoc.data().quantity;
        if (currentQuantity >= quantity) {
          await updateDoc(stockRef, {
            quantity: currentQuantity - quantity,
          });
          onSellStock(selectedStock, quantity);
          onClose();
        } else {
          alert("Not enough quantity to sell");
        }
      } else {
        alert("Stock not found");
      }
    }
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <button onClick={onClose} className={styles.closeButton}>
          X
        </button>
        <h2>Sell Stock</h2>
        <select
          value={selectedStock || ""}
          onChange={(e) => setSelectedStock(e.target.value)}
        >
          <option value="" disabled>
            Select a stock
          </option>
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.symbol}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button onClick={handleSellStock}>Sell Stock</button>
      </div>
    </div>
  );
};

export default SellStockPopup;
