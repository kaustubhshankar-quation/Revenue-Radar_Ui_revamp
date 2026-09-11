import React, { useMemo, useState } from "react";
import ExceptionVariables from "../JSON Files/ExceptionVariables.json";
import { useDispatch } from "react-redux";
import getNotification from "../../Redux/Action/action";
import Select from "react-select";

function UbLbTable({
  objective,
  originalsetublboriginal,
  sampledataset2,
  originalset2,
  handleoriginaldataset2change,
  handlesampledataset2change,
  onOptimize,
  isprocessing,
}) {
  const hidingvariablelist = ExceptionVariables?.hiddenvariables || [];
  const [addminuspercentagelb, setaddminuspercentagelb] = useState([]);
  const [addminuspercentageub, setaddminuspercentageub] = useState([]);
  const [edit, setedit] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const dispatch = useDispatch();

  const visibleDataset = useMemo(() => {
    return (sampledataset2 || []).filter(
      (item) => !hidingvariablelist.some((variable) => variable === item.variables)
    );
  }, [sampledataset2, hidingvariablelist]);

  const attributeOptions = useMemo(() => {
    return visibleDataset.map((item) => ({
      label: item.variables,
      value: item.variables,
    }));
  }, [visibleDataset]);

  const filteredDataset = useMemo(() => {
    if (!selectedAttributes?.length) return visibleDataset;
    const selectedValues = selectedAttributes.map((item) => item.value);
    return visibleDataset.filter((item) => selectedValues.includes(item.variables));
  }, [visibleDataset, selectedAttributes]);

  const table2edit = (e, variableIndex, type) => {
    const updatedDataset = [...sampledataset2];
    const enteredvalue = e.target.value || 0;

    if (type === "lb") {
      let arr = [...addminuspercentagelb];
      const percentageChange = (
        ((enteredvalue - originalsetublboriginal[variableIndex].a_point) /
          originalsetublboriginal[variableIndex].a_point) *
        100
      )?.toFixed(2);
      arr[variableIndex] = percentageChange === "Infinity" ? 0 : percentageChange;
      updatedDataset[variableIndex].a_point = enteredvalue;
      setaddminuspercentagelb(arr);
    } else if (type === "ub") {
      let arr = [...addminuspercentagelb];
      if (
        objective === "Maintain Spends to Maximize Sales" ||
        objective === "Maintain Sales and Minimize Spends"
      ) {
        const percentageChange = (
          ((enteredvalue - originalsetublboriginal[variableIndex].c_point) /
            originalsetublboriginal[variableIndex].c_point) *
          100
        )?.toFixed(2);
        arr[variableIndex] = percentageChange === "Infinity" ? 0 : percentageChange;
        updatedDataset[variableIndex].c_point = enteredvalue;
      } else {
        const percentageChange = (
          ((enteredvalue - originalsetublboriginal[variableIndex].d_point) /
            originalsetublboriginal[variableIndex].d_point) *
          100
        )?.toFixed(2);
        arr[variableIndex] = percentageChange === "Infinity" ? 0 : percentageChange;
        updatedDataset[variableIndex].d_point = enteredvalue;
      }
      setaddminuspercentageub(arr);
    }

    handlesampledataset2change(updatedDataset);
  };

  const table2editpercetnagebasis = (e, variableIndex, type) => {
    const updatedDataset = [...sampledataset2];
    const enteredValue = parseFloat(e.target.value) || 0;

    if (false) {
      dispatch(
        getNotification({
          message: "Entered value must be between -25% and 25%.",
          type: "danger",
        })
      );
      return;
    }

    const updatePercentage = (array, index, value, isLowerLimit) => {
      const updatedArray = [...array];
      updatedArray[index] = value;
      isLowerLimit
        ? setaddminuspercentagelb(updatedArray)
        : setaddminuspercentageub(updatedArray);
    };

    if (type === "lb") {
      updatePercentage(addminuspercentagelb, variableIndex, enteredValue, true);

      updatedDataset[variableIndex].a_point = Number(
        originalsetublboriginal[variableIndex].a_point * (1 + enteredValue / 100)
      )?.toFixed(2);
    } else if (type === "ub") {
      updatePercentage(addminuspercentageub, variableIndex, enteredValue, false);

      if (
        objective === "Maintain Spends to Maximize Sales" ||
        objective === "Maintain Sales and Minimize Spends"
      ) {
        updatedDataset[variableIndex].c_point = Number(
          originalsetublboriginal[variableIndex].c_point * (1 + enteredValue / 100)
        )?.toFixed(2);
      } else {
        updatedDataset[variableIndex].d_point = Number(
          originalsetublboriginal[variableIndex].d_point * (1 + enteredValue / 100)
        )?.toFixed(2);
      }
    }

    handlesampledataset2change(updatedDataset);
  };

  const handlecancel = (variableIndex) => {
    const updatedDataset1 = [...sampledataset2];
    const updatedDataset2 = [...originalset2];

    let arr1 = [...addminuspercentagelb];
    let arr2 = [...addminuspercentageub];

    const isMaintainObjective =
      objective === "Maintain Spends to Maximize Sales" ||
      objective === "Maintain Sales and Minimize Spends";

    const lowerLimitBase = originalsetublboriginal[variableIndex].a_point || 1;
    const upperKey = isMaintainObjective ? "c_point" : "d_point";

    const upperLimitBase = originalsetublboriginal[variableIndex][upperKey] || 1;

    let percentageChangelb =
      ((updatedDataset1[variableIndex].lower_limit -
        originalsetublboriginal[variableIndex].lower_limit) /
        lowerLimitBase) *
      100;

    let percentageChangeub =
      ((updatedDataset1[variableIndex][upperKey] -
        originalsetublboriginal[variableIndex][upperKey]) /
        upperLimitBase) *
      100;

    percentageChangelb = isFinite(percentageChangelb)
      ? percentageChangelb.toFixed(0)
      : 0;
    percentageChangeub = isFinite(percentageChangeub)
      ? percentageChangeub.toFixed(0)
      : 0;

    setaddminuspercentagelb(arr1);
    setaddminuspercentageub(arr2);

    if (isMaintainObjective) {
      updatedDataset1[variableIndex].c_point = updatedDataset2[variableIndex].c_point;
    } else {
      updatedDataset1[variableIndex].d_point = updatedDataset2[variableIndex].d_point;
    }

    updatedDataset1[variableIndex].a_point = updatedDataset2[variableIndex].a_point;
    handlesampledataset2change(updatedDataset1);
  };

  const handleupdate = (variableIndex) => {
    const updatedDataset1 = [...sampledataset2];
    const updatedDataset2 = [...originalset2];
    let arr1 = [...addminuspercentagelb];
    let arr2 = [...addminuspercentageub];

    const isMaintainObjective =
      objective === "Maintain Spends to Maximize Sales" ||
      objective === "Maintain Sales and Minimize Spends";

    const lowerLimitBase = originalsetublboriginal[variableIndex].a_point || 1;
    const upperKey = isMaintainObjective ? "c_point" : "d_point";
    const upperLimitBase = originalsetublboriginal[variableIndex][upperKey] || 1;

    let percentageChangelb =
      ((updatedDataset1[variableIndex].lower_limit -
        originalsetublboriginal[variableIndex].lower_limit) /
        lowerLimitBase) *
      100;

    let percentageChangeub =
      ((updatedDataset1[variableIndex][upperKey] -
        originalsetublboriginal[variableIndex][upperKey]) /
        upperLimitBase) *
      100;

    percentageChangelb = isFinite(percentageChangelb)
      ? percentageChangelb.toFixed(0)
      : 0;
    percentageChangeub = isFinite(percentageChangeub)
      ? percentageChangeub.toFixed(0)
      : 0;

    if (
      percentageChangelb <= 25 &&
      percentageChangelb >= -25 &&
      percentageChangeub <= 25 &&
      percentageChangeub >= -25
    ) {
      const lowerBound = updatedDataset1[variableIndex].a_point;
      const comparePoint = isMaintainObjective
        ? updatedDataset1[variableIndex].c_point
        : updatedDataset1[variableIndex].d_point;

      if (Number(lowerBound) > Number(comparePoint)) {
        dispatch(
          getNotification({
            message: `Upper Bound is less than lower bound!`,
            type: "danger",
          })
        );
      } else {
        arr1[variableIndex] = percentageChangelb;
        arr2[variableIndex] = percentageChangeub;
        setaddminuspercentagelb(arr1);
        setaddminuspercentageub(arr2);

        if (isMaintainObjective) {
          updatedDataset2[variableIndex].c_point =
            updatedDataset1[variableIndex].c_point;
        } else {
          updatedDataset2[variableIndex].d_point =
            updatedDataset1[variableIndex].d_point;
        }

        updatedDataset2[variableIndex].a_point =
          updatedDataset1[variableIndex].a_point;

        edit[variableIndex] = false;
        handleoriginaldataset2change(updatedDataset2);

        dispatch(
          getNotification({
            message: `Bounds updated for ${updatedDataset2[variableIndex].variables}`,
            type: "success",
          })
        );
      }
    } else if (
      percentageChangelb > 25 ||
      percentageChangelb < -25 ||
      percentageChangeub > 25 ||
      percentageChangeub < -25
    ) {
      let confirmedbounds = window.confirm(
        "Entered change percentage is not within -25% to 25% range.Do you wish to continue?"
      );

      if (confirmedbounds) {
        const lowerBound = updatedDataset1[variableIndex].a_point;
        const comparePoint = isMaintainObjective
          ? updatedDataset1[variableIndex].c_point
          : updatedDataset1[variableIndex].d_point;

        if (Number(lowerBound) > Number(comparePoint)) {
          dispatch(
            getNotification({
              message: `Upper Bound is less than lower bound!`,
              type: "danger",
            })
          );
          return;
        }

        arr1[variableIndex] = percentageChangelb;
        arr2[variableIndex] = percentageChangeub;
        setaddminuspercentagelb(arr1);
        setaddminuspercentageub(arr2);

        if (isMaintainObjective) {
          updatedDataset2[variableIndex].c_point =
            updatedDataset1[variableIndex].c_point;
        } else {
          updatedDataset2[variableIndex].d_point =
            updatedDataset1[variableIndex].d_point;
        }

        updatedDataset2[variableIndex].a_point =
          updatedDataset1[variableIndex].a_point;

        edit[variableIndex] = false;
        handleoriginaldataset2change(updatedDataset2);

        dispatch(
          getNotification({
            message: `Bounds updated for ${updatedDataset2[variableIndex].variables}`,
            type: "success",
          })
        );
      }
    }
  };

  return (
    <>
      <div className="ublb-page mt-3">
        <div className="accordion rr-accordion" id="boundsAccordion">
          <div className="accordion-item rr-accordion-item">
            <h2 className="accordion-header" id="boundHeading">
              <button
                className="accordion-button rr-accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#boundCollapse"
                aria-expanded="true"
                aria-controls="boundCollapse"
              >
                <div className="rr-accordion-title-wrap">
                  <div className="rr-breadcrumb">Optimization / Bounds Table</div>
                  <div className="rr-page-title">Upper Bounds and Lower Bounds</div>
                  <div className="rr-page-subtitle">
                    Review and edit weekly lower and upper bounds for selected attributes.
                  </div>
                </div>
                {onOptimize && (
                  <div className="ublb-optimize-btn-wrap" onClick={(e) => e.stopPropagation()}>
                    <span
                      className="rr-btn rr-btn-primary"
                      style={{ cursor: isprocessing ? "not-allowed" : "pointer", opacity: isprocessing ? 0.6 : 1 }}
                      onClick={() => { if (!isprocessing) onOptimize(); }}
                    >
                      Optimize <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                    </span>
                  </div>
                )}
              </button>
            </h2>

            <div
              id="boundCollapse"
              className="accordion-collapse collapse show"
              aria-labelledby="boundHeading"
              data-bs-parent="#boundsAccordion"
            >
              <div className="accordion-body rr-accordion-body">
                {/* Filter Section */}
                <div className="ublb-inner-panel ublb-filter-panel">
                  <div className="row g-3 align-items-end">
                    <div className="col-lg-8 col-md-12 col-12">
                      <label className="rr-label">Filter Attribute Name</label>
                      <Select
                        isMulti
                        options={attributeOptions}
                        value={selectedAttributes}
                        onChange={(value) => setSelectedAttributes(value || [])}
                        placeholder="Select one or multiple attributes"
                        classNamePrefix="rr-select"
                      />
                    </div>

                    <div className="col-lg-4 col-md-12 col-12">
                      <button
                        className="rr-btn rr-btn-secondary w-100"
                        onClick={() => setSelectedAttributes([])}
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Section */}
                <div className="ublb-inner-panel ublb-table-panel">
                  <div className="rr-table-panel-head">
                    <h5 className="rr-table-panel-title mb-0">Bounds Configuration Table</h5>
                  </div>

                  <div className="table-responsive rr-table-wrap">
                    <table className="table rr-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Attribute</th>
                          <th>Lower Bound (Weekly)</th>
                          <th>Upper Bound (Weekly)</th>
                          <th>Edit</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredDataset?.length > 0 ? (
                          filteredDataset.map((item) => {
                            const variableIndex = sampledataset2.findIndex(
                              (row) => row.variables === item.variables
                            );

                            if (variableIndex === -1) return null;

                            return (
                              <tr key={`row-${variableIndex}`}>
                                <td>
                                  <div className="ublb-attribute-cell">
                                    <span className="ublb-attribute-name">
                                      {item.variables}
                                    </span>
                                    <span className="ublb-attribute-type">
                                      {item.type}
                                    </span>
                                  </div>
                                </td>

                                <td>
                                  <div className="ublb-bound-box">
                                    <div className="ublb-bound-left">
                                      {edit[variableIndex] ? (
                                        <div className="ublb-input-group">
                                          <small>Bound</small>
                                          <input
                                            className="rr-input"
                                            placeholder="Lower Limit"
                                            value={item.a_point}
                                            onChange={(e) =>
                                              table2edit(e, variableIndex, "lb")
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <span className="ublb-bound-value">
                                          {Number(item.a_point)?.toFixed(2)}
                                        </span>
                                      )}
                                    </div>

                                    {edit[variableIndex] && (
                                      <div className="ublb-bound-right">
                                        <div className="ublb-input-group">
                                          <small>Percentage Change</small>
                                          <input
                                            className="rr-input"
                                            type="number"
                                            placeholder="% increase/decrease"
                                            value={addminuspercentagelb[variableIndex]}
                                            onChange={(e) =>
                                              table2editpercetnagebasis(
                                                e,
                                                variableIndex,
                                                "lb"
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td>
                                  <div className="ublb-bound-box">
                                    <div className="ublb-bound-left">
                                      {edit[variableIndex] ? (
                                        <div className="ublb-input-group">
                                          <small>Bound</small>
                                          <input
                                            className="rr-input"
                                            placeholder="Upper Limit"
                                            value={
                                              objective ===
                                                "Maintain Spends to Maximize Sales" ||
                                                objective ===
                                                "Maintain Sales and Minimize Spends"
                                                ? item.c_point
                                                : item.d_point
                                            }
                                            onChange={(e) =>
                                              table2edit(e, variableIndex, "ub")
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <span className="ublb-bound-value">
                                          {objective ===
                                            "Maintain Spends to Maximize Sales" ||
                                            objective ===
                                            "Maintain Sales and Minimize Spends"
                                            ? Number(item.c_point)?.toFixed(2)
                                            : Number(item.d_point)?.toFixed(2)}
                                        </span>
                                      )}
                                    </div>

                                    {edit[variableIndex] && (
                                      <div className="ublb-bound-right">
                                        <div className="ublb-input-group">
                                          <small>Percentage Change</small>
                                          <input
                                            className="rr-input"
                                            type="number"
                                            placeholder="% increase/decrease"
                                            value={addminuspercentageub[variableIndex]}
                                            onChange={(e) =>
                                              table2editpercetnagebasis(
                                                e,
                                                variableIndex,
                                                "ub"
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td>
                                  {edit[variableIndex] ? (
                                    <div className="ublb-action-row">
                                      <button
                                        className="rr-btn rr-btn-secondary rr-btn-icon"
                                        onClick={() => {
                                          handleupdate(variableIndex);
                                        }}
                                      >
                                        <i className="fa fa-check"></i>
                                      </button>

                                      <button
                                        className="rr-btn rr-btn-secondary rr-btn-icon"
                                        onClick={() => {
                                          let arr = [];
                                          setedit(arr);
                                          handlecancel(variableIndex);
                                        }}
                                      >
                                        <i className="fa fa-arrow-circle-left"></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="rr-btn rr-btn-primary"
                                      onClick={() => {
                                        let arr = [];
                                        arr[variableIndex] = true;
                                        setedit(arr);
                                      }}
                                    >
                                      <i className="fas fa-edit me-1"></i> Edit
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4">
                              <div className="rr-empty-panel">
                                No attributes available for the selected filter.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UbLbTable;