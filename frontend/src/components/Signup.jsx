import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = ({onSignupSuccess}) => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const API_BASE = "http://localhost:4000";

  const validate = () => {
    const e = {};
    if (!name) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      const resp = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setSubmitError(data.message || "Signup failed");
        return;
      }

      if(data?.token){
        try{
            localStorage.setItem("authToken", data.token);
            localStorage.setItem(
                "currentUser",
                JSON.stringify(
                    data.user || {
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                    }
                )
            );
        } catch (err){
            //ignore all the error
        }
      }
      if(typeof onSignupSuccess === "function"){
        try{
            onSignupSuccess(
                data.user || {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                }
            );
        } catch(err){

        }
      }

      // redirect to login after signup
      navigate("/login", { replace: true });
    } catch (err) {
      setSubmitError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Home Button */}
      <div className="signup-home-btn">
        <Link to="/" className="nav-btn nav-link">Home</Link>
      </div>

      {/* Signup Card */}
      <div className="signup-card">
        <h2 className="signup-title">Create Account</h2>
        <p className="signup-subtitle">Join and start taking quizzes</p>

        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <input
            type="text"
            placeholder="Full Name"
            className="signup-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <input
            type="email"
            placeholder="Email"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <input
            type="password"
            placeholder="Confirm Password"
            className="signup-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}

          {submitError && <p className="error-text">{submitError}</p>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/login" className="login-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

