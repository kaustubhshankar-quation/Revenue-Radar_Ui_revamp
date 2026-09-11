import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import "./CMOMediaCSS.css";

const formatCr = (value) => {
  const num = Number(value || 0);
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Cr`;
};

const formatPercent = (value) => {
  const num = Number(value || 0);
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
};

const growthClass = (value) => (Number(value || 0) >= 0 ? "positive" : "negative");

const getFyTotal = (arr = [], fy, key) => {
  const item = arr.find((x) => x.fy === fy);
  return Number(item?.[`${key}_cr`] || 0);
};

const buildChannelRows = (rows = []) =>
  rows.map((item) => ({
    media_group: item.media_group,
    previous_fy_cr: item.previous_fy_cr || 0,
    current_fy_cr: item.current_fy_cr || 0,
    yoy_change: item.yoy_change || 0,
  }));

const ExecutiveMediaPanel = ({
  title,
  subtitle,
  previousFy,
  currentFy,
  previousValue,
  currentValue,
  yoy,
  yoyLabel,
  rows,
  isDark,
  icon,
  yAxisTitle,
}) => {
  const [view, setView] = useState("chart");

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        background: "transparent",
        foreColor: isDark ? "#CBD5E1" : "#475569",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "42%",
          borderRadius: 9,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => Number(val || 0).toFixed(2),
        style: {
          fontSize: "11px",
          fontWeight: 800,
        },
      },
      xaxis: {
        categories: rows.map((x) => x.media_group),
        labels: {
          style: {
            colors: isDark ? "#CBD5E1" : "#475569",
            fontWeight: 800,
          },
        },
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          style: {
            color: isDark ? "#94A3B8" : "#64748B",
          },
        },
        labels: {
          formatter: (val) => `₹ ${Number(val || 0).toFixed(1)}`,
        },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: {
          formatter: (val) => formatCr(val),
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        labels: {
          colors: isDark ? "#CBD5E1" : "#475569",
        },
      },
      grid: {
        borderColor: isDark ? "rgba(148,163,184,0.18)" : "#E5E7EB",
        strokeDashArray: 4,
      },
    }),
    [rows, isDark, yAxisTitle]
  );

  const chartSeries = useMemo(
    () => [
      {
        name: previousFy,
        data: rows.map((x) => x.previous_fy_cr),
      },
      {
        name: currentFy,
        data: rows.map((x) => x.current_fy_cr),
      },
    ],
    [rows, previousFy, currentFy]
  );

  return (
    <div className="media-exec-card">
      <div className="media-exec-header">
        <div>
          <h5>{title}</h5>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="mini-kpi-card">
            <div>
              <span>Previous FY</span>
              <h4>{formatCr(previousValue)}</h4>
              <p>{previousFy}</p>
            </div>
            <div className="mini-icon">
              <i className={icon} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="mini-kpi-card success">
            <div>
              <span>Current FY</span>
              <h4>{formatCr(currentValue)}</h4>
              <p>{currentFy}</p>
            </div>
            <div className="mini-icon success">
              <i className={icon} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="mini-kpi-card">
            <div>
              <span>YoY Growth</span>
              <h4 className={growthClass(yoy)}>{formatPercent(yoy)}</h4>
              <p>{yoyLabel}</p>
            </div>
            <div className={`mini-icon ${growthClass(yoy)}`}>
              <i className={yoy >= 0 ? "fas fa-arrow-up" : "fas fa-arrow-down"} />
            </div>
          </div>
        </div>
      </div>

      <div className="media-inner-panel">
        <div className="media-inner-toolbar">
          <div>
            <h6>Media Channel Wise</h6>
            <p>Channel-wise comparison with reference table</p>
          </div>

          <div className="view-toggle-group">
            <button
              type="button"
              className={`rr-btn rr-btn-secondary ${view === "chart" ? "active" : ""}`}
              onClick={() => setView("chart")}
            >
              Chart
            </button>
            <button
              type="button"
              className={`rr-btn rr-btn-secondary ${view === "table" ? "active" : ""}`}
              onClick={() => setView("table")}
            >
              Table
            </button>
          </div>
        </div>

        {view === "chart" ? (
          <Chart options={chartOptions} series={chartSeries} type="bar" height={335} />
        ) : (
          <div className="premium-table-wrap">
            <table className="premium-table compact">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>{previousFy}</th>
                  <th>{currentFy}</th>
                  <th>YoY</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.media_group}>
                    <td className="brand-name">{row.media_group}</td>
                    <td>{formatCr(row.previous_fy_cr)}</td>
                    <td>{formatCr(row.current_fy_cr)}</td>
                    <td>
                      <span className={`growth-pill ${growthClass(row.yoy_change)}`}>
                        {formatPercent(row.yoy_change)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CMOMediaSpendsVsContribution = () => {
  const { theme } = useOutletContext();
  const isDark = theme === "dark";

  const {
    spendsData = {},
    mediaSalesData = {},
    loading = false,
  } = useSelector((state) => state?.cmoDashboard || {});

  const mediaSpendsResponse = spendsData;
  const mediaContributionResponse = mediaSalesData;

  const currentFy =
    mediaSpendsResponse?.current_fy || mediaContributionResponse?.current_fy;
  const previousFy =
    mediaSpendsResponse?.previous_fy || mediaContributionResponse?.previous_fy;

  const spendChannelRows = useMemo(
    () => buildChannelRows(mediaSpendsResponse?.media_group_wise_total_spends || []),
    [mediaSpendsResponse]
  );

  const contributionChannelRows = useMemo(
    () => buildChannelRows(mediaContributionResponse?.media_group_wise_total_sales || []),
    [mediaContributionResponse]
  );

  const comparisonRows = useMemo(() => {
    const spendsRows =
      mediaSpendsResponse?.media_spends_brand_wise_table_data?.data || [];
    const contributionRows =
      mediaContributionResponse?.media_contribution_brand_wise_table_data?.data || [];

    return spendsRows.map((spendItem) => {
      const contributionItem = contributionRows.find(
        (x) => x.brand === spendItem.brand
      );

      const prevSpend = spendItem?.[previousFy]?.TOTAL_cr || 0;
      const currSpend = spendItem?.[currentFy]?.TOTAL_cr || 0;

      const prevContribution = contributionItem?.[previousFy]?.TOTAL_cr || 0;
      const currContribution = contributionItem?.[currentFy]?.TOTAL_cr || 0;

      const prevRoi = prevSpend ? prevContribution / prevSpend : 0;
      const currRoi = currSpend ? currContribution / currSpend : 0;

      return {
        brand: spendItem.brand,
        prevSpend,
        currSpend,
        prevContribution,
        currContribution,
        spendYoy: spendItem.yoy_change || 0,
        contributionYoy: contributionItem?.yoy_change || 0,
        prevRoi,
        currRoi,
        roiDelta: prevRoi ? ((currRoi - prevRoi) / prevRoi) * 100 : 0,
      };
    });
  }, [mediaSpendsResponse, mediaContributionResponse, previousFy, currentFy]);

  const kpis = useMemo(() => {
    const prevSpend = getFyTotal(
      mediaSpendsResponse?.total_spends,
      previousFy,
      "spends"
    );
    const currSpend = getFyTotal(
      mediaSpendsResponse?.total_spends,
      currentFy,
      "spends"
    );

    const prevContribution = getFyTotal(
      mediaContributionResponse?.total_media_sales,
      previousFy,
      "sales"
    );
    const currContribution = getFyTotal(
      mediaContributionResponse?.total_media_sales,
      currentFy,
      "sales"
    );

    const spendYoy = prevSpend ? ((currSpend - prevSpend) / prevSpend) * 100 : 0;
    const contributionYoy = prevContribution
      ? ((currContribution - prevContribution) / prevContribution) * 100
      : 0;

    const prevRoi = prevSpend ? prevContribution / prevSpend : 0;
    const currRoi = currSpend ? currContribution / currSpend : 0;

    return {
      prevSpend,
      currSpend,
      prevContribution,
      currContribution,
      spendYoy,
      contributionYoy,
      prevRoi,
      currRoi,
      roiDelta: prevRoi ? ((currRoi - prevRoi) / prevRoi) * 100 : 0,
    };
  }, [mediaSpendsResponse, mediaContributionResponse, previousFy, currentFy]);

  const bestBrand = useMemo(
    () => [...comparisonRows].sort((a, b) => b.currRoi - a.currRoi)[0],
    [comparisonRows]
  );

  const weakBrand = useMemo(
    () => [...comparisonRows].sort((a, b) => a.currRoi - b.currRoi)[0],
    [comparisonRows]
  );

  if (loading) {
    return (
      <div className={`cmo-media-comparison ${isDark ? "dark" : "light"}`}>
        <div className="premium-loader-wrap">
          <div className="premium-spinner" />
          <p className="loader-text">
            Comparing media spends with contribution. Finance is already sweating.
          </p>
        </div>
      </div>
    );
  }

  if (!mediaSpendsResponse || !mediaContributionResponse) {
    return (
      <div className={`cmo-media-comparison ${isDark ? "dark" : "light"}`}>
        <div className="empty-state">No media data available.</div>
      </div>
    );
  }

  return (
    <div className={`cmo-media-comparison ${isDark ? "dark" : "light"}`}>
      <div className="row g-4">
        <div className="col-xl-6">
          <ExecutiveMediaPanel
            title="Media Spends"
            subtitle="Channel-wise spend movement across financial years"
            previousFy={previousFy}
            currentFy={currentFy}
            previousValue={kpis.prevSpend}
            currentValue={kpis.currSpend}
            yoy={kpis.spendYoy}
            yoyLabel="Spend change"
            rows={spendChannelRows}
            isDark={isDark}
            icon="fas fa-wallet"
            yAxisTitle="Spends ₹ in Crores"
          />
        </div>

        <div className="col-xl-6">
          <ExecutiveMediaPanel
            title="Media Contribution"
            subtitle="Channel-wise contribution movement across financial years"
            previousFy={previousFy}
            currentFy={currentFy}
            previousValue={kpis.prevContribution}
            currentValue={kpis.currContribution}
            yoy={kpis.contributionYoy}
            yoyLabel="Contribution change"
            rows={contributionChannelRows}
            isDark={isDark}
            icon="fas fa-chart-line"
            yAxisTitle="Contribution ₹ in Crores"
          />
        </div>
      </div>

      <div className="premium-panel mt-4">
        <div className="premium-panel-body">
          <div className="brand-panel-toolbar">
            <div>
              <h5 className="panel-title mb-1">CMO Oversight</h5>
              <p className="panel-subtext mb-0">
                Executive read on media efficiency, contribution protection and brand-level risk.
              </p>
            </div>
            <span className="meta-chip">
              <i className="fas fa-calendar-alt" />
              {previousFy} vs {currentFy}
            </span>
          </div>

          <div className="row g-3">
            <div className="col-xl-3 col-md-6">
              <div className="oversight-card">
                <div className="oversight-label">Media ROI</div>
                <div className="oversight-value">{kpis.currRoi.toFixed(2)}x</div>
                <p>Previous FY ROI was {kpis.prevRoi.toFixed(2)}x.</p>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="oversight-card">
                <div className="oversight-label">ROI Movement</div>
                <div className={`oversight-value ${growthClass(kpis.roiDelta)}`}>
                  {formatPercent(kpis.roiDelta)}
                </div>
                <p>Efficiency movement from {previousFy} to {currentFy}.</p>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="oversight-card">
                <div className="oversight-label">Best Brand</div>
                <div className="oversight-value">{bestBrand?.brand || "-"}</div>
                <p>Current ROI: {bestBrand?.currRoi?.toFixed(2) || "0.00"}x</p>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="oversight-card danger">
                <div className="oversight-label">Needs Review</div>
                <div className="oversight-value">{weakBrand?.brand || "-"}</div>
                <p>Current ROI: {weakBrand?.currRoi?.toFixed(2) || "0.00"}x</p>
              </div>
            </div>
          </div>

          <div className="executive-note mt-3">
            <i className="fas fa-lightbulb me-2" />
            CMO Read: Media spends moved by <b>{formatPercent(kpis.spendYoy)}</b>,
            while contribution moved by <b>{formatPercent(kpis.contributionYoy)}</b>.
            This indicates{" "}
            <b>{kpis.roiDelta >= 0 ? "improved media efficiency" : "efficiency pressure"}</b>.
          </div>
        </div>
      </div>

      <div className="premium-panel mt-4">
        <div className="premium-panel-body">
          <div className="brand-panel-toolbar">
            <div>
              <h5 className="panel-title mb-1">Brand-Level Media Efficiency</h5>
              <p className="panel-subtext mb-0">
                Brand-wise comparison of spends, contribution and ROI.
              </p>
            </div>
          </div>

          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>{previousFy} Spends</th>
                  <th>{currentFy} Spends</th>
                  <th>Spend YoY</th>
                  <th>{previousFy} Contribution</th>
                  <th>{currentFy} Contribution</th>
                  <th>Contribution YoY</th>
                  <th>{previousFy} ROI</th>
                  <th>{currentFy} ROI</th>
                  <th>ROI Delta</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.brand}>
                    <td className="brand-name">{row.brand}</td>
                    <td>{formatCr(row.prevSpend)}</td>
                    <td>{formatCr(row.currSpend)}</td>
                    <td>
                      <span className={`growth-pill ${growthClass(row.spendYoy)}`}>
                        {formatPercent(row.spendYoy)}
                      </span>
                    </td>
                    <td>{formatCr(row.prevContribution)}</td>
                    <td>{formatCr(row.currContribution)}</td>
                    <td>
                      <span className={`growth-pill ${growthClass(row.contributionYoy)}`}>
                        {formatPercent(row.contributionYoy)}
                      </span>
                    </td>
                    <td>{row.prevRoi.toFixed(2)}x</td>
                    <td>{row.currRoi.toFixed(2)}x</td>
                    <td>
                      <span className={`growth-pill ${growthClass(row.roiDelta)}`}>
                        {formatPercent(row.roiDelta)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMOMediaSpendsVsContribution;