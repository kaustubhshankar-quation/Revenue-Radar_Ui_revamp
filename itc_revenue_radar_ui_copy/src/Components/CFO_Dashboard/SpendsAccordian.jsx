import React, { useMemo, useState } from 'react'
import ReusablePieChart from './CompariosnChart';
import CampaignSalesChart from './ApexMeidaLineChart';

const SpendsAccordian = ({ data, till, compare }) => {
    const [viewType, setViewType] = useState("yearly");
    const [showDetails, setShowDetails] = useState(false)
    const [medidGroupType, setMediaGroupType] = useState('')
    const currentFY = data?.current_fy;
    const previousFY = data?.previous_fy;
    const yearly_spend_media_wise = data?.yearly_spends_media_wise
    const totals = yearly_spend_media_wise.reduce((acc, item) => {
        acc.totalPreviousFY += item.previous_fy || 0;
        acc.totalCurrentFY += item.current_fy || 0;
        return acc;
    }, {
        totalPreviousFY: 0,
        totalCurrentFY: 0,
    }
    )
    const yoyChange = useMemo(() => {
        if (!totals) return 0;
        return (
            ((totals.totalCurrentFY - totals.totalPreviousFY) /
                totals.totalPreviousFY) *
            100
        ).toFixed(2);
    }, [yearly_spend_media_wise]);

    const tableData =
        viewType === "quarterly"
            ? data?.qtr_spends_media_wise
            : yearly_spend_media_wise.map((it) => ({
                quarter: "FY Total",
                media_group: it?.media_group,
                previous_fy: it?.previous_fy,
                current_fy: it?.current_fy,
                change_percent:
                    it?.previous_fy
                        ? (((it.current_fy - it.previous_fy) / it.previous_fy) * 100).toFixed(2)
                        : 0,
            }));

    const pieData = yearly_spend_media_wise.map((row) => ({
        name: row.media_group,
        value: Number(((row.current_fy || 0) / 10000000).toFixed(3)),
    }));

    return (
        <>
            {data && (
                <>
                    {showDetails && (
                        <>
                            <div
                                className="modal show"
                                style={{ display: "block" }}
                                tabIndex="-1"
                            >
                                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                                    <div className="modal-content border-0 shadow">

                                        {/* Header */}
                                        <div className="modal-header bg-light">
                                            <h5 className="modal-title fw-semibold">
                                                {medidGroupType} - Spend Details
                                            </h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setShowDetails(false)}
                                            ></button>
                                        </div>

                                        {/* Body */}
                                        <div className="modal-body">
                                            <div className="table-responsive">
                                                <table className="table table-sm align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Attribute Name</th>
                                                            <th className="text-end">
                                                                Previous FY ({previousFY})
                                                            </th>
                                                            <th className="text-end">
                                                                Current FY (
                                                                {compare.toLocaleString() === currentFY.toLocaleString()
                                                                    ? till
                                                                    : currentFY}
                                                                )
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(() => {
                                                            const filteredData =
                                                                data?.yearly_spends_var_wise?.filter(
                                                                    (row) =>
                                                                        row.media_group === medidGroupType &&
                                                                        (row.previous_fy !== 0 ||
                                                                            row.current_fy !== 0)
                                                                ) || [];

                                                            const totals = filteredData.reduce(
                                                                (acc, row) => {
                                                                    acc.previous += row.previous_fy || 0;
                                                                    acc.current += row.current_fy || 0;
                                                                    return acc;
                                                                },
                                                                { previous: 0, current: 0 }
                                                            );

                                                            return (
                                                                <>
                                                                    {filteredData.map((row, index) => (
                                                                        <tr key={index}>
                                                                            <td>{row.attribute_name}</td>
                                                                            <td className="text-end">
                                                                                ₹ {(row.previous_fy / 10000000)?.toLocaleString()}
                                                                            </td>
                                                                            <td className="text-end">
                                                                                ₹ {(row.current_fy / 10000000)?.toLocaleString()}
                                                                            </td>
                                                                        </tr>
                                                                    ))}

                                                                    <tr className="fw-bold border-top">
                                                                        <td>Grand Total</td>
                                                                        <td className="text-end">
                                                                            ₹ {(totals.previous / 10000000)?.toLocaleString()}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            ₹ {(totals.current / 10000000)?.toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            );
                                                        })()}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setShowDetails(false)}
                                            >
                                                Close
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div
                                className="modal-backdrop fade show"
                                onClick={() => setShowDetails(false)}
                            ></div>
                        </>
                    )}

                    {/* 🔥 Replaced Accordion with Normal Div */}
                    <div className="mt-3 px-2 shadow-sm rounded bg-white">

                        {/* Header Title */}
                        <h5 className="fw-semibold mb-4">
                            Media Spends:
                        </h5>

                        {/* <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="text-muted fw-semibold">
                                Previous FY :
                                <span className="ms-2 text-dark fw-bold">{previousFY}</span>
                            </div>

                            <div className="text-muted fw-semibold">
                                Current FY :
                                <span className="ms-2 text-dark fw-bold">
                                    {compare.toLocaleString() === currentFY.toLocaleString()
                                        ? till
                                        : currentFY}
                                </span>
                            </div>
                        </div> */}

                        {/* Summary Cards */}
                        <div className="row text-center mb-4">
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted">Previous FY</small>
                                    <h6 className="fw-bold mt-1">
                                        ₹ {(totals.totalPreviousFY / 10000000)?.toLocaleString()}
                                    </h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted">Current FY</small>
                                    <h6 className="fw-bold mt-1">
                                        ₹ {(totals.totalCurrentFY / 10000000)?.toLocaleString()}
                                    </h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div
                                    className={`p-3 rounded ${yoyChange < 0
                                        ? "bg-danger-subtle"
                                        : "bg-success-subtle"
                                        }`}
                                >
                                    <small className="text-muted">YoY Change</small>
                                    <h6
                                        className={`fw-bold mt-1 ${yoyChange < 0
                                            ? "text-danger"
                                            : "text-success"
                                            }`}
                                    >
                                        {yoyChange}% {yoyChange < 0 ? "↓" : "↑"}
                                    </h6>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <CampaignSalesChart
                            tilldate={till}
                            heading="Media Channel Wise"
                            campaignData={data?.qtr_spends_var_wise} // same as you had in your table
                            previousFY={previousFY}
                            currentFY={currentFY}
                        />

                        {/* Pie Chart */}
                        {/* <ReusablePieChart
                            title="Current FY Media Spends"
                            data={pieData}
                            nameKey="name"
                            valueKey="value"
                        /> */}
                    </div>
                </>
            )}
        </>
    )
}

export default SpendsAccordian