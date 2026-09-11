import React, { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
} from "lucide-react";

const regionCoordinates = {
  NORTH: { lat: 28.6139, lon: 77.2090 },
  SOUTH: { lat: 13.0827, lon: 80.2707 },
  EAST: { lat: 22.5726, lon: 88.3639 },
  WEST: { lat: 19.0760, lon: 72.8777 },
};

function KPI_CARD({ title, value, icon, color }) {
  return (
    <div
      className="rounded-4 shadow-sm p-3 h-100"
      style={{
        background: "var(--bs-body-bg)",
        border: "1px solid rgba(128,128,128,0.2)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div
            className="small mb-1"
            style={{ opacity: 0.7 }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            {value}
          </div>
        </div>

        <div
          className="p-2 rounded-circle"
          style={{
            background: color,
            color: "white",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function RegionROIHeatMap({ apiResponse }) {
  const [selectedRegion, setSelectedRegion] = useState(null);

  const heatmapData = apiResponse?.heatmap_data || [];

  // --------------------------------------------------------
  // MAP DATA
  // --------------------------------------------------------

  const plotData = useMemo(() => {
    return [
      {
        type: "scattergeo",

        mode: "markers+text",

        lat: heatmapData.map(
          (item) => regionCoordinates[item.region]?.lat
        ),

        lon: heatmapData.map(
          (item) => regionCoordinates[item.region]?.lon
        ),

        text: heatmapData.map((item) => item.region),

        customdata: heatmapData.map((item) => [
          item.tooltip.region,
          item.tooltip.roi,
          item.tooltip.sales,
          item.tooltip.spends,
          item.performance_level,
        ]),

        marker: {
          size: heatmapData.map((item) => item.roi * 25),

          color: heatmapData.map((item) => item.color),

          opacity: 0.85,

          line: {
            width: 2,
            color: "#fff",
          },
        },

        textfont: {
          size: 12,
          color: "#111",
        },

        hovertemplate: `
          <b>%{customdata[0]}</b><br>
          ROI: %{customdata[1]}<br>
          Sales: %{customdata[2]}<br>
          Spends: %{customdata[3]}<br>
          Performance: %{customdata[4]}
          <extra></extra>
        `,
      },
    ];
  }, [heatmapData]);

  // --------------------------------------------------------
  // PLOT LAYOUT
  // --------------------------------------------------------

  const layout = {
    geo: {
      scope: "asia",
      projection: {
        type: "mercator",
      },

      center: {
        lat: 22,
        lon: 80,
      },

      lataxis: {
        range: [6, 37],
      },

      lonaxis: {
        range: [67, 97],
      },

      showland: true,

      landcolor: "#EAF2F8",

      showcountries: true,

      countrycolor: "#ffffff",

      bgcolor: "transparent",
    },

    margin: {
      t: 0,
      b: 0,
      l: 0,
      r: 0,
    },

    paper_bgcolor: "transparent",

    plot_bgcolor: "transparent",

    height: 500,
  };

  // --------------------------------------------------------
  // SELECT REGION
  // --------------------------------------------------------

  const onRegionClick = (event) => {
    const region =
      event.points[0].text;

    const selected =
      heatmapData.find(
        (x) => x.region === region
      );

    setSelectedRegion(selected);
  };

  return (
    <div className="container-fluid py-3">

      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <KPI_CARD
            title="Overall ROI"
            value={apiResponse.summary.overall_roi}
            icon={<TrendingUp size={20} />}
            color="#198754"
          />
        </div>

        <div className="col-md-3">
          <KPI_CARD
            title="Total Sales"
            value={`₹${(
              apiResponse.summary.total_sales / 10000000
            ).toFixed(2)}Cr`}
            icon={<IndianRupee size={20} />}
            color="#0d6efd"
          />
        </div>

        <div className="col-md-3">
          <KPI_CARD
            title="Total Spends"
            value={`₹${(
              apiResponse.summary.total_spends / 10000000
            ).toFixed(2)}Cr`}
            icon={<BarChart3 size={20} />}
            color="#fd7e14"
          />
        </div>

        <div className="col-md-3">
          <KPI_CARD
            title="Best Region"
            value={apiResponse.summary.best_region}
            icon={<TrendingUp size={20} />}
            color="#20c997"
          />
        </div>

      </div>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="row g-4">

        {/* ================================================= */}
        {/* INDIA HEATMAP */}
        {/* ================================================= */}

        <div className="col-lg-8">

          <div
            className="rounded-4 shadow-sm p-3"
            style={{
              background: "var(--bs-body-bg)",
              border: "1px solid rgba(128,128,128,0.2)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>
                <h5 className="mb-1 fw-bold">
                  India ROI Heatmap
                </h5>

                <div
                  className="small"
                  style={{ opacity: 0.7 }}
                >
                  Region wise media ROI performance
                </div>
              </div>

            </div>

            <Plot
              data={plotData}
              layout={layout}
              style={{
                width: "100%",
                height: "100%",
              }}
              config={{
                responsive: true,
                displayModeBar: false,
              }}
              onClick={onRegionClick}
            />

          </div>

        </div>

        {/* ================================================= */}
        {/* RANKING */}
        {/* ================================================= */}

        <div className="col-lg-4">

          <div
            className="rounded-4 shadow-sm p-3 h-100"
            style={{
              background: "var(--bs-body-bg)",
              border: "1px solid rgba(128,128,128,0.2)",
            }}
          >
            <h5 className="fw-bold mb-3">
              Region Ranking
            </h5>

            {apiResponse.ranking.map((item) => (
              <div
                key={item.region}
                className="d-flex justify-content-between align-items-center p-2 rounded-3 mb-2"
                style={{
                  background:
                    item.rank === 1
                      ? "rgba(25,135,84,0.08)"
                      : "rgba(128,128,128,0.06)",
                }}
              >
                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: 35,
                      height: 35,
                      background:
                        item.rank === 1
                          ? "#198754"
                          : "#6c757d",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {item.rank}
                  </div>

                  <div>
                    <div className="fw-semibold">
                      {item.region}
                    </div>

                    <div
                      className="small"
                      style={{ opacity: 0.7 }}
                    >
                      ROI Performance
                    </div>
                  </div>

                </div>

                <div
                  className="fw-bold"
                  style={{
                    color:
                      item.roi >= 1
                        ? "#198754"
                        : "#dc3545",
                  }}
                >
                  {item.roi}
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* REGION DETAILS */}
      {/* ================================================= */}

      {selectedRegion && (

        <div className="row mt-4">

          <div className="col-12">

            <div
              className="rounded-4 shadow-sm p-4"
              style={{
                background: "var(--bs-body-bg)",
                border: "1px solid rgba(128,128,128,0.2)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h4 className="fw-bold mb-1">
                    {selectedRegion.region} Region Details
                  </h4>

                  <div
                    className="small"
                    style={{ opacity: 0.7 }}
                  >
                    Channel wise ROI analysis
                  </div>

                </div>

                <div
                  className="px-3 py-2 rounded-pill text-white fw-semibold"
                  style={{
                    background: selectedRegion.color,
                  }}
                >
                  ROI {selectedRegion.roi}
                </div>

              </div>

              {/* ========================================= */}
              {/* CHANNEL BREAKDOWN */}
              {/* ========================================= */}

              <div className="row g-3">

                {selectedRegion.channel_breakdown.map(
                  (channel) => (
                    <div
                      key={channel.channel}
                      className="col-md-6"
                    >
                      <div
                        className="border rounded-4 p-3 h-100"
                        style={{
                          background:
                            "rgba(128,128,128,0.03)",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3">

                          <h6 className="fw-bold mb-0">
                            {channel.channel}
                          </h6>

                          <span
                            className={`badge ${
                              channel.roi >= 1
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            ROI {channel.roi}
                          </span>

                        </div>

                        <div className="mb-2">

                          <div
                            className="small"
                            style={{ opacity: 0.7 }}
                          >
                            Sales
                          </div>

                          <div className="fw-semibold">
                            ₹
                            {(
                              channel.sales /
                              10000000
                            ).toFixed(2)}
                            Cr
                          </div>

                        </div>

                        <div>

                          <div
                            className="small"
                            style={{ opacity: 0.7 }}
                          >
                            Spends
                          </div>

                          <div className="fw-semibold">
                            ₹
                            {(
                              channel.spends /
                              10000000
                            ).toFixed(2)}
                            Cr
                          </div>

                        </div>

                      </div>
                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* INSIGHTS */}
      {/* ================================================= */}

      <div className="row mt-4">

        <div className="col-12">

          <div
            className="rounded-4 shadow-sm p-4"
            style={{
              background: "var(--bs-body-bg)",
              border: "1px solid rgba(128,128,128,0.2)",
            }}
          >
            <h5 className="fw-bold mb-3">
              AI Insights
            </h5>

            <div className="row g-3">

              {apiResponse.insights.map(
                (insight, index) => (
                  <div
                    className="col-md-4"
                    key={index}
                  >
                    <div
                      className="p-3 rounded-4 h-100"
                      style={{
                        background:
                          insight.type === "positive"
                            ? "rgba(25,135,84,0.08)"
                            : insight.type === "warning"
                            ? "rgba(220,53,69,0.08)"
                            : "rgba(13,110,253,0.08)",
                      }}
                    >
                      <div className="fw-semibold mb-2">
                        {insight.type.toUpperCase()}
                      </div>

                      <div>
                        {insight.message}
                      </div>
                    </div>
                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}