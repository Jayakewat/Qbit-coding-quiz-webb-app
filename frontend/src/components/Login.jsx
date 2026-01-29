import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css';

const isValidateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const Login = ({ onLoginSuccess = null }) => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // const API_BASE = 'http://localhost:4000';
  const API_BASE = import.meta.env.VITE_API_BASE;

  // Submit handler
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setLoading(true);

    try {
      const payload = { email: email.trim().toLowerCase(), password };
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data = null;

      try {
        data = await resp.json();
      } catch (e) {
        //ignore all errors
      }

      if (!resp.ok) {
        const msg = data?.message || "Login failed";
        setSubmitError(msg);
        return;
      }

      if (data?.token) {
        try {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem(
            'currentUser',
            JSON.stringify(data.user || { email: payload.email })
          )
        } catch (err) {
          //ignore errors
        }
      }

      const user = data.user || { email: payload.email };
      window.dispatchEvent(
        new CustomEvent("authChanged", { detail: { user } })
      );

      if (typeof onLoginSuccess === "function") onLoginSuccess(user);
      navigate("/", { replace: true });
    }
    catch (err) {
      console.error("Login error: ", err);
      setSubmitError("Network error");
    }
    finally {
      setLoading(false);
    }
  };

  //EMAIL VALIDATION FUNCTION

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!isValidateEmail(email)) e.email = "Please enter a valid email";

    if (!password) e.password = "Password is required";
    return e;
  }


  return (
    <>
      <div className="login-page">

        <div className="login-home-btn">
          <button className="nav-btn"><Link to='/' className="nav-link">Home</Link></button>
        </div>

        <div className="login-card">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Enter your email and password</p>

          <form onSubmit={handleSubmit} action="" className="login-form" noValidate>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((s) => ({
                    ...s,
                    email: undefined,
                  }));
              }}
              placeholder="Email"
              required
              className="login-input"
            />

            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}

            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((s) => ({
                    ...s, password: undefined,
                  }));
              }}
              placeholder="Password"
              className="login-input"
              required
            />
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}

            {submitError && (
              <p className="error-text">{submitError}</p>
            )}
            <button type="submit" className="login-btn" disabled={loading} >
              {loading ? ("Login...") : (
                <>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">Don't have an account? <span><Link to="/signup" className="create-acc">Create Account</Link></span></div>
        </div>
      </div>
    </>
  )
}

export default Login
