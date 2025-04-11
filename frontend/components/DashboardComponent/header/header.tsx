import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "./header.module.css";
import logoImage from "../assets/image 3.png";
import notiImage from "../assets/icon_bell.png";
import profileImage from "../assets/profile.png";

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerLeft}>
        <div className={styles.logoContainer}>
          <Image 
            src={logoImage} 
            alt="Investlytic Logo" 
            className={styles.logo}
            priority
          />
        </div>
        <div className={styles.companyInfo}>
          <h1 className={styles.companyName}>Investlytic</h1>
          <p className={styles.tagline}>
            Empower Your Trades with Insightful Predictions
          </p>
        </div>
      </div>

      <div className={styles.headerRight}>
        <button className={styles.iconButton} aria-label="Notifications">
          <Image
            src={notiImage}
            alt="Notifications"
            className={styles.icon}
          />
        </button>
        
        <button className={styles.iconButton} aria-label="Profile">
          <Image
            src={profileImage}
            alt="User Profile"
            className={styles.profileIcon}
          />
        </button>

        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
