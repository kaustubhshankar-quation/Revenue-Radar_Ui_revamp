import React from 'react'
import ExceptionVariables from '../JSON Files/ExceptionVariables.json'
const XLSX = require("xlsx");
function AfterOptimizationTable({ salesAgg, resultValue, haloResults, filteredplotdata1, corevalue, distributionvalue, distributionvaluecontri, objectiveName }) {
  filteredplotdata1 = filteredplotdata1?.sort((a, b) => a.variable.localeCompare(b.variable))
  const hidingvariablelist = ExceptionVariables?.hiddenvariables;

  const downloadtabledata = () => {
    const data = [];

    const headers = [];

    //headers.push("Scenario")
    headers.push("Variables")
    headers.push("Planned")
    headers.push("Optimized")
    headers.push("Change(%)")
    headers.push("Unit")


    data.push(headers);
    const totalspends = [
      {
        variable: "Total Spends (Lacs)",
        planned_spends: (filteredplotdata1?.filter((it) => it.variable !== "sales")?.reduce((prev, next) => prev + next.planned_spends, 0) / 100000)?.toFixed(3),
        optimized_spends: (filteredplotdata1?.filter((it) => it.variable !== "sales")?.reduce((prev, next) => prev + next.optimized_spends, 0) / 100000)?.toFixed(3),
        percentage_difference: `${((
          (
            (filteredplotdata1
              ?.filter((it) => it.variable !== "sales")
              ?.reduce((prev, next) => prev + next.optimized_spends, 0) -
              filteredplotdata1
                ?.filter((it) => it.variable !== "sales")
                ?.reduce((prev, next) => prev + next.planned_spends, 0)
            ) /
            filteredplotdata1
              ?.filter((it) => it.variable !== "sales")
              ?.reduce((prev, next) => prev + next.planned_spends, 0)
          ) * 100)?.toFixed(3))}%`
      },


    ]
    const totalsales = [{
      variable: "Total Sales(Tonnes)",
      planned_spends: (salesAgg[0]?.planned_spends / 1000)?.toFixed(3),
      optimized_spends: (salesAgg[0]?.optimized_spends / 1000)?.toFixed(3),
      percentage_difference: ` ${((
        Number(salesAgg[0]?.optimized_spends) -
        Number(salesAgg[0]?.planned_spends))
        / salesAgg[0]?.planned_spends * 100)?.toFixed(3)
        }%`
    }]
    totalspends?.map((row) => {
      const variables = row.variable;
      const unit = "Lacs"
      const planned = row.planned_spends;
      const optimized = row.optimized_spends;
      const differencepercentage = row.percentage_difference;

      data.push([variables, planned, optimized, differencepercentage, unit]);
    })
    totalsales?.map((row) => {
      const variables = row.variable;
      const unit = "Kg Tonnes"
      const planned = row.planned_spends;
      const optimized = row.optimized_spends;
      const differencepercentage = row.percentage_difference;

      data.push([variables, planned, optimized, differencepercentage, unit]);
    })
    filteredplotdata1?.map((row) => {
      const variables = row.variable;
      const unit = "Lacs"
      const planned = (row.planned_spends / 100000).toFixed(3);
      const optimized = (row.optimized_spends / 100000).toFixed(3);
      const differencepercentage = `${row?.percentage_difference ? row?.percentage_difference?.toFixed(1) : row.planned_spends !== 0 ? ((row.optimized_spends - row.planned_spends) / (row.planned_spends) * 100).toFixed(1) : 0}%`;

      data.push([variables, planned, optimized, differencepercentage, unit]);
    })
    corevalue?.map((row) => {
      const variables = row.core_incremental_media;
      const unit = "Lacs"
      const planned = (row.planned_spends / 100000).toFixed(3);
      const optimized = (row.optimized_spends / 100000).toFixed(3);
      const differencepercentage = `${row?.percentage_difference ? row?.percentage_difference?.toFixed(1) : row.planned_spends !== 0 ? ((row.optimized_spends - row.planned_spends) / (row.planned_spends) * 100).toFixed(1) : 0}%`;

      data.push([variables, planned, optimized, differencepercentage, unit]);
    })

    distributionvalue?.length > 0 &&
      distributionvalue?.map((row) => {
        const variables = row.variable_name;
        const unit = "Number"
        const planned = row.attribute_value;
        const optimized = row.attribute_value;
        const differencepercentage = `${row?.percentage_difference ? row?.percentage_difference?.toFixed(1) : row !== 0 ? ((row.attribute_value - row.attribute_value) / (row.attribute_value) * 100).toFixed(1) : 0}%`;

        data.push([variables, planned, optimized, differencepercentage, unit]);
      })
    distributionvaluecontri?.length > 0 &&
      distributionvaluecontri?.map((row) => {
        const variables = row.variable_name;
        const unit = "Kg Tonnes"
        const planned = row.planned / 1000;
        const optimized = row.optimized / 1000;
        const differencepercentage = `${row?.percentage_difference ? row?.percentage_difference?.toFixed(1) : row.planned !== 0 ? ((row.optimized - row.planned) / (row.planned) * 100).toFixed(1) : 0}%`;
        // const brand= row.brand;
        //   const market = row.market;
        //   const lastfy = row.lastfy;
        //   const lastmape =`${(row.lastmape*100).toFixed(1)}%`;
        //   const currentfy =row.currentfy;
        //   const currentmape=`${(row.currentmape*100).toFixed(1)}%`;
        data.push([variables, planned, optimized, differencepercentage, unit]);
      })
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create a new worksheet and add data to it
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Convert JSON to sheet and add as second sheet
    const worksheet2 = XLSX.utils.json_to_sheet(resultValue);
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Scenario Comparison");

    // Write the workbook to binary Excel format
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    // Create blob
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OptimizationResults.xlsx`;
    link.click();


  }
return (
  <>
    <div className="aftopt-page mt-3">
      <div className="accordion rr-accordion" id="aftoptAccordion" style={{ userSelect: "none" }}>
        <div className="accordion-item rr-accordion-item">
          <h2 className="accordion-header" id="aftoptHeading">
            <button
              className="accordion-button rr-accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#aftoptCollapse"
              aria-expanded="true"
              aria-controls="aftoptCollapse"
            >
              <div className="rr-accordion-title-wrap">
                <div className="rr-breadcrumb">Optimization / Results Summary</div>
                <div className="rr-page-title">
                  Optimized Spend Summary for Objective:{" "}
                  <span className="rr-chip rr-chip-lg ms-1">{objectiveName}</span>
                </div>
                <div className="rr-page-subtitle">
                  Review total spends, sales movement, variable-wise optimized values,
                  halo contribution, and distribution impact in a single premium summary table.
                </div>
              </div>
            </button>
          </h2>

          <div
            id="aftoptCollapse"
            className="accordion-collapse collapse show"
            aria-labelledby="aftoptHeading"
            data-bs-parent="#aftoptAccordion"
          >
            <div className="accordion-body rr-accordion-body">
              <>
                {filteredplotdata1?.length > 0 && (
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                      <button
                        className="rr-btn rr-btn-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Download Excel"
                        onClick={downloadtabledata}
                      >
                        <i className="fa fa-download me-1"></i> Download
                      </button>

                      <button
                        className="rr-btn rr-btn-secondary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Copy all tables with formatting"
                        onClick={() => {
                          const accordionBody = document.querySelector("#aftoptCollapse .accordion-body");
                          if (accordionBody) {
                            const tables = accordionBody.querySelectorAll("table");
                            let htmlToCopy = "";

                            tables.forEach((table) => {
                              const clonedTable = table.cloneNode(true);

                              const headers = clonedTable.querySelectorAll("thead th");
                              headers.forEach((th) => {
                                th.style.fontWeight = "bold";
                                th.style.backgroundColor = "#475569";
                                th.style.color = "#fff";
                                th.style.border = "1px solid #000";
                                th.style.padding = "6px";
                              });

                              const cells = clonedTable.querySelectorAll("td");
                              cells.forEach((td) => {
                                td.style.border = "1px solid #000";
                                td.style.padding = "6px";
                              });

                              clonedTable.style.borderCollapse = "collapse";
                              clonedTable.style.marginBottom = "20px";
                              clonedTable.style.width = "100%";

                              htmlToCopy += clonedTable.outerHTML + "<br/><br/>";
                            });

                            const blob = new Blob([htmlToCopy], { type: "text/html" });
                            const data = [new ClipboardItem({ "text/html": blob })];

                            navigator.clipboard.write(data).then(() => {
                              alert("All tables copied with formatting! Paste into Excel/Word.");
                            });
                          }
                        }}
                      >
                        <i className="fa fa-copy me-1"></i> Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* TOTAL SUMMARY */}
                <div className="aftopt-inner-panel aftopt-table-panel mb-4">
                  <div className="rr-table-banner">
                    <h5 className="rr-table-banner-title mb-0">Overall Summary</h5>
                  </div>

                  <div className="table-responsive rr-table-wrap">
                    <table className="table rr-table align-middle mb-0">
                      <colgroup>
                        <col style={{width: '40%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Total</th>
                          <th className="text-center">Planned</th>
                          <th className="text-center">Optimized</th>
                          <th className="text-center">Diff (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="aftopt-variable-cell">
                              <span className="aftopt-variable-name">Total Spends (Lacs)</span>
                              <span className="rr-tag">Summary</span>
                            </div>
                          </td>
                          <td className="text-center">
                            {(
                              filteredplotdata1
                                ?.filter(
                                  (it) =>
                                    it.variable !== "sales" &&
                                    !it.variable.startsWith("Halo") &&
                                    !it.variable.startsWith("HALO") &&
                                    !it.variable.startsWith("halo")
                                )
                                ?.reduce((prev, next) => prev + next.planned_spends, 0) / 100000
                            )?.toFixed(3)}
                          </td>
                          <td className="text-center">
                            {(
                              filteredplotdata1
                                ?.filter(
                                  (it) =>
                                    it.variable !== "sales" &&
                                    !it.variable.startsWith("Halo") &&
                                    !it.variable.startsWith("HALO") &&
                                    !it.variable.startsWith("halo")
                                )
                                ?.reduce((prev, next) => prev + next.optimized_spends, 0) / 100000
                            )?.toFixed(3)}
                          </td>
                          <td className="text-center">
                            {(
                              (
                                (filteredplotdata1
                                  ?.filter((it) => it.variable !== "sales")
                                  ?.reduce((prev, next) => prev + next.optimized_spends, 0) -
                                  filteredplotdata1
                                    ?.filter((it) => it.variable !== "sales")
                                    ?.reduce((prev, next) => prev + next.planned_spends, 0)) /
                                filteredplotdata1
                                  ?.filter((it) => it.variable !== "sales")
                                  ?.reduce((prev, next) => prev + next.planned_spends, 0)
                              ) *
                              100
                            )?.toFixed(3)}
                            %
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <div className="aftopt-variable-cell">
                              <span className="aftopt-variable-name">Total Sales (Tonnes)</span>
                              <span className="rr-tag rr-tag-sales">Sales</span>
                            </div>
                          </td>
                          <td className="text-center">{(salesAgg[0]?.planned_sales / 1000)?.toFixed(3)}</td>
                          <td className="text-center">{(salesAgg[0]?.optimized_sales / 1000)?.toFixed(3)}</td>
                          <td className="text-center">
                            {(
                              ((Number(salesAgg[0]?.optimized_sales) - Number(salesAgg[0]?.planned_sales)) /
                                salesAgg[0]?.planned_sales) *
                              100
                            )?.toFixed(3)}
                            %
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* VARIABLE WISE */}
                <div className="aftopt-inner-panel aftopt-table-panel mb-4">
                  <div className="rr-table-banner">
                    <h5 className="rr-table-banner-title mb-0">Variable Wise Optimization</h5>
                  </div>

                  <div className="table-responsive rr-table-wrap">
                    <table className="table rr-table align-middle mb-0">
                      <colgroup>
                        <col style={{width: '40%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Variable</th>
                          <th className="text-center">Planned</th>
                          <th className="text-center">Optimized</th>
                          <th className="text-center">Change (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredplotdata1?.filter((it)=>it.planned_spends > 0 && it.optimized_spends > 0)?.map((item, idx) => {
                          return (
                            !hidingvariablelist.some((variable) => variable === item.variable) &&
                            item.variable !== "sales" &&
                            !item.variable.startsWith("Halo") &&
                            !item.variable.startsWith("HALO") &&
                            !item.variable.startsWith("halo") && (
                              <tr key={`var-${idx}`}>
                                <td>
                                  <div className="aftopt-variable-cell">
                                    <span className="aftopt-variable-name">{item?.variable}</span>
                                    <span className="rr-tag">Media</span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  {((item?.planned_spends / 100000)?.toFixed(3))?.toLocaleString("en-IN")}
                                </td>
                                <td className="text-center">
                                  {((item?.optimized_spends / 100000)?.toFixed(3))?.toLocaleString("en-IN")}
                                </td>
                                <td className="text-center">
                                  {(() => {
                                    const val = item?.percentage_difference
                                      ? item?.percentage_difference?.toFixed(1)
                                      : item.planned_spends !== 0
                                      ? ((item.optimized_spends - item.planned_spends) / item.planned_spends).toFixed(1) * 100
                                      : 0;
                                    return (
                                      <span className={`rr-delta ${Number(val) > 0 ? 'rr-delta-positive' : Number(val) < 0 ? 'rr-delta-negative' : 'rr-delta-neutral'}`}>
                                        {val}%
                                      </span>
                                    );
                                  })()}
                                </td>
                              </tr>
                            )
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CORE
                <div className="aftopt-inner-panel aftopt-table-panel mb-4">
                  <div className="rr-table-banner">
                    <h5 className="rr-table-banner-title mb-0">Core / Incremental Summary</h5>
                  </div>

                  <div className="table-responsive rr-table-wrap">
                    <table className="table rr-table align-middle mb-0">
                      <colgroup>
                        <col style={{width: '40%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Variable</th>
                          <th className="text-center">Planned</th>
                          <th className="text-center">Optimized</th>
                          <th className="text-center">Change (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {corevalue?.length > 0 ? (
                          corevalue?.map((item, idx) => {
                            return (
                              !hidingvariablelist.some((variable) => variable === item.variable) &&
                              item.variable !== "sales" && (
                                <tr key={`core-${idx}`}>
                                  <td>
                                    <div className="aftopt-variable-cell">
                                      <span className="aftopt-variable-name">{item?.core_incremental_media}</span>
                                      <span className="rr-tag rr-tag-core">Core</span>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    {((item?.planned_spends / 100000)?.toFixed(3))?.toLocaleString("en-IN")}
                                  </td>
                                  <td className="text-center">
                                    {((item?.planned_spends / 100000)?.toFixed(3))?.toLocaleString("en-IN")}
                                  </td>
                                  <td className="text-center">
                                    {item?.percentage_difference
                                      ? item?.percentage_difference?.toFixed(1)
                                      : item.planned_spends !== 0
                                      ? ((item.planned_spends - item.planned_spends) / item.planned_spends).toFixed(1) * 100
                                      : 0}
                                    %
                                  </td>
                                </tr>
                              )
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4">
                              <div className="rr-empty-panel">No core values available.</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div> */}

                {/* HALO */}
                {haloResults?.length > 0 && (
                  <div className="aftopt-inner-panel aftopt-table-panel mb-4">
                    <div className="rr-table-banner">
                      <h5 className="rr-table-banner-title mb-0">Halo Summary</h5>
                    </div>

                    <div className="table-responsive rr-table-wrap">
                      <table className="table rr-table align-middle mb-0">
                        <colgroup>
                          <col style={{width: '40%'}} />
                          <col style={{width: '20%'}} />
                          <col style={{width: '20%'}} />
                          <col style={{width: '20%'}} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Variable</th>
                            <th className="text-center">Planned</th>
                            <th className="text-center">Optimized</th>
                            <th className="text-center">Change (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[haloResults.reduce(
                            (acc, item) => {
                              acc.planned_scenario += item.planned_scenario;
                              acc.optimized_scenario += item.optimized_scenario;
                              return acc;
                            },
                            {
                              variable: "HALO",
                              fy: haloResults[0].fy,
                              variable_type: "media",
                              planned_scenario: 0,
                              optimized_scenario: 0,
                            }
                          )].map((item, idx) => (
                            <tr key={`halo-${idx}`}>
                              <td>
                                <div className="aftopt-variable-cell">
                                  <span className="aftopt-variable-name">{item?.variable}</span>
                                  <span className="rr-tag rr-tag-halo">Halo</span>
                                </div>
                              </td>
                              <td className="text-center">
                                {(item?.planned_scenario / 100000).toFixed(3).toLocaleString("en-IN")}
                              </td>
                              <td className="text-center">
                                {(item?.optimized_scenario / 100000).toFixed(3).toLocaleString("en-IN")}
                              </td>
                              <td className="text-center">
                                {item?.percentage_difference
                                  ? item?.percentage_difference?.toFixed(1)
                                  : item.planned_scenario !== 0
                                  ? (((item.optimized_scenario - item.planned_scenario) / item.planned_scenario) * 100).toFixed(1)
                                  : 0}
                                %
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* DISTRIBUTION
                {(distributionvalue?.length > 0 || distributionvaluecontri?.length > 0) && (
                  <div className="aftopt-inner-panel aftopt-table-panel">
                    <div className="rr-table-banner">
                      <h5 className="rr-table-banner-title mb-0">Distribution Summary</h5>
                    </div>

                    <div className="table-responsive rr-table-wrap">
                      <table className="table rr-table align-middle mb-0">
                        <colgroup>
                          <col style={{width: '40%'}} />
                          <col style={{width: '20%'}} />
                          <col style={{width: '20%'}} />
                          <col style={{width: '20%'}} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Variable</th>
                            <th className="text-center">Planned</th>
                            <th className="text-center">Optimized</th>
                            <th className="text-center">Change (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {distributionvalue?.length > 0 &&
                            distributionvalue?.map((item, idx) => {
                              return (
                                !hidingvariablelist.some((variable) => variable === item.variable) &&
                                item.variable !== "sales" && (
                                  <tr key={`dist-${idx}`}>
                                    <td>
                                      <div className="aftopt-variable-cell">
                                        <span className="aftopt-variable-name">{item?.variable_name}</span>
                                        <span className="rr-tag rr-tag-distribution">Distribution</span>
                                      </div>
                                    </td>
                                    <td className="text-center">
                                      {(item?.attribute_value?.toFixed(3))?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="text-center">
                                      {(item?.attribute_value?.toFixed(3))?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="text-center">
                                      {item?.percentage_difference
                                        ? item?.percentage_difference?.toFixed(1)
                                        : item.attribute_value !== 0
                                        ? (((item.attribute_value - item.attribute_value) / item.attribute_value) * 100).toFixed(1)
                                        : 0}
                                      %
                                    </td>
                                  </tr>
                                )
                              );
                            })}

                          {distributionvaluecontri?.length > 0 &&
                            distributionvaluecontri?.map((item, idx) => {
                              return (
                                !hidingvariablelist.some((variable) => variable === item.variable) &&
                                item.variable !== "sales" && (
                                  <tr key={`distc-${idx}`}>
                                    <td>
                                      <div className="aftopt-variable-cell">
                                        <span className="aftopt-variable-name">
                                          {item?.variable_name} (Kg Tonnes)
                                        </span>
                                        <span className="rr-tag rr-tag-contrib">Contribution</span>
                                      </div>
                                    </td>
                                    <td className="text-center">
                                      {((item?.planned / 1000)?.toFixed(3))?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="text-center">
                                      {((item?.optimized / 1000)?.toFixed(3))?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="text-center">
                                      {item?.percentage_difference
                                        ? item?.percentage_difference?.toFixed(1)
                                        : item.planned_spends !== 0
                                        ? (((item.optimized - item.planned) / item.planned) * 100).toFixed(1)
                                        : 0}
                                      %
                                    </td>
                                  </tr>
                                )
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )} */}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default AfterOptimizationTable