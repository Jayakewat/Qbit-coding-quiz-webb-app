import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import './MyResult.css';

const Badge = ({ percent }) => {
  if (percent >= 85)
    return <span className="badge-excellent">Excellent</span>;
  if (percent >= 65)
    return <span className="badge-good">Good</span>;
  if (percent >= 45)
    return <span className="badge-average">Average</span>;
  return <span className="badge-needswork">Needs Work</span>;
};

const MyResult = ({ apiBase = "http://localhost:4000" }) => {

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTechnology, setSelectedTechnology] = useState("all");
  const [technologies, setTechnologies] = useState([]);

  const getAuthHeader = useCallback(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);


  // Effect: Fetch results when component mounts or when selectedTechnology changes
  useEffect(() => {
    let mounted = true;
    const fetchResults = async (tech = "all") => {
      setLoading(true);
      setError(null);
      try {
        const q =
          tech && tech.toLowerCase() !== "all"
            ? `?technology=${encodeURIComponent(tech)}`
            : "";

        const authHeader = getAuthHeader();
        if (!authHeader.Authorization) {
          setError("Please login to view results.");
          setLoading(false);
          return;
        }


        const res = await axios.get(`${apiBase}/api/results${q}`, {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          timeout: 10000,
        });
        if (!mounted) return;
        if (res.status === 200 && res.data && res.data.success) {
          setResults(Array.isArray(res.data.results) ? res.data.results : []);
        } else {
          setResults([]);
          toast.warn("Unexpected server response while fetching results.");
        }
      } catch (err) {
        console.error(
          "Failed to fetch results:",
          err?.response?.data || err.message || err
        );
        if (!mounted) return;
        if (err?.response?.status === 401) {
          setError("Not authenticated. Please log in to view results.");
          toast.error("Not authenticated. Please login.");
        } else {
          setError("Could not load results from server.");
          toast.error("Could not load results from server.");
          setResults([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResults(selectedTechnology);
    return () => {
      mounted = false;
    };
  }, [apiBase, selectedTechnology, getAuthHeader]);


 
  useEffect(() => {
    let mounted = true;
    const fetchAllForTechList = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/results`, {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          timeout: 10000,
        });
        if (!mounted) return;
        if (res.status === 200 && res.data && res.data.success) {
          const all = Array.isArray(res.data.results) ? res.data.results : [];
          const set = new Set();
          all.forEach((r) => {
            if (r.technology) set.add(r.technology);
          });
          const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
          console.log(arr);

          setTechnologies(arr);
        } else {
          // leave technologies empty, will still show "All"
        }
      } catch (err) {
        console.error(
          "Failed to fetch technologies:",
          err?.response?.data || err.message || err
        );
      }
    };
    fetchAllForTechList();
    return () => {
      mounted = false;
    };
  }, [apiBase, getAuthHeader]);

  const makeKey = (r) => (r && r._id ? r._id : `${r.id}||${r.title}`);

  const summary = useMemo(() => {
    const source = Array.isArray(results) ? results : [];
    const totalQs = source.reduce(
      (s, r) => s + (Number(r.totalQuestions) || 0),
      0
    );
    const totalCorrect = source.reduce(
      (s, r) => s + (Number(r.correct) || 0),
      0
    );
    const totalWrong = source.reduce((s, r) => s + (Number(r.wrong) || 0), 0);
    const pct = totalQs ? Math.round((totalCorrect / totalQs) * 100) : 0;
    return { totalQs, totalCorrect, totalWrong, pct };
  }, [results]);

  // Group results by the first word of the title (used as "track")
  const grouped = useMemo(() => {
    const src = Array.isArray(results) ? results : [];
    const map = {};
    src.forEach((r) => {
      const track = (r.title || "").split(" ")[0] || "General";
      if (!map[track]) map[track] = [];
      map[track].push(r);
    });
    return map;
  }, [results]);


  // Handler called when user clicks a technology filter button
  const handleSelectTech = (tech) => {
    setSelectedTechnology(tech || "all");
  };


  return (
    <div className="page-container">
      <div className="container">
        <header className="header">
          <div>
            <h1 className="title"> Quiz Results </h1>
          </div>
          <div className="header-controls"></div>
        </header>

        <div className="filter-container">
          <div className="filter-content">
            <div className="filter-buttons">
              <span className="filter-label">Filter by tech: </span>
              <button
                onClick={() => handleSelectTech("all")}
                className={`filter-button ${selectedTechnology === "all" ? "filter-button-active" : "filter-button-inactive"}`}
              >
                All
              </button>

              {/* dynamic technology buttons */}
              {technologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleSelectTech(tech)}
                  className={`filter-button ${selectedTechnology === tech
                    ? "filter-button-active"
                    : "filter-button-inactive"
                    }`}
                >
                  {tech}
                </button>
              ))}

              {/* If we don't yet have technologies but results exist, derive from current results */}
              {technologies.length === 0 &&
                Array.isArray(results) &&
                results.length > 0 &&
                [
                  ...new Set(results.map((r) => r.technology).filter(Boolean)),
                ].map((tech) => (
                  <button
                    key={`fallback-${tech}`}
                    onClick={() => handleSelectTech(tech)}
                    className={`filter-button ${selectedTechnology === tech
                      ? "filter-button-active"
                      : "filter-button-inactive"
                      }`}
                    aria-pressed={selectedTechnology === tech}
                  >
                    {tech}
                  </button>
                ))}
            </div>

            <div className="filter-status">
              {selectedTechnology === "all" ? "Showing all technologies" : `Filtering: ${selectedTechnology}`}
            </div>

          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text"> Loading results....</div>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([track, items]) => (
              <section key={track} className="track-section">
                <h2 className="track-title"> {track} Track </h2>

                <div className="results-grid">
                  {items.map((r) => (
                    <StripCard key={makeKey(r)} item={r} />
                  ))}
                </div>
              </section>
            ))}

            {Array.isArray(results) && results.length === 0 && !error && (
              <div className="empty-state">
                No result yet. Take a quiz to see results here.
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
};

//STRIP CARD
function StripCard({ item }) {
  const percent = item.totalQuestions
    ? Math.round((Number(item.correct) / Number(item.totalQuestions)) * 100)
    : 0;

  const getLevel = (it) => {
    const id = (it.id || "").toString().toLowerCase();
    const title = (it.title || "").toString().toLowerCase();
    if (id.includes("basic") || title.includes(" basic"))
      return { letter: "B", style: "level-basic" };
    if (id.includes("intermediate") || title.includes(" intermediate"))
      return { letter: "I", style: "level-intermediate" };
    return { letter: "A", style: "level-advanced" };
  };

  const level = getLevel(item);

  return(
    <article className="card">
      <div className="card-accent"></div>
      <div className="card-content">
        <div className="card-header">
          <div className="card-info">
            <div className="level-avatar level-style">
              {level.letter}
            </div>

            <div className="card-text">
              <h3 className="card-title">{item.title}</h3>

              <div className="card-meta">
                {item.totalQuestions} Qs 
                {item.timeSpent ? ` • ${item.timeSpent}` : ""}
              </div>
            </div>

          </div>

          <div className="card-performance">
            <div className="performance-label">Performance</div>
            <div className="badge-container">
              <Badge percent={percent} />
            </div>
          </div>
        </div>

        <div className="cart-state">
          <div className="stat-item">
            Correct:
            <span className="stat-number">{item.correct}</span>
          </div>

          <div className="stat-item">
            Wrong:
            <span className="stat-number">{item.wrong}</span>
          </div>

          <div className="stat-item">
            Score:
            <span className="stat-number">{percent}%</span>
          </div>
        </div>

      </div>
    </article>
  )
}
  export default MyResult;
