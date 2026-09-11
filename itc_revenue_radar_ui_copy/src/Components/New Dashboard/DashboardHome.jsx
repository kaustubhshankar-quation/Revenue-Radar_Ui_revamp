import React from "react";
import { useNavigate, useOutletContext } from "react-router";
import UserService from "../../services/UserService";

const MODULE_CARDS = [
  {
    title: "Refresh Model",
    subtitle: "Admin",
    description:
      "Refresh Model feature enables the administrator to upload a new Excel file containing updated data and refresh the system's model accordingly.",
    to: "/dashboard/refreshmodel",
    adminOnly: true,
  },
  {
    title: "Brand Cockpit",
    subtitle: "Manager",
    description:
      "Brand Cockpit offers a comprehensive overview of brand performance by integrating sales, media spends, and ROI insights, helping stakeholders make data-driven strategic decisions.",
    to: "/cockpit",
    brandManagerOnly: true,
  },
  {
    title: "Model Performance",
    subtitle: "Diagnostics",
    description:
      "Model Performance compares actual outcomes with predicted results to assess accuracy and reliability of the model which provides insights for refining and improving model predictions over time.",
    to: "/dashboard/modelperformance",
  },
  {
    title: "Market Analysis",
    subtitle: "Diagnostics",
    description:
      "Market Analysis dissects expenditure trends among single brand with multiple tactics in a specific source of expenditure over a defined time frame, providing valuable insights for analytics.",
    to: "/dashboard/marketanalysis",
  },
  {
    title: "Brand Analysis",
    subtitle: "Diagnostics",
    description:
      "Brand Analysis dissects expenditure trends among single brand with multiple tactics in a specific source of expenditure over a defined time frame, providing valuable insights for analytics.",
    to: "/dashboard/brandanalysis",
  },
  {
    title: "Scenario Planner",
    subtitle: "Simulation",
    description:
      "Scenario Planner offers an advanced solution for analyzing expenditure data, transforming raw financial inputs into comprehensive charts, uncovering patterns and trends, enabling users to gain actionable insights.",
    to: "/dashboard/simulator",
  },
  {
    title: "Optimized Spends",
    subtitle: "Optimization",
    description:
      "Optimized Spends analyzes expenditure data and user-defined budgets to recommend optimal spending strategies helping in allocation of resources, ensuring maximum return on investment.",
    to: "/dashboard/optimizer",
  },
  {
    title: "Saved Scenarios",
    subtitle: "Simulation",
    description:
      "Saved Scenarios analyzes expenditure data and user-defined budgets to recommend optimal spending strategies helping in allocation of resources, ensuring maximum return on investment.",
    to: "/dashboard/savedscenarios",
  },
  {
    title: "Saved Reports",
    subtitle: "User Saved",
    description:
      "Saved Reports lets User to access securely their saved reports for future reference and continued analysis.",
    to: "/dashboard/savedreports",
  },
];

const BRAND_MANAGER_ROLES = ["BBMNGR", "OODMNGR", "CBMNGR", "MUMNGR", "SALES"];

function DashboardHome() {
  const navigate = useNavigate();
  const { theme } = useOutletContext();

  const visibleCards = MODULE_CARDS.filter((card) => {
    if (card.adminOnly && !UserService.hasRole(["adminrole"])) return false;
    if (card.brandManagerOnly && !UserService.hasRole(BRAND_MANAGER_ROLES)) {
      return false;
    }
    return true;
  });

  return (
    <div className={`dashboard-home-page ${theme}-theme`}>
      <div className="rr-app-topbar">
        <div className="rr-app-topbar-left">
          <div className="rr-app-tag">Decision Intelligence Suite</div>
          <h2 className="rr-app-title">Executive Workspace</h2>
          <p className="rr-app-subtitle mb-0">
            Access diagnostics, simulation, optimization, reporting and
            brand-level intelligence from one unified workspace.
          </p>
        </div>
      </div>

      <div className="container-fluid dashboard-home-container">
        <div className="row dashboard-grid">
          {visibleCards.map((card) => (
            <div
              key={card.to}
              className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 mb-4 position-relative dashboard-card-col"
            >
              <div className="afterlogcon3box1 h-100 dashboard-card-shell p-4">
                <div className="col-12 padding dashboard-card-header">
                  <div className="row align-items-start">
                    <div className="col">
                      <h3>{card.title}</h3>
                    </div>
                    <div className="col-auto">
                      <h4>{card.subtitle}</h4>
                    </div>
                  </div>
                </div>

                <div className="col-12 dashboard-card-body mt-2">
                  <p>{card.description}</p>
                  <div className="alborderbottom1"></div>

                  <div className="trybtn dashboard-card-btn">
                    <a
                      onClick={() => navigate(card.to)}
                      aria-label={`Open ${card.title}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(card.to);
                        }
                      }}
                    >
                      Go{" "}
                      <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
