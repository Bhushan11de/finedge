import React from "react";
import styles from "./stockdetailspopup.module.css";

interface Stock {
  symbol: string;
  quantity: number;
  price: number;
}

interface StockDetailsPopupProps {
  onClose: () => void;
  stocks: Stock[];
  totalValue: number;
}

const StockDetailsPopup: React.FC<StockDetailsPopupProps> = ({
  onClose,
  stocks,
  totalValue,
}) => {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <button 
          onClick={onClose} 
          className={styles.closeButton}
          aria-label="Close details"
        >
          ×
        </button>
        <h2>Portfolio Details</h2>
        
        {stocks.length === 0 ? (
          <div className={styles.emptyState}>
            No stocks in portfolio
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.stockTable}>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.symbol}>
                      <td>{stock.symbol}</td>
                      <td>{stock.quantity}</td>
                      <td>${stock.price.toFixed(2)}</td>
                      <td>${(stock.price * stock.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={styles.totalValue}>
              <span>Total Value:</span>
              <span>${totalValue.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockDetailsPopup;
