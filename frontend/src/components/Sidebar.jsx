import React, { useRef, useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import axios from 'axios'
import { FaCode, FaTimes, FaHtml5, FaJs, FaReact, FaNodeJs, FaJava, FaPython, FaTrophy, FaMedal, FaThumbsUp, FaRedo, } from "react-icons/fa";
import { SiMongodb, SiCplusplus } from "react-icons/si";
import { CheckCircle, XCircle, Menu } from "lucide-react"
import './Sidebar.css';
import questionsData from "../assets/dummyData"

// const API_BASE = "http://localhost:4000";
const API_BASE =
    import.meta.env.VITE_API_BASE ||
    "https://qbit-coding-quiz-webb-app.onrender.com";


const Sidebar = () => {
    const [selectedTech, setSelectedTech] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const submittedRef = useRef(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const asideRef = useRef(null);

    //if the inner width is greater than 768px then it will call this function
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isSidebarOpen && window.innerWidth < 768) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isSidebarOpen]);

    const technologies = [
        {
            id: "html",
            name: "HTML",
            color: "#52b788",
            icon: <FaHtml5 />
        },
        {
            id: "js",
            name: "JavaScript",
            color: "#52b788",
            icon: <FaJs />
        },
        {
            id: "react",
            name: "React",
            color: "#52b788",
            icon: <FaReact />
        },
        {
            id: "node",
            name: "Node.js",
            color: "#52b788",
            icon: <FaNodeJs />
        },
        {
            id: "mongodb",
            name: "MongoDB",
            color: "#52b788",
            icon: <SiMongodb />
        },
        {
            id: "java",
            name: "Java",
            color: "#52b788",
            icon: <FaJava />
        },
        {
            id: "python",
            name: "Python",
            color: "#52b788",
            icon: <FaPython />
        },
        {
            id: "cpp",
            name: "C++",
            color: "#52b788",
            icon: <SiCplusplus />
        },
    ];

    const levels = [
        {
            id: "basic",
            name: "Basic",
            questions: 20,
            color: "#52b788",
        },
        {
            id: "intermediate",
            name: "Intermediate",
            questions: 40,
            color: "#52b788",
        },
        {
            id: "advanced",
            name: "Advanced",
            questions: 60,
            color: "#52b788",
        },
    ];

    //here this funciton will handle what you select the tech
    const handleTechSelect = (techId) => {
        if (selectedTech === techId) {
            setSelectedTech(null); // all the initial values are defined here
            setSelectedLevel(null);
        } else {
            setSelectedTech(techId);
            setSelectedLevel(null);
        }
        setCurrentQuestion(0);
        setUserAnswers({});
        setShowResults(false);
        submittedRef.current = false;

        if (window.innerWidth < 768) setIsSidebarOpen(true);

        setTimeout(() => {
            const el = asideRef.current?.querySelector(`[data-tech="${techId}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
    };

    const handleLevelSelect = (levelId) => {
        setSelectedLevel(levelId);
        setCurrentQuestion(0);
        setUserAnswers({});
        setShowResults(false);
        submittedRef.current = false;

        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleAnswerSelect = (answerIndex) => {
        const newAnswers = {
            ...userAnswers,
            [currentQuestion]: answerIndex
        };
        setUserAnswers(newAnswers);
        setTimeout(() => {
            if (currentQuestion < getQuestions().length - 1) {
                setCurrentQuestion((prev) => prev + 1);
            }
            else {
                setShowResults(true);
            }
        }, 500)
    }

    const getQuestions = () => {
        if (!selectedTech || !selectedLevel) return [];
        return questionsData[selectedTech]?.[selectedLevel] || [];
    }

    //calculate the total score
    const calculateScore = () => {
        const questions = getQuestions();
        let correct = 0;
        questions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        return {
            correct,
            total: questions.length,
            percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0,
        };
    };

    //reset the quiz
    const resetQuiz = () => {
        setCurrentQuestion(0);
        setUserAnswers({});
        setShowResults(false);
        submittedRef.current = false;
    }

    const questions = getQuestions();
    const currentQ = questions.length > 0 && currentQuestion < questions.length
        ? questions[currentQuestion]
        : null;

    const score = calculateScore();

    const getPerformanceStatus = () => {
        if (score.percentage >= 90)
            return {
                text: "Outstanding!",
                icon: <FaTrophy />,
                color: "#52b788",
            };
        if (score.percentage >= 75)
            return {
                text: "Excellent",
                icon: <FaMedal />,
                color: "#52b788",
            };
        if (score.percentage >= 60)
            return {
                text: "Good Job!",
                icon: <FaThumbsUp />,
                color: "#52b788",
            };
        return {
            text: "Keep Practicing",
            icon: <FaRedo />,
            color: "#52b788",
        };
    };

    const performance = getPerformanceStatus();
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);//toggle sidebar for smaller screen

    const getAuthHeader = () => {
        const token = localStorage.getItem('token') ||
            localStorage.getItem('authToken') || null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const submitResult = async () => {
        if (submittedRef.current) return;
        if (!selectedTech || !selectedLevel) return;

        const payload = {
            title: `${selectedTech.toUpperCase()} - ${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)
                }Quiz`,
            technology: selectedTech,
            level: selectedLevel,
            totalQuestions: score.total,
            correct: score.correct,
            wrong: score.total - score.correct,
        };
        try {
            submittedRef.current = true;
            toast.info('saving your result...');
            const res = await axios.post(`${API_BASE}/api/results`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader(),
                },
                timeout: 10000,
            });

            if (res.data && res.data.success) {
                toast.success('Result saved!');
            }
            else {
                toast.warn('Result not saved.');
                submittedRef.current = false;
            }

        } catch (err) {
            submittedRef.current = false;
            console.error(
                "Error saving result:",
                err?.response?.data || err.message || err
            );
            toast.error("Could not save result. Check console or network.");
        }
    }

    useEffect(() => {
        if (showResults && !submittedRef.current) {
            submitResult();
        }

    }, [showResults]);

    const selectedTechObj = technologies.find(t => t.id === selectedTech);

    return (
        <>
            {isSidebarOpen && window.innerWidth < 768 && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={asideRef}
                className={`sidebar ${isSidebarOpen ? "open" : ""}`}
            >
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-icon">
                        <FaCode size={24} />
                    </div>
                    <div>
                        <h2>Coding Quiz</h2>
                        <p>Test your knowledge & improve skills</p>
                    </div>
                </div>

                {/* Technologies */}
                <div className="sidebar-section">
                    <div className="sidebar-section-title">
                        <h3>Technologies</h3>
                        <span>{technologies.length} options</span>
                    </div>

                    <ul className="tech-list">
                        {technologies.map((tech) => (
                            <li key={tech.id}>
                                {/* Technology */}
                                <button
                                    className={`tech-btn ${selectedTech === tech.id ? "active" : ""
                                        }`}
                                    onClick={() => handleTechSelect(tech.id)}
                                >
                                    <span className="tech-icon">{tech.icon}</span>
                                    <span>{tech.name}</span>
                                </button>

                                {/* Levels */}
                                {selectedTech === tech.id && (
                                    <div className="level-list">
                                        {levels.map((level) => (
                                            <button
                                                key={level.id}
                                                className={`level-btn ${selectedLevel === level.id ? "active" : ""
                                                    }`}
                                                onClick={() => handleLevelSelect(level.id)}
                                            >
                                                <span>{level.name}</span>
                                                <span className="q-count">
                                                    {level.questions} Qs
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <p>Keep learning, keep improving</p>
                </div>

            </aside>

            <main className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
                {/* Mobile Header */}
                <div className="mobile-header">

                    <div className="mobile-title">
                        {selectedTech ? (
                            <div className="mobile-tech-info">
                                <div className="mobile-tech-icon">
                                    {selectedTechObj?.icon}
                                </div>
                                <div className="mobile-tech-text">
                                    <div className="mobile-tech-name">
                                        {selectedTechObj?.name}
                                    </div>
                                    <div className="mobile-tech-level">
                                        {selectedLevel
                                            ? `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level`
                                            : "Select level"}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mobile-placeholder">
                                Select a technology from the menu
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Levels */}
                {window.innerWidth < 768 && selectedTech && !selectedLevel && (
                    <div className="mobile-levels">
                        <div className="mobile-levels-container">
                            {levels.map((l) => (
                                <button
                                    key={l.id}
                                    onClick={() => handleLevelSelect(l.id)}
                                    className="mobile-level-button"
                                >
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Welcome */}
                {!selectedTech && (
                    <div className="welcome-container">
                        <h2 className="welcome-title">Welcome to Coding Quiz</h2>
                        <p className="welcome-description">
                            Select a technology from the sidebar to start your quiz journey. Test your knowledge at basic, intermediate or advanced levels.
                        </p>

                        <div className="features-grid">
                            <div className="feature-card">
                                <h3>Multiple Technologies</h3>
                                <p>HTML, CSS, JavaScript, React, and more</p>
                            </div>
                            <div className="feature-card">
                                <h3>Three Difficulty Levels</h3>
                                <p>Basic, Intermediate, Advanced</p>
                            </div>
                            <div className="feature-card">
                                <h3>Instant Feedback</h3>
                                <p>Detailed results and performance analysis</p>
                            </div>
                        </div>

                        <p className="welcome-prompt">
                            Select any technology to begin!
                        </p>
                    </div>
                )}

                {/* Level selection */}

                {selectedTech && !selectedLevel && (
                    <div className="tech-card-wrapper">
                        <div className="tech-card">
                            <div className="tech-card-icon">
                                {selectedTechObj?.icon}
                            </div>

                            <h2 className="tech-card-title">
                                {selectedTechObj?.name} Quiz
                            </h2>

                            <p className="tech-card-subtitle">
                                Select a difficulty level to begin your challenge
                            </p>

                            <div className="tech-card-levels">
                                <p>Get ready to test your{" "}
                                    {technologies.find((t) => t.id === selectedTech).name}{" "}
                                    knowledge!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {showResults && (
                    <div className="results-container">
                        <h2>Quiz Completed!</h2>
                        <p>Score: {score.percentage}%</p>
                        <p>You've completed the {selectedLevel} level</p>
                        <p>{performance.text}</p>
                        <div>
                            <div className=""> <CheckCircle size={24} /> </div>
                            <p className="">Correct Answers: {score.correct}</p>
                        </div>
                        <div>
                            <div className=""> <XCircle size={24} /> </div>
                            <p className="">Incorrect Answers: {score.total - score.correct} </p>
                        </div>
                    </div>

                )}

                {/* Quiz */}
                {currentQ && !showResults && selectedLevel && (
                    <div className="quiz-container">
                        <h2 className="quiz-title">
                            {selectedTechObj?.name} -{" "}
                            {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}{" "}
                            Level
                        </h2>

                        <p className="quiz-counter">
                            Question {currentQuestion + 1} of {questions.length}
                        </p>

                        <div className="question-box">
                            <h3>{currentQ.question}</h3>

                            <div className="options">
                                {currentQ.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswerSelect(i)}
                                        className="option-btn"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile toggle */}
            {!isSidebarOpen && (
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    ☰
                </button>
            )}
        </>

    );
}

export default Sidebar
