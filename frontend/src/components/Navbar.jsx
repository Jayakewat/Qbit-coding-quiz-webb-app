import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setLoggedIn(!!token);

    const handler = (e) => {
      setLoggedIn(!!e.detail?.user);
    };

    window.addEventListener("authChanged", handler);
    return () => window.removeEventListener("authChanged", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(
      new CustomEvent("authChanged", { detail: { user: null } })
    );
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="logo-qbit-png.png" alt="QuizApp logo" />
      </Link>
      <div className="navbar-title">
        With great Practice comes great Skill
      </div>

      <div className="navbar-buttons">
        <NavLink to="/result" className="nav-btn">
          My Result
        </NavLink>

        {loggedIn ? (
          <button onClick={handleLogout} className="nav-btn">
            Logout
          </button>
        ) : (
          <NavLink to="/login" className="nav-btn">
            Login
          </NavLink>
        )}
      </div>

      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        ☰
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/result" className="mobile-link" onClick={closeMenu}>
            My Result
          </NavLink>

          {loggedIn ? (
            <button onClick={handleLogout} className="mobile-link logout">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="mobile-link" onClick={closeMenu}>
              Login
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
