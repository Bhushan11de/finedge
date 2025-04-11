import React, { useState } from "react";
import { auth, db } from "../firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import styles from "./signin.module.css";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        uid: user.uid,
        createdAt: new Date().toISOString()
      });

      // Send email verification (optional)
      // await sendEmailVerification(user);

      router.push("/signupnext");
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // More specific error messages
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email already in use");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters");
          break;
        default:
          setError("Failed to sign up. Please try again.");
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
          <p className={styles.headsignin}>Sign Up</p>
          <form onSubmit={handleSignup} className={styles.inputfields}>
            <label className={styles.textsignin} htmlFor="name">
              Name
            </label>
            <div className={styles.inputoutdiv}>
              <input
                type="text"
                id="name"
                name="name"
                className={styles.emailidinput}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
              />
            </div>

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
                onChange={(e) => setEmail(e.target.value)}
                required
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
                placeholder="Enter your password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className={styles.errorMessage} style={{ color: "red", margin: "10px 0" }}>
                {error}
              </p>
            )}

            <p className={styles.createaccount}>
              Already have an account?{" "}
              <span
                className={styles.signuproute}
                onClick={() => handleNavigation("/signin")}
                style={{ cursor: "pointer" }}
              >
                Sign In
              </span>
            </p>

            <button
              className={styles.buttontext}
              type="submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
