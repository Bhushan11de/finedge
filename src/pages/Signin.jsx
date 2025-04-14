import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Or next/router for Next.js
import styles from "./signin.module.css";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signin`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signin failed");
      }

      // Optionally store user or token here (localStorage or context)
      // localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signin}>
      <div className={styles.signincont}>
        <div className={styles.signinside}>
          <p className={styles.headsignin}>Sign In</p>
          <form onSubmit={handleSignin} className={styles.inputfields}>
            <label className={styles.textsignin}>Email-ID</label>
            <input
              type="email"
              className={styles.emailidinput}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className={styles.textsignin}>Password</label>
            <input
              type="password"
              className={styles.passwordinput}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <p className={styles.createaccount}>
              Don't have an account?{" "}
              <span
                className={styles.signuproute}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </p>

            <button className={styles.buttontext} type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
