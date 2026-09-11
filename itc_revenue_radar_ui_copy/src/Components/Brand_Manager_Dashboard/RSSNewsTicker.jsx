import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRss } from "react-icons/fa";
import UserService from "../../services/UserService";

const FEED_URL =
  "https://news.google.com/rss/search?q=sunfeast&hl=en-IN&gl=IN&ceid=IN:en";
const LOCAL_PROXY = "/api/rss-feed?q=sunfeast";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const ROTATE_INTERVAL = 4000; // ms between news items

function parseRSSItems(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(doc.querySelectorAll("item")).map((item) => ({
    title: item.querySelector("title")?.textContent || "",
    link: item.querySelector("link")?.textContent || "#",
    pubDate: item.querySelector("pubDate")?.textContent || "",
    source: item.querySelector("source")?.textContent || "",
  }));
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const RSSNewsTicker = ({ collapsed = false, setCollapsed }) => {

  // const [newsItems, setNewsItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // const fetchFeed = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // Try local dev proxy first, fallback to CORS proxy
  //     let xmlText;
  //     try {
  //       const res = await fetch(LOCAL_PROXY);
  //       if (!res.ok) throw new Error("Local proxy failed");
  //       xmlText = await res.text();
  //     } catch {
  //       const res = await fetch(
  //         `${CORS_PROXY}${encodeURIComponent(FEED_URL)}`
  //       );
  //       if (!res.ok) throw new Error("Failed to fetch news");
  //       xmlText = await res.text();
  //     }

  //     const items = parseRSSItems(xmlText);
  //     if (items.length === 0) throw new Error("No news items found");
  //     // Randomly pick up to 10 items
  //     const shuffled = [...items].sort(() => Math.random() - 0.5);
  //     setNewsItems(shuffled.slice(0, 10));
  //     setActiveIndex(0);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchFeed();
  //   // refresh feed every 10 minutes
  //   const interval = setInterval(fetchFeed, 600000);
  //   return () => clearInterval(interval);
  // }, [fetchFeed]);

  const newsItems = (UserService.hasRole(["BBMNGR"]))
    ? [
      {
        title: "India’s snacks market expected to grow at 13% CAGR over next three years",
        source: "The Tribune (ANI Report)",
        link: "https://www.tribuneindia.com/news/business/indias-snacks-market-to-grow-at-13-rate-over-next-3-years-faster-than-packaged-food-report/",
        publishedDate: "2026-04-02"
      },
      {
        title: "Premium snack brands rising as Indian consumers shift toward quality and innovation",
        source: "Economic Times",
        link: "https://economictimes.indiatimes.com/industry/cons-products/food/challenger-brands-ride-the-premium-wave-in-indias-evolving-fb-sector/articleshow/130061479.cms",
        publishedDate: "2026-04-06"
      },
      {
        title: "Indian snacks market projected to cross ₹1 lakh crore driven by urban demand",
        source: "Exchange4Media",
        link: "https://www.exchange4media.com/marketing-news/indias-new-fmcg-food-frontiers-the-consumer-insights-behind-emerging-snack-categories-152658.html",
        publishedDate: "2026-03-07"
      },
      {
        title: "Healthy snacking trend accelerates with demand for protein and low-oil products",
        source: "FNB News",
        link: "https://www.fnbnews.com/Top-News/traditional-snacks-dominate-volumes-extruded-fastestgrowing-86417",
        publishedDate: "2026-03-28"
      },
      {
        title: "BigBasket to launch 10-minute snack delivery across India",
        source: "Reuters",
        link: "https://www.reuters.com/world/india/bigbasket-launch-10-minute-food-delivery-across-india-by-march-2026-executive-2025-06-10/",
        publishedDate: "2025-06-10"
      },
      {
        title: "PepsiCo cuts snack prices as consumers react to inflation pressures",
        source: "Economic Times Retail",
        link: "https://retail.economictimes.indiatimes.com/tag/snacks",
        publishedDate: "2026-01-15"
      },
      {
        title: "PVR INOX sells premium snack brand 4700BC to Marico for ₹226 crore",
        source: "Times of India",
        link: "https://timesofindia.indiatimes.com/business/india-business/pvr-inox-to-sell-snacks-business-to-marico/articleshow/127575488.cms",
        publishedDate: "2026-02-14"
      },
      {
        title: "Healthy and high-protein snacks gain popularity globally in 2026",
        source: "The Times (UK)",
        link: "https://www.thetimes.com/life-style/food-drink/article/food-trends-to-know-for-2026-3sph8f7xj",
        publishedDate: "2026-01-08"
      },
      {
        title: "Snacks industry faces disruption from weight-loss drugs reducing junk food demand",
        source: "Financial Times",
        link: "https://www.ft.com/content/56843b5d-a53b-4e49-b095-2ae9e8bf424e",
        publishedDate: "2026-01-20"
      },
      {
        title: "Indian snacks market to double by 2033 driven by urbanisation and convenience",
        source: "Renub Research",
        link: "https://www.renub.com/india-snacks-market-forecast-organized-unorganized-companies-consumer-survey-p.php",
        publishedDate: "2025-12-12"
      }
    ]
    : (UserService.hasRole(["OODMNGR"]))
      ?
      [
        {
          title: "Global Instant Noodles Market Expected to Reach $97 Billion by 2032",
          source: "Maximize Market Research",
          link: "https://www.einpresswire.com/article/898275865/global-instant-noodles-market-size-to-hit-usd-97-39-billion-by-2032",
          pubDate: "2025-12-18"
        },
        {
          title: "India Instant Noodles Market Set for Double-Digit Growth Through 2030",
          source: "Taiwan News (Market Report)",
          link: "https://www.taiwannews.com.tw/news/6307603",
          pubDate: "2025-11-05"
        },
        {
          title: "Nestlé Expands Maggi with Localized Flavours in Global Markets",
          source: "Economic Times",
          link: "https://economictimes.indiatimes.com/industry/cons-products/fmcg/nestl-india-adds-desi-touch-to-uk-kitchens-with-maggi",
          pubDate: "2025-10-16"
        },
        {
          title: "Instant Noodles Consumption Rising with Urban Lifestyle Shifts",
          source: "Mordor Intelligence",
          link: "https://www.mordorintelligence.com/industry-reports/instant-noodles-market",
          pubDate: "2025-09-22"
        },
        {
          title: "Health Concerns Over High Sodium Content in Instant Noodles Grow",
          source: "The Guardian",
          link: "https://www.theguardian.com/global-development/2023/dec/28/how-instant-noodles-took-over-the-world-salt",
          pubDate: "2025-08-30"
        },
        {
          title: "Premium and Gourmet Instant Noodles Gain Popularity Globally",
          source: "Food Industry Insights",
          link: "https://www.einpresswire.com/article/898275865/global-instant-noodles-market",
          pubDate: "2025-08-12"
        },
        {
          title: "Quick Commerce Platforms Boost Packaged Food Sales in India",
          source: "Business Standard",
          link: "https://www.business-standard.com/industry/news/quick-commerce-growth-india-fmcg",
          pubDate: "2025-07-28"
        },
        {
          title: "Asia-Pacific Continues to Dominate Global Noodles Consumption",
          source: "Fortune Business Insights",
          link: "https://www.fortunebusinessinsights.com/industry-reports/instant-noodles-market-101452",
          pubDate: "2025-07-10"
        },
        {
          title: "Sustainable Packaging Becomes Key Focus for Instant Noodle Brands",
          source: "Mordor Intelligence",
          link: "https://www.mordorintelligence.com/industry-reports/instant-noodles-market",
          pubDate: "2025-06-18"
        },
        {
          title: "High-Protein and Fortified Noodles Drive New Product Innovation",
          source: "Food Navigator Asia",
          link: "https://www.foodnavigator-asia.com/Article/2025/06/05/high-protein-noodles-trend",
          pubDate: "2025-06-05"
        }
      ]
      : (UserService.hasRole(["MUMNGR"]))
        ? [
          {
            title: "Parle’s revenue grows 8.5% in FY25 but profit drops sharply due to rising costs",
            source: "Times of India",
            link: "https://timesofindia.indiatimes.com/business/india-business/india-biscuit-market-parles-sales-grow-in-fy25-profitability-hit-by-intense-competition/articleshow/126653442.cms",
            publishedDate: "2026-01-18"
          },
          {
            title: "Britannia leads India’s biscuit industry growth with strong Q3 profit jump",
            source: "Economic Times",
            link: "https://economictimes.indiatimes.com/markets/stocks/earnings/britannia-industries-q3-results-cons-pat-jumps-17-yoy-to-rs-680-crore-revenue-rises-8/articleshow/128162820.cms",
            publishedDate: "2026-02-10"
          },
          {
            title: "Biscuit industry sees 12% growth driven by innovation and marketing investments",
            source: "Upstox",
            link: "https://upstox.com/news/market-news/stocks/britannia-hindustan-unilever-how-fmcg-majors-plan-to-sustain-growth-momentum-after-decent-q3-fy-26/article-189515/",
            publishedDate: "2026-02-16"
          },
          {
            title: "Premium biscuits and cookies segment rising with urban demand shift",
            source: "Aarav Blog",
            link: "https://www.aarav.co/blog/public/whats-driving-biscuit-growth-in-india-august-2024-august-2025",
            publishedDate: "2026-01-19"
          },
          {
            title: "Rising raw material costs hit profits of Parle and Mondelez in FY25",
            source: "LiveMint",
            link: "https://www.livemint.com/companies/company-results/india-parle-biscuits-mondelez-fy25-results-market-leader-britannia-industries-11768469446380.html",
            publishedDate: "2026-01-15"
          },
          {
            title: "India biscuit market expected to grow at 6.8% CAGR till 2030",
            source: "IBEF",
            link: "https://www.ibef.org/blogs/trends-and-opportunities-in-india-s-biscuit-cookies-and-crackers-market",
            publishedDate: "2025-07-22"
          },
          {
            title: "LPG crisis disrupts biscuit manufacturing units across Maharashtra",
            source: "Times of India",
            link: "https://timesofindia.indiatimes.com/city/nagpur/lpg-crisis-leaves-biscuit-bread-makers-crumbling/articleshow/129640524.cms",
            publishedDate: "2026-03-18"
          },
          {
            title: "Parle-G production halted at Khamgaon unit due to gas shortage",
            source: "Times of India",
            link: "https://timesofindia.indiatimes.com/city/nagpur/parle-g-biscuit-production-halts-at-khamgaon-unit/articleshow/129617216.cms",
            publishedDate: "2026-03-17"
          },
          {
            title: "Britannia gains from premiumisation and rural expansion strategies",
            source: "Business Standard",
            link: "https://www.business-standard.com/markets/news/antique-initiates-buy-on-britannia-ind-sees-medium-term-opportunity-126031200160_1.html",
            publishedDate: "2026-03-12"
          },
          {
            title: "Global brands like Biscoff expand aggressively to capture biscuit market share",
            source: "Wall Street Journal",
            link: "https://www.wsj.com/business/the-maker-of-biscoff-cookies-bets-on-a-global-expansion-abcb2e4c",
            publishedDate: "2026-01-05"
          }
        ]
        : [
          {
            title: "Parle’s revenue grows 8.5% in FY25 but profit drops sharply due to rising costs",
            source: "Times of India",
            link: "https://timesofindia.indiatimes.com/business/india-business/india-biscuit-market-parles-sales-grow-in-fy25-profitability-hit-by-intense-competition/articleshow/126653442.cms",
            publishedDate: "2026-01-18"
          },
          {
            title: "Britannia leads India’s biscuit industry growth with strong Q3 profit jump",
            source: "Economic Times",
            link: "https://economictimes.indiatimes.com/markets/stocks/earnings/britannia-industries-q3-results-cons-pat-jumps-17-yoy-to-rs-680-crore-revenue-rises-8/articleshow/128162820.cms",
            publishedDate: "2026-02-10"
          },
          {
            title: "Biscuit industry sees 12% growth driven by innovation and marketing investments",
            source: "Upstox",
            link: "https://upstox.com/news/market-news/stocks/britannia-hindustan-unilever-how-fmcg-majors-plan-to-sustain-growth-momentum-after-decent-q3-fy-26/article-189515/",
            publishedDate: "2026-02-16"
          },
          {
            title: "Premium biscuits and cookies segment rising with urban demand shift",
            source: "Aarav Blog",
            link: "https://www.aarav.co/blog/public/whats-driving-biscuit-growth-in-india-august-2024-august-2025",
            publishedDate: "2026-01-19"
          },
          {
            title: "Rising raw material costs hit profits of Parle and Mondelez in FY25",
            source: "LiveMint",
            link: "https://www.livemint.com/companies/company-results/india-parle-biscuits-mondelez-fy25-results-market-leader-britannia-industries-11768469446380.html",
            publishedDate: "2026-01-15"
          },
          {
            title: "India biscuit market expected to grow at 6.8% CAGR till 2030",
            source: "IBEF",
            link: "https://www.ibef.org/blogs/trends-and-opportunities-in-india-s-biscuit-cookies-and-crackers-market",
            publishedDate: "2025-07-22"
          },
          {
            title: "LPG crisis disrupts biscuit manufacturing units across Maharashtra",
            source: "Times of India",
            link: "https://timesofindia.indiatimes.com/city/nagpur/lpg-crisis-leaves-biscuit-bread-makers-crumbling/articleshow/129640524.cms",
            publishedDate: "2026-03-18"
          },
          {
            title: "Parle-G production halted at Khamgaon unit due to gas shortage",
            source: "Times of India",
            link: "https://timesofindia.indiatimes.com/city/nagpur/parle-g-biscuit-production-halts-at-khamgaon-unit/articleshow/129617216.cms",
            publishedDate: "2026-03-17"
          },
          {
            title: "Britannia gains from premiumisation and rural expansion strategies",
            source: "Business Standard",
            link: "https://www.business-standard.com/markets/news/antique-initiates-buy-on-britannia-ind-sees-medium-term-opportunity-126031200160_1.html",
            publishedDate: "2026-03-12"
          },
          {
            title: "Global brands like Biscoff expand aggressively to capture biscuit market share",
            source: "Wall Street Journal",
            link: "https://www.wsj.com/business/the-maker-of-biscoff-cookies-bets-on-a-global-expansion-abcb2e4c",
            publishedDate: "2026-01-05"
          }
        ]




  // auto-rotate
  useEffect(() => {
    if (paused || newsItems.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % newsItems.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  const goPrev = () =>
    setActiveIndex((p) => (p - 1 + newsItems.length) % newsItems.length);
  const goNext = () =>
    setActiveIndex((p) => (p + 1) % newsItems.length);

  const current = newsItems[activeIndex];

  /* ---------- News ticker content (shared between inline & modal) ---------- */
  const renderTickerContent = () => (
    <div
      className="rss-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card header */}
      <div className="rss-card-header">
        <div className="rss-card-badge">
          <i className="fas fa-rss"></i>
        </div>
        <span className="rss-card-label">News</span>
        <span className="rss-card-live"></span>
        <div className="rss-card-nav">
          <span className="rss-card-counter">
            {newsItems.length > 0 ? `${activeIndex + 1}/${newsItems.length}` : ""}
          </span>
          {newsItems.length > 1 && (
            <>
              <button className="rss-card-btn" onClick={goPrev}><i className="fas fa-chevron-left"></i></button>
              <button className="rss-card-btn" onClick={goNext}><i className="fas fa-chevron-right"></i></button>
            </>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="rss-card-body">
        {loading && <div className="rss-card-skeleton" />}

        {error && null(
          // <div className="rss-card-error">
          //   <i className="fas fa-exclamation-circle"></i> {error}
          //   <button onClick={fetchFeed} className="rss-card-retry">Retry</button>
          // </div>
        )}

        {!loading && !error && current && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <a
                href={current.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rss-card-title"
              >
                {current.title}
              </a>
              <div className="rss-card-meta">
                {current.source && (
                  <span className="rss-card-source">{current.source}</span>
                )}
                {current.pubDate && (
                  <span className="rss-card-time">
                    <i className="far fa-clock"></i> {current.pubDate}
                    {/* {timeAgo(current.pubDate)} */}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Progress */}
      {!paused && newsItems.length > 1 && (
        <div className="rss-card-progress" key={`prog-${activeIndex}`} />
      )}
    </div>
  );

  /* ---------- Collapsed: show icon only ---------- */
  if (collapsed) {
    return (
      <>
        <button
          className="rss-collapsed-icon-btn"
          title="News"
          onClick={() => setCollapsed && setCollapsed(false)}
          type="button"
        >
          <span className="rr-sidebar-link-icon"><FaRss /></span>
        </button>
      </>
    );
  }

  /* ---------- Expanded: inline render ---------- */
  return (
    <>
      {renderTickerContent()}
    </>
  );
};


export default RSSNewsTicker;
