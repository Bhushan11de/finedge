import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Or next/router for Next.js
import styles from "./signin.module.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      navigate("/signin");
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
          <p className={styles.headsignin}>Sign Up</p>
          <form onSubmit={handleSignup} className={styles.inputfields}>
            <label className={styles.textsignin}>Name</label>
            <input
              type="text"
              className={styles.emailidinput}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              Already have an account?{" "}
              <span
                className={styles.signuproute}
                onClick={() => navigate("/signin")}
              >
                Sign In
              </span>
            </p>

            <button className={styles.buttontext} type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;