import React, { useEffect, useMemo } from "react";
import QuarterlySalesDashboard from "./SalesCompariosionLineChart";
import { useDispatch, useSelector } from "react-redux";
import { loadDashboardData } from "../../Redux/dashboard/dashboardSlice";
import { useOutletContext } from "react-router-dom";
import {
  formatCr,
  getGrowthClass,
  buildFyTillLabels,
  resolveDashboardBrandPayload,
} from "../HelperFunction/helperFunction";

const BrandSalesPerformance = () => {
  const dispatch = useDispatch();
  const { theme } = useOutletContext();
  const { salesData, loading, loaded } = useSelector(
    (state) => state.dashboard || {}
  );

  const yearlySalesData = salesData?.yearly?.yearly_sales || [];
  const currentFY = salesData?.current_fy || "Current FY";
  const previousFY = salesData?.previous_fy || "Previous FY";
  const tilldate = salesData?.data_present_till;

  const previousTotal = Number(yearlySalesData?.[0]?.previous_fy || 0);
  const currentTotal = Number(yearlySalesData?.[1]?.current_fy || 0);

  const yoyChange = useMemo(() => {
    if (!previousTotal) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }, [previousTotal, currentTotal]);

  const { previousTillLabel, currentTillLabel } = useMemo(
    () => buildFyTillLabels(previousFY, currentFY, tilldate),
    [previousFY, currentFY, tilldate]
  );

  useEffect(() => {
    if (!loaded) {
      dispatch(loadDashboardData(resolveDashboardBrandPayload()));
    }
  }, [loaded, dispatch]);

  if (loading) {
    return (
      <div className="container-fluid py-3 brand-sales-dashboard">
        <div className="premium-panel text-center py-5">
          <div className="premium-spinner mb-3"></div>
          <h5 className="fw-bold mb-1">Preparing Sales Performance...</h5>
          <p className="text-muted mb-0">
            Fetching yearly and monthly sales insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 brand-sales-dashboard">
      <div className="row g-4 mb-4">
        <div className="col-lg-4 col-md-6 col-12">
          <div className="premium-kpi-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="kpi-label">Previous FY Sales</div>
                <div className="kpi-value text-primary">
                  {formatCr(previousTotal)}
                </div>
                <div className="kpi-subtext">{previousTillLabel}</div>
              </div>
              <div className="kpi-icon kpi-icon-blue">
                <i className="fas fa-chart-bar"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-12">
          <div className="premium-kpi-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="kpi-label">Current FY Sales</div>
                <div className="kpi-value text-success">
                  {formatCr(currentTotal)}
                </div>
                <div className="kpi-subtext">{currentTillLabel}</div>
              </div>
              <div className="kpi-icon kpi-icon-green">
                <i className="fas fa-signal"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-12 col-12">
          <div className="premium-kpi-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="kpi-label">YoY Growth</div>
                <div className={`kpi-value ${getGrowthClass(yoyChange)}`}>
                  {yoyChange >= 0 ? "+" : ""}
                  {Number(yoyChange).toFixed(2)}%
                </div>
                <div className="kpi-subtext">Overall yearly movement</div>
              </div>
              <div
                className={`kpi-icon ${
                  yoyChange >= 0 ? "kpi-icon-green" : "kpi-icon-red"
                }`}
              >
                <i
                  className={`fas ${
                    yoyChange >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                  }`}
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuarterlySalesDashboard theme={theme} />
    </div>
  );
};

export default BrandSalesPerformance;
