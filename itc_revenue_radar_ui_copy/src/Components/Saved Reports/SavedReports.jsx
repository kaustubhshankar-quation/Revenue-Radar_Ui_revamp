import React, { useEffect, useState } from "react";
import axios from "axios";
import UserService from "../../services/UserService.js";
import { useDispatch } from "react-redux";
import { downloadPdf, notifyRequestError, requireLogin } from "../HelperFunction/helperFunction.js";
import maskedBrandOption from "../JSON Files/MaskedBrandOption.json";
import Select from "react-select";
const { REACT_APP_UPLOAD_DATA } = process.env;

const SavedReports = () => {
  const dispatch = useDispatch();
  const [reports, setReports] = useState([]);
  const [isfetching, setIsfetching] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingMap, setDownloadingMap] = useState({});

  const reportTypes = [
    "MarketAnalysis",
    "BrandAnalysis",
    "SimulatorReport",
    "OptimizerReport",
  ];

  const reportsPerPage = 12;

  const fetchReports = async () => {
    if (UserService.isLoggedIn()) {
      setIsfetching(true);
      try {
        const config = {
          method: "get",
          url: `${REACT_APP_UPLOAD_DATA}/app/getReports`,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          params: {
            user_created_by: UserService.getUsername() // or your variable
          }
        };

        const getResponse = await axios(config);
        setReports(getResponse?.data?.reports || []);
      } catch (err) {
        notifyRequestError(dispatch, err);
      } finally {
        setIsfetching(false);
      }
    } else {
      requireLogin("/dashboard/savedreports");
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.report_type.replace("_", "") === selectedReportType &&
      (!brandFilter || r.brand.toLowerCase() === brandFilter.toLowerCase())
  );

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const brands = [
    ...new Set(
      reports
        .filter((r) => r.report_type.replace("_", "") === selectedReportType)
        .map((r) => r.brand)
    ),
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      <div className="sr-page" style={{ userSelect: "none" }}>
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Saved Reports</div>
              <h2 className="rr-page-title">Saved Reports</h2>
              <p className="rr-page-subtitle mb-0">
                Browse, filter, and download previously generated reports across
                market analysis, brand analysis, simulator, and optimizer
                workflows from one workspace.
              </p>
            </div>
            <div>
              <button
                className="rr-btn rr-btn-primary"
                onClick={() => {
                  fetchReports()
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {isfetching ? (
            <div className="rr-card rr-card-empty my-3">
              <div className="rr-dot-loader">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className="mt-2 fw-semibold rr-muted-text">
                Grabbing Details...
              </div>
            </div>
          ) : reports?.length === 0 ? (
            <div className="rr-card rr-card-section">
              <div className="rr-empty-state">
                <span className="rr-empty-icon-ring">⚠</span>
                Please Generate Some Report to See here.
              </div>
            </div>
          ) : (
            <>
              <div className="rr-card rr-card-section">
                <div className="row align-items-end g-3">
                  <div className="col-12 col-lg-8">
                    <label className="rr-label">
                      Select Report Type <span className="text-danger">*</span>
                    </label>

                    <Select
                      classNamePrefix="rr-select"
                      placeholder="-- Choose Report Type --"
                      options={[
                        { label: "-- Choose Report Type --", value: "" },
                        ...(reportTypes?.map((type) => ({
                          label: type,
                          value: type,
                        })) || []),
                      ]}
                      value={
                        selectedReportType !== undefined && selectedReportType !== null
                          ? {
                            label: selectedReportType || "-- Choose Report Type --",
                            value: selectedReportType || "",
                          }
                          : { label: "-- Choose Report Type --", value: "" }
                      }
                      onChange={(option) => {
                        const value = option?.value || "";
                        setSelectedReportType(value);
                        setBrandFilter("");
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <div className="col-12 col-lg-4">
                    <div className="sr-type-chip-wrap">
                      <div className="rr-chip rr-chip-lg">
                        {selectedReportType || "No report type selected"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReportType && (
                <div className="row g-3">
                  <div className="col-12 col-md-4 col-lg-3">
                    <div className="rr-card rr-card-section">
                      <h5 className="rr-section-title">Filters</h5>

                      <div className="mb-2">
                        <label className="rr-label">Brand</label>

                        <Select
                          classNamePrefix="rr-select"
                          placeholder="All Brands"
                          options={[
                            { label: "All Brands", value: "" },
                            ...(brands?.map((brand) => ({
                              label: maskedBrandOption?.maskedBrandOption?.[brand] || brand,
                              value: brand,
                            })) || []),
                          ]}
                          value={
                            brandFilter !== undefined && brandFilter !== null
                              ? {
                                label:
                                  brandFilter === ""
                                    ? "All Brands"
                                    : maskedBrandOption?.maskedBrandOption?.[brandFilter] || brandFilter,
                                value: brandFilter || "",
                              }
                              : { label: "All Brands", value: "" }
                          }
                          onChange={(option) => {
                            const value = option?.value || "";
                            setBrandFilter(value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>

                      <div className="sr-filter-meta mt-3">
                        <div className="sr-filter-stat">
                          <strong>Type</strong>
                          <span>{selectedReportType}</span>
                        </div>
                        <div className="sr-filter-stat">
                          <strong>Brands</strong>
                          <span>{brands.length}</span>
                        </div>
                        <div className="sr-filter-stat">
                          <strong>Results</strong>
                          <span>{filteredReports.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-8 col-lg-9">
                    {currentReports.length === 0 ? (
                      <div className="rr-empty-state rr-empty-state-soft rr-empty-state--tall">
                        No reports match the selected filters.
                      </div>
                    ) : (
                      <>
                        <div className="row g-3">
                          {currentReports.map((report) => (
                            <div
                              key={report.id}
                              className="col-12 col-md-6 col-xl-4"
                            >
                              <div className="rr-card rr-card-mini rr-card-hover h-100">
                                <div className="sr-report-top">
                                  <div className="rr-chip rr-chip-accent">
                                    {report.report_type.replace("_", " ")}
                                  </div>
                                </div>

                                <div className="sr-report-body">
                                  <h6 className="sr-report-title">
                                    {maskedBrandOption?.maskedBrandOption?.[
                                      report.brand
                                    ] || report.brand}
                                  </h6>

                                  <div className="sr-report-meta">
                                    <div className="sr-report-meta-item">
                                      <strong>File Name</strong>
                                      <span>{report.pdf_name}</span>
                                    </div>

                                    <div className="sr-report-meta-item">
                                      <strong>Brand</strong>
                                      <span>
                                        {maskedBrandOption?.maskedBrandOption?.[
                                          report.brand
                                        ] || report.brand}
                                      </span>
                                    </div>

                                    <div className="sr-report-meta-item">
                                      <strong>Created</strong>
                                      <span>{report.created_at}</span>
                                    </div>
                                  </div>

                                  <button
                                    disabled={!!downloadingMap[report.job_id]}
                                    className="rr-btn rr-btn-primary mt-auto"
                                    onClick={() => {
                                      setDownloadingMap((prev) => ({ ...prev, [report.job_id]: true }));

                                      downloadPdf(report.job_id, () => {
                                        setDownloadingMap((prev) => ({
                                          ...prev,
                                          [report.job_id]: false,
                                        }));
                                      });
                                    }}
                                  >
                                    {downloadingMap[report.job_id] ? "Downloading..." : "Download Report"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="sr-pagination-wrap mt-4">
                            <button
                              className="rr-btn rr-btn-secondary"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              Previous
                            </button>

                            <div className="sr-pagination-numbers">
                              {[...Array(totalPages)].map((_, idx) => (
                                <button
                                  key={idx}
                                  className={`rr-btn rr-btn-secondary ${currentPage === idx + 1 ? "active" : ""
                                    }`}
                                  onClick={() => setCurrentPage(idx + 1)}
                                >
                                  {idx + 1}
                                </button>
                              ))}
                            </div>

                            <button
                              className="rr-btn rr-btn-secondary"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

    </>
  );
};

export default SavedReports;