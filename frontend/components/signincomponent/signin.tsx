import React, { useState } from "react";
import { auth } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import styles from "./signin.module.css";

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign-in error:", err);
      
      // Specific error messages
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-disabled":
          setError("Account disabled");
          break;
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later");
          break;
        default:
          setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.signin}>
      <div className={styles.signincont}>
        <div className={styles.signinside}>
          <p className={styles.headsignin}>Sign In</p>
          <form onSubmit={handleSignin} className={styles.inputfields}>
            <label className={styles.textsignin} htmlFor="email">
              Email-ID
            </label>
            <div className={styles.inputoutdiv}>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.emailidinput}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                autoComplete="username"
              />
            </div>

            <label className={styles.textsignin} htmlFor="password">
              Password
            </label>
            <div className={styles.inputoutdiv}>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.passwordinput}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className={styles.errorMessage} style={{ 
                color: "red", 
                margin: "10px 0",
                textAlign: "center"
              }}>
                {error}
              </p>
            )}

            <p className={styles.createaccount}>
              Don't have an account?{" "}
              <span
                className={styles.signuproute}
                onClick={() => handleNavigation("/signup")}
                style={{ cursor: "pointer" }}
              >
                Sign Up
              </span>
            </p>

            <button
              className={styles.buttontext}
              type="submit"
              disabled={loading}
              style={{ 
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
