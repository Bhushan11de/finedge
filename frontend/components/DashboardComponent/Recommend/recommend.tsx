import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import styles from "./recommendations.module.css";

interface Recommendation {
  stock: string;
  action: "buy" | "sell" | "hold";
  quantity: number;
  agent: "conservative" | "moderate" | "aggressive";
  confidence: number;
  day: number;
}

const Recommendations: React.FC = () => {
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState<{ symbol: string; quantity: number }[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeDay, setActiveDay] = useState<number>(1);

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
      } catch (err) {
        setError("Failed to load portfolio");
        console.error("Error fetching stocks:", err);
      }
    };

    fetchUserStocks();
  }, [currentUser]);

  useEffect(() => {
    const filterData = () => {
      let filtered = recommendations.filter(rec => rec.day === activeDay);
      
      if (activeFilter !== "all") {
        filtered = filtered.filter(rec => rec.agent === activeFilter);
      }
      
      setFilteredRecommendations(filtered);
    };

    filterData();
  }, [recommendations, activeFilter, activeDay]);

  const handleGetRecommendations = async () => {
    if (!currentUser || stocks.length === 0) {
      setError("No stocks found in your portfolio");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const portfolio = stocks.reduce((acc, stock) => ({
        ...acc,
        [stock.symbol]: stock.quantity
      }), {} as Record<string, number>);

      const response = await fetch("http://localhost:5000/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Recommendation[] = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
      console.error("Recommendation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI-Powered Stock Recommendations</h1>
      
      {error && <div className={styles.error}>{error}</div>}

      <button
        className={styles.button}
        onClick={handleGetRecommendations}
        disabled={isLoading || !currentUser}
      >
        {isLoading ? (
          <span className={styles.loading}>
            <span className={styles.spinner} /> Analyzing Portfolio...
          </span>
        ) : (
          "Generate Recommendations"
        )}
      </button>

      {recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <h2 className={styles.subtitle}>Trading Strategy for Next 5 Days</h2>

          <div className={styles.filterContainer}>
            <div className={styles.dayFilters}>
              {[1, 2, 3, 4, 5].map(day => (
                <button
                  key={day}
                  className={`${styles.dayButton} ${activeDay === day ? styles.activeDay : ""}`}
                  onClick={() => setActiveDay(day)}
                >
                  Day {day}
                </button>
              ))}
            </div>

            <div className={styles.agentFilters}>
              {["all", "conservative", "moderate", "aggressive"].map(agent => (
                <button
                  key={agent}
                  className={`${styles.filterButton} ${styles[agent]} ${activeFilter === agent ? styles.activeFilter : ""}`}
                  onClick={() => setActiveFilter(agent)}
                >
                  {agent.charAt(0).toUpperCase() + agent.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Stock</th>
                  <th scope="col">Action</th>
                  <th scope="col">Shares</th>
                  <th scope="col">Agent Type</th>
                  <th scope="col">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecommendations.length > 0 ? (
                  filteredRecommendations.map((rec, index) => (
                    <tr key={index}>
                      <td>{rec.stock}</td>
                      <td className={`${styles.action} ${styles[rec.action]}`}>
                        {rec.action.toUpperCase()}
                      </td>
                      <td>{rec.quantity}</td>
                      <td>
                        <span className={`${styles.agentTag} ${styles[rec.agent]}`}>
                          {rec.agent.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className={styles.confidenceBar}>
                          <div 
                            className={styles.confidenceFill}
                            style={{ width: `${rec.confidence * 100}%` }}
                          />
                          <span className={styles.confidenceText}>
                            {(rec.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.noData}>
                      No recommendations for selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
