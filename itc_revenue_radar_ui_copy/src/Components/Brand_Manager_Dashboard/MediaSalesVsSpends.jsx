import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import CampaignSalesChart from "../CFO_Dashboard/ApexMeidaLineChart";
import BrandPredictionSummary from "./BrandPredictionSummary";
import {
  formatCr,
  getGrowthClass,
  buildFyTillLabels,
} from "../HelperFunction/helperFunction";

const MediaSalesVsSpends = () => {
  const { spendsData, mediaSalesData, brandWiseMAPEData } = useSelector(
    (state) => state.dashboard || {}
  );

  const { theme, mediaView } = useOutletContext();
  const isDark = theme === "dark";
  const view = mediaView || "Channel_Wise";
  const navigate = useNavigate();

  const [qtrSpendsData, setQtrSpendsData] = useState([]);
  const [qtrSalesData, setQtrSalesData] = useState([]);

  const yearlySpendsData = spendsData?.yearly_spends_media_wise || [];
  const yearlySalesData = mediaSalesData?.yearly_sales_media_grp_wise || [];

  const currentFY = spendsData?.current_fy || "Current FY";
  const previousFY = spendsData?.previous_fy || "Previous FY";
  const tilldate = spendsData?.data_present_till;

  useEffect(() => {
    setQtrSpendsData(
      view === "Channel_Wise"
        ? spendsData?.qtr_spends_var_wise
        : spendsData?.qtr_spends_media_wise
    );
    setQtrSalesData(
      view === "Channel_Wise"
        ? mediaSalesData?.qtr_sales_media_var_wise
        : mediaSalesData?.qtr_sales_media_grp_wise
    );
  }, [view, spendsData, mediaSalesData]);

  useEffect(() => {
    if (Object.keys(spendsData || {}).length === 0) {
      navigate("/cockpit/sales-performance");
    }
  }, [spendsData, navigate]);

  const { previousTillLabel, currentTillLabel } = useMemo(
    () => buildFyTillLabels(previousFY, currentFY, tilldate),
    [previousFY, currentFY, tilldate]
  );

  const spendsTotals = useMemo(() => {
    return yearlySpendsData.reduce(
      (acc, item) => {
        acc.previous += Number(item.previous_fy) || 0;
        acc.current += Number(item.current_fy) || 0;
        return acc;
      },
      { previous: 0, current: 0 }
    );
  }, [yearlySpendsData]);

  const spendsYOY = useMemo(() => {
    if (!spendsTotals.previous) return 0;
    return (
      ((spendsTotals.current - spendsTotals.previous) / spendsTotals.previous) *
      100
    );
  }, [spendsTotals]);

  const salesTotals = useMemo(() => {
    return yearlySalesData.reduce(
      (acc, item) => {
        acc.previous += Number(item.previous_fy) || 0;
        acc.current += Number(item.current_fy) || 0;
        return acc;
      },
      { previous: 0, current: 0 }
    );
  }, [yearlySalesData]);

  const salesYOY = useMemo(() => {
    if (!salesTotals.previous) return 0;
    return (
      ((salesTotals.current - salesTotals.previous) / salesTotals.previous) *
      100
    );
  }, [salesTotals]);

  return (
    <div className="container-fluid media-compare-dashboard">
      <BrandPredictionSummary apiData={brandWiseMAPEData} isDark={isDark}/>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="info-wrap premium-panel h-100">
            <div className="panel-header">
              {view === "Group_Wise" && (
                <div className="info-wrapper">
                  <div className="info-tag">
                    <i className="fas fa-info"></i>
                  </div>

                  <div className="info-tooltip-table">
                    <div className="info-tooltip-header">
                      <div>
                        <h6 className="info-tooltip-title">Group Wise Yearly Spends</h6>
                      </div>
                    </div>

                    <div className="info-tooltip-table-wrap">
                      <table className="info-mini-table">
                        <thead>
                          <tr>
                            <th>Media Group</th>
                            <th>Previous FY</th>
                            <th>Current FY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {spendsData?.yearly_spends_media_wise?.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item?.media_group}</td>
                              <td className="text-center text-primary" ><strong>{`₹ ${(Number((item?.previous_fy) / 10000000).toFixed(3))} Cr.`}</strong></td>
                              <td className="text-center text-success"><strong>{`₹ ${(Number((item?.current_fy) / 10000000).toFixed(3))} Cr.`}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              <h5 className="panel-title mb-1">Media Spends</h5>
              <div className="panel-subtitle">
                Channel-wise spend movement across financial years
              </div>
            </div>

            <div className="panel-body pt-0">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="premium-kpi-card h-100">
                    <div className=" d-flex justify-content-between align-items-start">
                      <div>
                        <div className="kpi-label">Previous FY</div>
                        <div className="kpi-value text-primary">
                          {formatCr(spendsTotals.previous)}
                        </div>
                        <div className="kpi-subtext">{previousTillLabel}</div>
                      </div>
                      <div className="kpi-icon kpi-icon-blue">
                        <i className="fas fa-wallet"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="premium-kpi-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="kpi-label">Current FY</div>
                        <div className="kpi-value text-success">
                          {formatCr(spendsTotals.current)}
                        </div>
                        <div className="kpi-subtext">{currentTillLabel}</div>
                      </div>
                      <div className="kpi-icon kpi-icon-green">
                        <i className="fas fa-wallet"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="premium-kpi-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="kpi-label">YoY Growth</div>
                        <div className={`kpi-value ${getGrowthClass(spendsYOY)}`}>
                          {spendsYOY >= 0 ? "+" : ""}
                          {Number(spendsYOY).toFixed(2)}%
                        </div>
                        <div className="kpi-subtext">Spend change</div>
                      </div>
                      <div
                        className={`kpi-icon ${spendsYOY >= 0 ? "kpi-icon-green" : "kpi-icon-red"
                          }`}
                      >
                        <i
                          className={`fas ${spendsYOY >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                            }`}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CampaignSalesChart
                theme={theme}
                tilldate={tilldate}
                heading={view === 'Channel_Wise' ? "Media Channel Wise" : "Media Group Wise"}
                campaignData={qtrSpendsData}
                previousFY={previousFY}
                currentFY={currentFY}
                metricLabel="Spends (₹ in Crores)"
                viewType={view}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="premium-panel h-100">
            <div className="panel-header">
              <h5 className="panel-title mb-1">Media Contribution</h5>
              <div className="panel-subtitle">
                Channel-wise contribution movement across financial years
              </div>
              {view === "Group_Wise" && (
                <div className="info-wrapper">
                  <div className="info-tag">
                    <i className="fas fa-info"></i>
                  </div>

                  <div className="info-tooltip-table">
                    <div className="info-tooltip-header">
                      <div>
                        <h6 className="info-tooltip-title">Group Wise Yearly Contribution</h6>
                      </div>
                    </div>

                    <div className="info-tooltip-table-wrap">
                      <table className="info-mini-table">
                        <thead>
                          <tr>
                            <th>Media Group</th>
                            <th>Previous FY</th>
                            <th>Current FY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearlySalesData?.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item?.media_group}</td>
                              <td className="text-center text-primary" ><strong>{`₹ ${(Number((item?.previous_fy) / 10000000).toFixed(3))} Cr.`}</strong></td>
                              <td className="text-center text-success"><strong>{`₹ ${(Number((item?.current_fy) / 10000000).toFixed(3))} Cr.`}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-body pt-0">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="premium-kpi-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="kpi-label">Previous FY</div>
                        <div className="kpi-value text-primary">
                          {formatCr(salesTotals.previous)}
                        </div>
                        <div className="kpi-subtext">{previousTillLabel}</div>
                      </div>
                      <div className="kpi-icon kpi-icon-blue">
                        <i className="fas fa-chart-line"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="premium-kpi-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="kpi-label">Current FY</div>
                        <div className="kpi-value text-success">
                          {formatCr(salesTotals.current)}
                        </div>
                        <div className="kpi-subtext">{currentTillLabel}</div>
                      </div>
                      <div className="kpi-icon kpi-icon-green">
                        <i className="fas fa-chart-line"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="premium-kpi-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="kpi-label">YoY Growth</div>
                        <div className={`kpi-value ${getGrowthClass(salesYOY)}`}>
                          {salesYOY >= 0 ? "+" : ""}
                          {Number(salesYOY).toFixed(2)}%
                        </div>
                        <div className="kpi-subtext">Contribution change</div>
                      </div>
                      <div
                        className={`kpi-icon ${salesYOY >= 0 ? "kpi-icon-green" : "kpi-icon-red"
                          }`}
                      >
                        <i
                          className={`fas ${salesYOY >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                            }`}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CampaignSalesChart
                theme={theme}
                tilldate={tilldate}
                heading={view === 'Channel_Wise' ? "Media Channel Wise" : "Media Group Wise"}
                campaignData={qtrSalesData}
                previousFY={previousFY}
                currentFY={currentFY}
                metricLabel="Contribution (₹ in Crores)"
                viewType={view}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaSalesVsSpends;