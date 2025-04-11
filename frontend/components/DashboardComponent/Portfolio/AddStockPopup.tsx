import React, { useState, useEffect } from "react";
import { db } from "@/src/firebaseconfig"; // Adjust the path as needed
import { doc, setDoc } from "firebase/firestore";
import styles from "./addstockpopup.module.css";

interface AddStockPopupProps {
  onClose: () => void;
  onAddStock: (stock: any) => void;
  email: string;
}

const AddStockPopup: React.FC<AddStockPopupProps> = ({
  onClose,
  onAddStock,
  email,
}) => {
  const [stocks, setStocks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState<number | null>(null);

  useEffect(() => {
    if (searchTerm) {
      // Fetch stock names from the Express API
      const fetchStocks = async () => {
        try {
          console.log("Fetching stocks for search term:", searchTerm); // Log the search term
          const response = await fetch(
            `http://localhost:3001/api/search?q=${searchTerm}`
          );
          const data = await response.json();
          console.log("Fetched stocks:", data); // Log the fetched data
          setStocks(data);
        } catch (error) {
          console.error("Error fetching stocks:", error);
        }
      };

      fetchStocks();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (selectedStock) {
      // Fetch stock price for the selected stock
      const fetchStockPrice = async () => {
        try {
          console.log("Fetching price for selected stock:", selectedStock); // Log the selected stock
          const response = await fetch(
            `http://localhost:3001/api/stock?symbol=${selectedStock}`
          );
          const data = await response.json();
          console.log("Fetched stock price:", data); // Log the fetched price
          setPrice(data.regularMarketPrice);
        } catch (error) {
          console.error("Error fetching stock price:", error);
        }
      };

      fetchStockPrice();
    }
  }, [selectedStock]);

  useEffect(() => {
    if (quantity > 0 && price !== null) {
      setTotalValue(quantity * price);
    } else {
      setTotalValue(null);
    }
  }, [quantity, price]);

  const handleAddStock = async () => {
    if (selectedStock && quantity > 0) {
      const stockData = {
        quantity,
        symbol: selectedStock,
      };

      try {
        const stockRef = doc(db, "userstocks", email, "stocks", selectedStock);
        await setDoc(stockRef, stockData);
        onAddStock(stockData);
        onClose();
      } catch (error) {
        console.error("Error adding stock:", error);
      }
    }
  };

  const currencySymbol = selectedStock?.endsWith(".NS") ? "₹" : "$";

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <button onClick={onClose} className={styles.closeButton}>
          X
        </button>
        <h2>Add Stock</h2>
        <p>Current User: {email}</p> {/* Display the current user's email */}
        <input
          type="text"
          placeholder="Search for a stock"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul className={styles.stockList}>
          {stocks.map((symbol) => (
            <li
              key={symbol}
              onClick={() => setSelectedStock(symbol)}
              className={styles.stockItem}
            >
              {symbol}
            </li>
          ))}
        </ul>
        {selectedStock && (
          <div className={styles.selectedStock}>
            <h3>{selectedStock}</h3>
            <p>
              Current Price:{" "}
              {price !== null ? `${currencySymbol}${price}` : "Loading..."}
            </p>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="Price"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
            <p>
              Total Value:{" "}
              {totalValue !== null ? `${currencySymbol}${totalValue}` : "N/A"}
            </p>
            <button onClick={handleAddStock}>Add Stock</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStockPopup;
