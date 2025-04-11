import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "./sidebar.module.css";

// Import SVG icons (recommended to use SVG files instead of PNG)
import PortfolioIcon from "../assets/portfolio.svg";
import ForecastIcon from "../assets/chart.svg";
import RecommendIcon from "../assets/recommend.svg";
import RealtimeIcon from "../assets/live.svg";
import HistoryIcon from "../assets/history.svg";

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  const menuItems = [
    { path: "/dashboard", icon: PortfolioIcon, label: "Portfolio" },
    { path: "/forecast", icon: ForecastIcon, label: "Forecast" },
    { path: "/recommend", icon: RecommendIcon, label: "Recommend" },
    { path: "/realtime", icon: RealtimeIcon, label: "Real-Time" },
    { path: "/historic", icon: HistoryIcon, label: "History" }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      {menuItems.map((item) => (
        <button
          key={item.path}
          className={`${styles.menuItem} ${
            router.pathname === item.path ? styles.active : ""
          }`}
          onClick={() => handleNavigation(item.path)}
          aria-current={router.pathname === item.path ? "page" : undefined}
        >
          <Image 
            src={item.icon} 
            alt="" 
            width={24} 
            height={24} 
            className={styles.icon}
            aria-hidden="true"
          />
          <span className={styles.menuText}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
