import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaChartLine,
  FaEnvelope,
  FaGlobe,
  FaLayerGroup,
  FaPhoneAlt,
  FaRocket,
  FaShieldAlt,
  FaUserTie,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import UserService from "../../services/UserService";
import { Link } from "react-router-dom";
import RevenueRadarLogo from "../svg/RevenueRadarLogo";
import { requireLogin } from "../HelperFunction/helperFunction";

const { REACT_APP_REDIRECT_URI } = process.env;

const HomePage = ({ theme = "light", toggleTheme }) => {
  const isDark = theme === "dark";
  const heroRef = useRef(null);

  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "",
    mobile: "",
    message: "",
    consent: false,
  });

  const handleLogin = () => requireLogin("/dashboard");

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMouse({ x, y });
    };

    const node = heroRef.current;
    if (node) node.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (node) node.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Demo request:", formData);
  };

  const scrollToForm = () => {
    const el = document.getElementById("contact-demo-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <div className="rr-landing-root">
        <section
          ref={heroRef}
          className="rr-hero-shell"
          style={{ "--mx": `${mouse.x}%`, "--my": `${mouse.y}%` }}
        >
          <div className="rr-spotlight" />

          <div className="rr-navbar">
            <div className="rr-wide-container">
              <div className="rr-navbar-row">
                <div className="rr-brand">
                  <RevenueRadarLogo
                    theme={theme}
                    width={280}
                    height={56}
                    showTagline={true}
                    animated={true}
                  />
                </div>

                <div className="rr-navbar-right">
                  <div className="rr-nav-links">
                    <a href="#benefits">Benefits</a>
                    <a href="#features">Features</a>
                    <a href="#contact-demo-form">Contact</a>
                  </div>

                  <div className="rr-nav-actions">
                    <button
                      type="button"
                      className="rr-btn rr-btn-secondary rr-btn-icon"
                      onClick={toggleTheme}
                      title={theme === "light" ? "Switch to light mode" : "Switch to dark mode"}
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
                    </button>

                    {!UserService.isLoggedIn() ? (
                      <button
                        type="button"
                        className="rr-btn rr-btn-outline"
                        onClick={handleLogin}
                      >
                        Login <i className="fas fa-sign-in-alt"></i>
                      </button>
                    ) : (
                      <div className="dropdown rr-user-dropdown-wrap">
                        <button
                          className="rr-user-trigger"
                          type="button"
                          id="rrUserDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span className="rr-user-trigger-left">
                            <span className="rr-user-avatar">
                              <i className="fas fa-user-circle"></i>
                            </span>
                            <span className="rr-user-name">
                              {UserService.getUsername()?.toUpperCase()}
                            </span>
                          </span>

                          <span className="rr-user-caret">
                            <i className="fas fa-chevron-down"></i>
                          </span>
                        </button>

                        <ul
                          className="dropdown-menu dropdown-menu-end rr-user-menu"
                          aria-labelledby="rrUserDropdown"
                        >
                          <li>
                            <Link to="/dashboard" className="rr-user-menu-item">
                              <span className="rr-user-menu-icon">
                                <i className="fas fa-chart-line"></i>
                              </span>
                              <span>Dashboard</span>
                            </Link>
                          </li>

                          <li className="rr-user-menu-divider"></li>

                          <li>
                            <button
                              type="button"
                              className="rr-user-menu-item rr-user-menu-item-danger"
                              onClick={() =>
                                UserService.doLogout({
                                  redirectUri: `${REACT_APP_REDIRECT_URI}`,
                                })
                              }
                            >
                              <span className="rr-user-menu-icon">
                                <i className="fas fa-sign-out-alt"></i>
                              </span>
                              <span>Logout</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}

                    <button
                      type="button"
                      className="rr-btn rr-btn-primary"
                      onClick={scrollToForm}
                    >
                      Request Demo <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rr-hero-content">
            <div className="rr-wide-container">
              <div className="rr-hero-grid-main">
                <div className="rr-left">
                  <div className="rr-badge">
                    <FaWandMagicSparkles />
                    AI-powered planning, simulation & optimization
                  </div>

                  <h1 className="rr-title">
                    Transform
                    <br />
                    spend into
                    <br />
                    <span className="grad">predictable</span>
                    <br />
                    <span className="grad">growth.</span>
                  </h1>

                  <p className="rr-subtitle">
                    A premium marketing intelligence experience for brand teams.
                    Analyze performance, simulate future scenarios, optimize allocation,
                    and drive decisions with the same confident visual language as your
                    Brand Manager Dashboard.
                  </p>

                  <div className="rr-mini-features">
                    <div className="rr-mini-pill">
                      <FaChartLine />
                      Faster brand decisions
                    </div>
                    <div className="rr-mini-pill">
                      <FaBolt />
                      Scenario simulation
                    </div>
                    <div className="rr-mini-pill">
                      <FaShieldAlt />
                      Transparent optimization
                    </div>
                  </div>

                  <div className="rr-cta-row">
                    <button className="rr-btn rr-btn-primary" onClick={scrollToForm}>
                      Book a Live Demo <FaArrowRight />
                    </button>
                  </div>
                </div>

                <div className="rr-right">
                  <div className="rr-orbit" />
                  <div className="rr-orbit-2" />
                  <div className="rr-orbit-3" />

                  <div className="rr-floating-card rr-fc-1">
                    <div className="title">Optimization Lift</div>
                    <div className="value">+18.7%</div>
                  </div>

                  <div className="rr-floating-card rr-fc-2">
                    <div className="title">Decision Speed</div>
                    <div className="value">5x Faster</div>
                  </div>

                  <div className="rr-floating-card rr-fc-3">
                    <div className="title">Forecast Confidence</div>
                    <div className="value">92%</div>
                  </div>

                  <div className="rr-dashboard-card">
                    <div className="rr-window-top">
                      <div className="rr-window-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="rr-window-pill">Brand Manager View</div>
                    </div>

                    <div className="rr-stat-grid">
                      <div className="rr-stat-box">
                        <div className="rr-stat-label">Current FY Revenue</div>
                        <div className="rr-stat-value">₹ 134.9 Cr</div>
                        <div className="rr-stat-up">+12.4% YoY</div>
                      </div>

                      <div className="rr-stat-box">
                        <div className="rr-stat-label">Optimizer Efficiency</div>
                        <div className="rr-stat-value">1.84x</div>
                        <div className="rr-stat-up">Higher ROI mix</div>
                      </div>
                    </div>

                    <div className="rr-chart-box">
                      <div className="rr-chart-header">
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                            Media Impact Snapshot
                          </div>
                          <div style={{ color: "var(--rr-text-muted)", fontSize: "0.9rem" }}>
                            Simulated uplift by channel
                          </div>
                        </div>
                        <div className="rr-window-pill">Live Intelligence</div>
                      </div>

                      <div className="rr-bars">
                        <div className="rr-bar-wrap">
                          <div className="rr-bar bar-1" />
                          <div className="rr-bar-label">TV</div>
                        </div>
                        <div className="rr-bar-wrap">
                          <div className="rr-bar bar-2" />
                          <div className="rr-bar-label">Digital</div>
                        </div>
                        <div className="rr-bar-wrap">
                          <div className="rr-bar bar-3" />
                          <div className="rr-bar-label">Retail</div>
                        </div>
                        <div className="rr-bar-wrap">
                          <div className="rr-bar bar-4" />
                          <div className="rr-bar-label">Promo</div>
                        </div>
                        <div className="rr-bar-wrap">
                          <div className="rr-bar bar-5" />
                          <div className="rr-bar-label">Search</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rr-bottom-zone">
                <div className="rr-bottom-panel" id="benefits">
                  <div className="rr-feature-strip">
                    <div className="rr-feature-card">
                      <div className="rr-feature-icon">
                        <FaRocket />
                      </div>
                      <h6>Faster Project Delivery</h6>
                      <p>
                        Compress analysis cycles and move from raw inputs to confident
                        brand decisions much faster.
                      </p>
                    </div>

                    <div className="rr-feature-card">
                      <div className="rr-feature-icon">
                        <FaLayerGroup />
                      </div>
                      <h6>Scenario Planning</h6>
                      <p>
                        Model future budget possibilities instantly and compare strategic
                        paths before committing spend.
                      </p>
                    </div>

                    <div className="rr-feature-card">
                      <div className="rr-feature-icon">
                        <FaGlobe />
                      </div>
                      <h6>Transparent Insights</h6>
                      <p>
                        Turn complex data into visual intelligence that leaders can act on
                        without friction.
                      </p>
                    </div>

                    <div className="rr-feature-card" id="features">
                      <div className="rr-feature-icon">
                        <FaUserTie />
                      </div>
                      <h6>Built for Brand Teams</h6>
                      <p>
                        Designed for business stakeholders, planners, and analysts working
                        across revenue, media, and performance.
                      </p>
                    </div>
                  </div>

                  <div className="rr-contact-grid">
                    <div className="rr-contact-card">
                      <div className="rr-contact-title">
                        Let’s build sharper growth stories.
                      </div>

                      <p className="rr-contact-text">
                        A visually premium single-page experience inspired by your Brand
                        Manager Dashboard. Strong hierarchy, rich motion, and a high-end
                        enterprise feel.
                      </p>

                      <div className="rr-contact-points">
                        <div className="rr-contact-point">
                          <div className="icon">
                            <FaEnvelope />
                          </div>
                          <span>Share your use case and request a tailored walkthrough</span>
                        </div>

                        <div className="rr-contact-point">
                          <div className="icon">
                            <FaPhoneAlt />
                          </div>
                          <span>Connect with brand, finance, or marketing stakeholders</span>
                        </div>

                        <div className="rr-contact-point">
                          <div className="icon">
                            <FaWandMagicSparkles />
                          </div>
                          <span>See optimizer, simulator, and dashboard flows in one demo</span>
                        </div>
                      </div>
                    </div>

                    <div className="rr-form-shell" id="contact-demo-form">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                        <div>
                          <h4 className="mb-1 fw-bold">Request a Demo</h4>
                          <div style={{ color: "var(--rr-text-muted)" }}>
                            Tell us a bit about you and we’ll reach out.
                          </div>
                        </div>
                        <div className="rr-window-pill">Contact Me Form</div>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <div className="rr-form-grid">
                          <div className="rr-form-group">
                            <input
                              type="text"
                              name="fullName"
                              className="rr-input"
                              placeholder="Full Name"
                              value={formData.fullName}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="rr-form-group">
                            <input
                              type="email"
                              name="email"
                              className="rr-input"
                              placeholder="Email Address"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="rr-form-group">
                            <input
                              type="text"
                              name="organization"
                              className="rr-input"
                              placeholder="Current Organisation"
                              value={formData.organization}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="rr-form-group">
                            <input
                              type="tel"
                              name="mobile"
                              className="rr-input"
                              placeholder="Mobile Number"
                              value={formData.mobile}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="rr-form-group">
                          <textarea
                            rows="4"
                            name="message"
                            className="rr-input"
                            placeholder="Tell us what you'd like to explore..."
                            value={formData.message}
                            onChange={handleChange}
                          />
                        </div>

                        <label className="rr-check">
                          <input
                            type="checkbox"
                            name="consent"
                            checked={formData.consent}
                            onChange={handleChange}
                            required
                          />
                          <span>
                            I agree to the Terms of Service and Privacy Policy, and I
                            consent to being contacted regarding a product demo.
                          </span>
                        </label>

                        <div className="d-flex flex-wrap gap-3 align-items-center">
                          <button type="submit" className="rr-btn rr-btn-primary">
                            Submit Request <FaArrowRight />
                          </button>

                          <button
                            type="button"
                            className="rr-btn rr-btn-outline"
                            onClick={handleLogin}
                          >
                            Login
                          </button>
                        </div>

                        <div className="rr-tiny-note">
                          Premium single-screen experience with motion, depth, and contact conversion.
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;