import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import getNotification from "../../Redux/Action/action.js";
import UserService from "../../services/UserService";

const { REACT_APP_REDIRECT_URI } = process.env;
const { REACT_APP_UPLOAD_DATA } = process.env;

function AnnualData({ fulldataset1, fulldataset2, isValue, displaynames, range }) {
  const { theme } = useOutletContext();
  const isDark = theme === "dark";
  const dispatch = useDispatch();

  const [endDate, setendDate] = useState("");

  useEffect(() => {
    handlevariablesfetch();
  }, []);

  const handlevariablesfetch = async () => {
    if (UserService.isLoggedIn()) {
      try {
        const config = {
          method: "get",
          url: `${REACT_APP_UPLOAD_DATA}/app/fetchvars`,
          headers: {
            Accept: "text/plain",
            "Content-Type": "application/json",
          },
        };

        const getResponse = await axios(config);

        if (getResponse.data !== "Invalid User!") {
          if (Array.isArray(fulldataset2?.plot6) && fulldataset2.plot6.length > 0) {
            setendDate(fulldataset2?.plot6[fulldataset2?.plot6?.length - 1]?.month_year);
          } else {
            setendDate(fulldataset2?.plot1?.[0]?.month_year);
          }
        }
      } catch (err) {
        console.log("Server Error", err);

        const message =
          err.response?.status === 401
            ? "Session expired! Please log in again"
            : err.response?.status === 404
            ? "Page not Found"
            : err.response?.status === 400 || err.response?.status === 422
            ? "Input is not in prescribed format"
            : "Server is Down! Please try again after sometime";

        dispatch(
          getNotification({
            message,
            type: "default",
          })
        );
      }
    } else {
      setTimeout(() => {
        UserService.doLogin({
          redirectUri: `${REACT_APP_REDIRECT_URI}/simulator`,
        });
      }, 1000);
    }
  };

  const filteredDataplot1 = fulldataset1?.plot1?.map((item) => item) || [];
  const filteredDataplot2 = fulldataset1?.plot7?.map((item) => item) || [];

  const basePredictedVolume =
    (fulldataset2?.plot1?.reduce((total, item) => {
      return total + (Number(item?.predicted_sales) || 0);
    }, 0) || 0) / 1000;

  const scenarioPredictedVolume =
    (filteredDataplot1?.reduce((total, item) => {
      return total + (Number(item?.predicted_sales) || 0);
    }, 0) || 0) / 1000;

  const basePredictedValue =
    (fulldataset2?.plot1?.reduce((total, item) => {
      return total + (Number(item?.total_sales_value) || 0);
    }, 0) || 0) / 100000;

  const scenarioPredictedValue =
    (filteredDataplot2?.reduce((total, item) => {
      return total + (Number(item?.total_sales_value) || 0);
    }, 0) || 0) / 100000;

  const baseKpiValue = isValue ? basePredictedValue : basePredictedVolume;
  const scenarioKpiValue = isValue ? scenarioPredictedValue : scenarioPredictedVolume;

  const difference = scenarioKpiValue - baseKpiValue;

  const percentageDifference =
    baseKpiValue !== 0 ? (difference / baseKpiValue) * 100 : 0;

  const isPositive = difference >= 0;

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      {/* Base Scenario KPI Card */}
      <div className="col-lg-4 col-md-6 col-12">
        <div className="rr-kpi-card h-100">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="rr-kpi-label">
                {displaynames?.scenario?.match("Reference")
                  ? "Reference Scenario"
                  : "Base Scenario"}
              </div>

              <div className="rr-kpi-value">
                {formatNumber(baseKpiValue)}
                <span className="rr-kpi-unit">
                  {isValue ? "Lacs" : "Tonnes"}
                </span>
              </div>

              <div className="rr-kpi-subtext">
                Total Predicted Sales {isValue ? "Value" : "Volume"}
              </div>
            </div>

            <span className="rr-chip rr-chip-accent">{range}</span>
          </div>
        </div>
      </div>

      {/* Scenario KPI Card */}
      <div className="col-lg-4 col-md-6 col-12">
        <div className="rr-kpi-card rr-kpi-card--accent h-100">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="rr-kpi-label">
                {displaynames?.scenario || "Scenario"}
              </div>

              <div className="rr-kpi-value rr-kpi-value--accent">
                {formatNumber(scenarioKpiValue)}
                <span className="rr-kpi-unit">
                  {isValue ? "Lacs" : "Tonnes"}
                </span>
              </div>

              <div className="rr-kpi-subtext">
                Scenario Predicted Sales {isValue ? "Value" : "Volume"}
              </div>
            </div>

            <span className="rr-chip rr-chip-accent">
              {range}
            </span>
          </div>
        </div>
      </div>

      {/* Difference KPI Card */}
      <div className="col-lg-4 col-md-12 col-12">
        <div
          className={`rr-kpi-card rr-kpi-card--difference h-100 ${
            isPositive ? "rr-kpi-card--positive" : "rr-kpi-card--negative"
          }`}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="rr-kpi-label">
                Difference vs Base Scenario
              </div>

              <div
                className={`rr-kpi-value ${
                  isPositive
                    ? "rr-kpi-value--positive"
                    : "rr-kpi-value--negative"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatNumber(difference)}
                <span className="rr-kpi-unit">
                  {isValue ? "Lacs" : "Tonnes"}
                </span>
              </div>

              <div className="rr-kpi-subtext">
                {isPositive ? "Increase" : "Decrease"} of{" "}
                <strong>
                  {isPositive ? "+" : ""}
                  {percentageDifference.toFixed(2)}%
                </strong>{" "}
                compared to Base Scenario
              </div>
            </div>

            <span
              className={`rr-chip ${
                isPositive
                  ? "rr-chip-good"
                  : "rr-chip-danger"
              }`}
            >
              {isPositive ? "Uplift" : "Drop"}
            </span>
          </div>
        </div>
      </div>

      {/* kpi cards moved to src/styles/components/_components.scss (rr-kpi-*) */}
    </>
  );
}

export default AnnualData;