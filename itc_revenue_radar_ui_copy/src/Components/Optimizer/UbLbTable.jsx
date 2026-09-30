import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [viewMode, setViewMode] = useState("graph");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(true);
  const stageRef = useRef(null);
  const dragTypeRef = useRef(null);
  const dragScaleRef = useRef({
    lb: { min: 0, max: 1 },
    ub: { min: 0, max: 1 },
    index: -1,
  });
  const dispatch = useDispatch();

  const isMaintainObjective =
    objective === "Maintain Spends to Maximize Sales" ||
    objective === "Maintain Sales and Minimize Spends";

  const getUpperValue = (item) =>
    isMaintainObjective ? Number(item?.c_point) || 0 : Number(item?.d_point) || 0;

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

  useEffect(() => {
    if (!attributeOptions.length) {
      setSelectedChannel(null);
      return;
    }
    const stillValid = attributeOptions.some(
      (opt) => opt.value === selectedChannel?.value
    );
    if (!stillValid) {
      setSelectedChannel(attributeOptions[0]);
    }
  }, [attributeOptions, selectedChannel]);

  const selectedIndex = useMemo(() => {
    if (!selectedChannel) return -1;
    return (sampledataset2 || []).findIndex(
      (row) => row.variables === selectedChannel.value
    );
  }, [sampledataset2, selectedChannel]);

  const selectedItem =
    selectedIndex >= 0 ? sampledataset2[selectedIndex] : null;

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

    const isMaintainObjectiveLocal =
      objective === "Maintain Spends to Maximize Sales" ||
      objective === "Maintain Sales and Minimize Spends";

    const lowerLimitBase = originalsetublboriginal[variableIndex].a_point || 1;
    const upperKey = isMaintainObjectiveLocal ? "c_point" : "d_point";

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

    if (isMaintainObjectiveLocal) {
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

    const isMaintainObjectiveLocal =
      objective === "Maintain Spends to Maximize Sales" ||
      objective === "Maintain Sales and Minimize Spends";

    const lowerLimitBase = originalsetublboriginal[variableIndex].a_point || 1;
    const upperKey = isMaintainObjectiveLocal ? "c_point" : "d_point";
    const upperLimitBase = originalsetublboriginal[variableIndex][upperKey] || 1;

    let percentageChangelb =
      ((Number(updatedDataset1[variableIndex].a_point) -
        Number(originalsetublboriginal[variableIndex].a_point)) /
        lowerLimitBase) *
      100;

    let percentageChangeub =
      ((Number(updatedDataset1[variableIndex][upperKey]) -
        Number(originalsetublboriginal[variableIndex][upperKey])) /
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
      const comparePoint = isMaintainObjectiveLocal
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

        if (isMaintainObjectiveLocal) {
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
        const comparePoint = isMaintainObjectiveLocal
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

        if (isMaintainObjectiveLocal) {
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

  const beginEdit = (variableIndex) => {
    const arr = [];
    arr[variableIndex] = true;
    setedit(arr);
  };

  const applyBoundDrag = (variableIndex, type, value) => {
    beginEdit(variableIndex);
    table2edit({ target: { value } }, variableIndex, type);
  };

  const commitBoundDrag = (variableIndex) => {
    handleupdate(variableIndex);
    setedit([]);
  };

  const formatBound = (val) => {
    const num = Number(val);
    if (!isFinite(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const curveY = (pct) => 78 - 58 / (1 + Math.exp(-10 * (pct / 100 - 0.55)));

  const valueFromClientX = (clientX, type) => {
    const el = stageRef.current;
    const scale = dragScaleRef.current?.[type] || { min: 0, max: 1 };
    const { min, max } = scale;
    if (!el) return min;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / (rect.width || 1)) * 100));
    const raw = min + (pct / 100) * (max - min || 1);
    const step = max > 1000 ? 1 : 0.1;
    return Math.round(raw / step) * step;
  };

  const onStagePointerMove = (e) => {
    if (!dragTypeRef.current) return;
    const { index } = dragScaleRef.current;
    if (index < 0) return;
    const value = valueFromClientX(e.clientX, dragTypeRef.current);
    applyBoundDrag(index, dragTypeRef.current, value);
  };

  const onStagePointerUp = () => {
    dragTypeRef.current = null;
  };

  const startPointDrag = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    dragTypeRef.current = type;
    if (stageRef.current?.setPointerCapture) {
      stageRef.current.setPointerCapture(e.pointerId);
    }
    const { index } = dragScaleRef.current;
    if (index >= 0) {
      const value = valueFromClientX(e.clientX, type);
      applyBoundDrag(index, type, value);
    }
  };

  const renderBoundsGraph = () => {
    if (!selectedItem || selectedIndex < 0) {
      return <div className="ublb-graph-empty">No channel available to edit bounds.</div>;
    }

    const lb = Number(selectedItem.a_point) || 0;
    const ub = getUpperValue(selectedItem);
    const baseLb = Number(originalsetublboriginal?.[selectedIndex]?.a_point) || lb || 1;
    const baseUb =
      Number(
        isMaintainObjective
          ? originalsetublboriginal?.[selectedIndex]?.c_point
          : originalsetublboriginal?.[selectedIndex]?.d_point
      ) || ub || 1;

    // Fixed 0 → 2× original so the marker can pass ±25%. Apply still asks to confirm past that.
    const boundWindow = (base) => {
      const origin = Math.abs(Number(base)) || 1;
      return { min: 0, max: origin * 2 };
    };
    const lbScale = boundWindow(baseLb);
    const ubScale = boundWindow(baseUb);
    dragScaleRef.current = { lb: lbScale, ub: ubScale, index: selectedIndex };

    const toPct = (v, scale) =>
      Math.min(
        100,
        Math.max(0, ((Number(v) - scale.min) / (scale.max - scale.min || 1)) * 100)
      );

    const lbPct = toPct(lb, lbScale);
    const ubPct = toPct(ub, ubScale);
    const bandLeft = Math.min(lbPct, ubPct);
    const bandWidth = Math.abs(ubPct - lbPct);
    const lbY = curveY(lbPct);
    const ubY = curveY(ubPct);

    const curvePoints = Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      const x = t * 100;
      const y = curveY(x);
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="ublb-graph-panel">
        <div
          className="ublb-graph-stage"
          ref={stageRef}
          onPointerMove={onStagePointerMove}
          onPointerUp={onStagePointerUp}
          onPointerLeave={onStagePointerUp}
        >
          <div className="ublb-graph-plot">
          <svg viewBox="0 0 100 90" className="ublb-graph-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ublbFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(13,124,102,0.22)" />
                <stop offset="100%" stopColor="rgba(13,124,102,0.02)" />
              </linearGradient>
            </defs>
            <rect
              x={bandLeft}
              y="8"
              width={Math.max(bandWidth, 0.5)}
              height="70"
              fill="rgba(13,124,102,0.08)"
            />
            <polyline
              points={`0,78 ${curvePoints} 100,78`}
              fill="url(#ublbFill)"
              stroke="none"
            />
            <polyline
              points={curvePoints}
              fill="none"
              stroke="#0d7c66"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
            <line x1="0" y1="78" x2="100" y2="78" stroke="currentColor" strokeWidth="0.5" opacity="0.28" />
            <line x1="37.5" y1="8" x2="37.5" y2="78" stroke="#0d7c66" strokeWidth="0.35" opacity="0.35" />
            <line x1="62.5" y1="8" x2="62.5" y2="78" stroke="#0d7c66" strokeWidth="0.35" opacity="0.35" />
            <line x1="50" y1="8" x2="50" y2="78" stroke="currentColor" strokeWidth="0.45" opacity="0.35" />
            <line
              x1={lbPct}
              y1="10"
              x2={lbPct}
              y2="78"
              stroke="#0d7c66"
              strokeDasharray="2 2"
              strokeWidth="0.8"
            />
            <line
              x1={ubPct}
              y1="10"
              x2={ubPct}
              y2="78"
              stroke="#17a2b8"
              strokeDasharray="2 2"
              strokeWidth="0.8"
            />

            {/* LB handle */}
            <circle
              cx={lbPct}
              cy={lbY}
              r="4.5"
              fill="transparent"
              className="ublb-point-hit"
              onPointerDown={(e) => startPointDrag("lb", e)}
            />
            <circle
              cx={lbPct}
              cy={lbY}
              r="2.6"
              fill="#0d7c66"
              stroke="#fff"
              strokeWidth="0.7"
              className="ublb-point-dot is-lb"
              onPointerDown={(e) => startPointDrag("lb", e)}
            />

            {/* UB handle */}
            <circle
              cx={ubPct}
              cy={ubY}
              r="4.5"
              fill="transparent"
              className="ublb-point-hit"
              onPointerDown={(e) => startPointDrag("ub", e)}
            />
            <circle
              cx={ubPct}
              cy={ubY}
              r="2.6"
              fill="#17a2b8"
              stroke="#fff"
              strokeWidth="0.7"
              className="ublb-point-dot is-ub"
              onPointerDown={(e) => startPointDrag("ub", e)}
            />
          </svg>

          <span
            className="ublb-graph-point-label is-lb"
            style={{ left: `${lbPct}%`, top: `${Math.max(6, (lbY / 90) * 100 - 8)}%` }}
          >
            Lower
          </span>
          <span
            className="ublb-graph-point-label is-ub"
            style={{ left: `${ubPct}%`, top: `${Math.max(6, (ubY / 90) * 100 - 8)}%` }}
          >
            Upper
          </span>
          </div>

          <div className="ublb-graph-axis">
            <span>0</span>
            <span>Vs original · lines mark −25% and +25%</span>
            <span>+100%</span>
          </div>
        </div>

        <div className="ublb-drag-row">
          <div className="ublb-drag-block">
            <div className="ublb-drag-head">
              <span className="is-lb">Lower bound</span>
              <strong>{formatBound(lb)}</strong>
            </div>
            <input
              type="range"
              className="ublb-drag-slider is-lb"
              min={lbScale.min}
              max={lbScale.max}
              step={lbScale.max > 1000 ? 1 : 0.1}
              value={Math.min(Math.max(lb, lbScale.min), lbScale.max)}
              style={{ "--ublb-fill": `${lbPct}%` }}
              onChange={(e) => applyBoundDrag(selectedIndex, "lb", e.target.value)}
            />
          </div>

          <div className="ublb-drag-block">
            <div className="ublb-drag-head">
              <span className="is-ub">Upper bound</span>
              <strong>{formatBound(ub)}</strong>
            </div>
            <input
              type="range"
              className="ublb-drag-slider is-ub"
              min={ubScale.min}
              max={ubScale.max}
              step={ubScale.max > 1000 ? 1 : 0.1}
              value={Math.min(Math.max(ub, ubScale.min), ubScale.max)}
              style={{ "--ublb-fill": `${ubPct}%` }}
              onChange={(e) => applyBoundDrag(selectedIndex, "ub", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBoundsTable = () => (
    <>
      <div className="ublb-inner-panel ublb-filter-panel">
        <div className="row g-2 align-items-end">
          <div className="col-lg-8 col-md-12 col-12">
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

      <div className="ublb-inner-panel ublb-table-panel">
        <div className="table-responsive rr-table-wrap">
          <table className="table rr-table ublb-compact-table align-middle mb-0">
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
    </>
  );

  return (
    <>
      <div className="ublb-page mt-3">
        <div className={`ublb-shell ${isCardOpen ? "is-open" : "is-collapsed"}`}>
          <div className="ublb-toolbar">
            <div className="ublb-toolbar-title">Optimization Bound</div>
            <button
              type="button"
              className="ublb-card-toggle"
              title={isCardOpen ? "Close" : "Open"}
              aria-expanded={isCardOpen}
              onClick={() => setIsCardOpen((prev) => !prev)}
            >
              {isCardOpen ? (
                <>
                  <span>Close</span>
                  <iconify-icon icon="mdi:chevron-up"></iconify-icon>
                </>
              ) : (
                <>
                  <span>Open</span>
                  <iconify-icon icon="mdi:chevron-down"></iconify-icon>
                </>
              )}
            </button>
          </div>

          {isCardOpen && (
            <div className="ublb-shell-body">
              <div className="ublb-body-top">
                <div className="ublb-view-switch" role="tablist" aria-label="Bounds view">
                  <button
                    type="button"
                    className={`ublb-view-btn ${viewMode === "graph" ? "is-active" : ""}`}
                    onClick={() => setViewMode("graph")}
                  >
                    Graph
                  </button>
                  <button
                    type="button"
                    className={`ublb-view-btn ${viewMode === "table" ? "is-active" : ""}`}
                    onClick={() => setViewMode("table")}
                  >
                    Table
                  </button>
                </div>

                {viewMode === "graph" && (
                  <div className="ublb-toolbar-controls">
                    <span className="ublb-graph-bar-label">Channel</span>
                    <div className="ublb-graph-bar-select">
                      <Select
                        classNamePrefix="rr-select"
                        options={attributeOptions}
                        value={selectedChannel}
                        onChange={(opt) => {
                          setSelectedChannel(opt);
                          setedit([]);
                        }}
                        placeholder="Select channel"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      />
                    </div>
                    {selectedItem && (
                      <>
                        <span className="ublb-pill is-lb">
                          LB {formatBound(Number(selectedItem.a_point) || 0)}
                        </span>
                        <span className="ublb-pill is-ub">
                          UB {formatBound(getUpperValue(selectedItem))}
                        </span>
                      </>
                    )}
                    {selectedIndex >= 0 && (
                      <>
                        <button
                          type="button"
                          className="ublb-bar-btn"
                          title="Reset"
                          onClick={() => {
                            handlecancel(selectedIndex);
                            setedit([]);
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="ublb-bar-btn is-primary"
                          title="Apply bounds"
                          onClick={() => commitBoundDrag(selectedIndex)}
                        >
                          Apply
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="ublb-body-content">
                {viewMode === "graph" ? renderBoundsGraph() : renderBoundsTable()}
              </div>

              {onOptimize && (
                <div className="ublb-body-footer">
                  <span
                    className="rr-btn rr-btn-primary"
                    style={{
                      cursor: isprocessing ? "not-allowed" : "pointer",
                      opacity: isprocessing ? 0.6 : 1,
                    }}
                    onClick={() => {
                      if (!isprocessing) onOptimize();
                    }}
                  >
                    Optimize <iconify-icon icon="iconamoon:arrow-right-2-bold"></iconify-icon>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UbLbTable;
