import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import ExceptionVariables from '../JSON Files/ExceptionVariables.json';
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json';
import Select from "react-select";
import SpendsAccordian from './SpendsAccordian';
import MediaSalesAccordian from './MediaSalesAccordian';
import QuarterlySalesLineChart from './ApexLineChart';
import ApexMediaRoiChart from './ApexMediaRoiChart';
import DemoChatBox from './ChatBox';

const CFOdashboard = () => {
    const [brandoptions, setbrandoptions] = useState([]);
    const [selectedbrand, setselectedbrand] = useState('');
    const [isFYEnabled, setIsFYEnabled] = useState(false);
    const [fetchingSalesData, setFetchingSalesData] = useState(false);
    const [gotSalesData, setGotSalesData] = useState(false);
    const [gotSpendsData, setGotSpendsData] = useState(false);
    const [gotMediaSalesData, setGotMediaSalesData] = useState(false);
    const [gotMediaROIData, setGotMediaROIData] = useState(false);
    const [spendsData, setSpendsData] = useState({});
    const [mediaSalesData, setMediaSalesData] = useState({});
    const [yearlySalesData, setYealrySalesData] = useState([]);
    const [qtrSalesData, setQtrSalesData] = useState([]);
    const [yearlyMediaROIData, setYearlyMediaROIData] = useState([]);
    const [dataTillMonth, setDataTillMonth] = useState('');
    const [currentFY, setCurrentFY] = useState('');
    const [previousFY, setPreviousFY] = useState('');
    const [fetchingSpendsData, setFetchingSpendsData] = useState(false);
    const [fetchingMediaSalesData, setFetchingMediaSalesData] = useState(false);
    const [fetchingMediaROIData, setFetchingMediaROIData] = useState(false);

    const yoyChange = useMemo(() => {
        if (!yearlySalesData[0]?.previous_fy) return 0;
        return (
            ((yearlySalesData[1]?.current_fy - yearlySalesData[0]?.previous_fy) /
                yearlySalesData[0]?.previous_fy) *
            100
        ).toFixed(2);
    }, [yearlySalesData]);

    const getFinancialYears = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const startYear = month >= 4 ? year : year - 1;
        const currentFY = `${startYear}-${String(startYear + 1).slice(2)}`;
        const previousFY = `${startYear - 1}-${String(startYear).slice(2)}`;
        return [
            { label: currentFY, value: currentFY },
            { label: previousFY, value: previousFY },
        ];
    };

    const fyOptions = getFinancialYears();
    const [selectedFY, setSelectedFY] = useState('');
    const [currentFYComparison, setCurrentFYComparison] = useState(fyOptions[0].value);

    // --- Fetch Functions ---
    const fetchBrandName = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_UPLOAD_DATA}/app/get_brand_fy`);
            setbrandoptions(
                response.data.brands
                    ?.filter(it => !ExceptionVariables?.brandoptionshide?.includes(it?.brand))
                    ?.map(it => ({ value: it.brand, label: maskedBrandOption.maskedBrandOption[`${it.brand.trim().toUpperCase()}`] }))
            );
        } catch (error) {
            console.error("Error fetching brand name:", error);
        }
    };

    const handleClearFilters = () => {
        setselectedbrand('');
        setSelectedFY('');
        setIsFYEnabled(false);
        setGotSalesData(false);
        setGotSpendsData(false);
        setGotMediaSalesData(false);
        setGotMediaROIData(false);
    };

    // --- Fetch Data Functions (Sales, Spends, Media Sales, ROI) ---
    const fetchData = async (url, payload, setDataFn, setGotFn, setFetchingFn) => {
        setFetchingFn(true);
        try {
            const response = await axios.post(url, payload);
            if (response.status === 200) setDataFn(response.data);
            setGotFn(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setFetchingFn(false);
        }
    };

    const getSalesData = async () => {
        await fetchData(
            `${process.env.REACT_APP_UPLOAD_DATA}/app/sales_value`,
            { brand: selectedbrand, fy: selectedFY?.value },
            (data) => {
                setCurrentFY(data?.current_fy);
                setPreviousFY(data?.previous_fy);
                setDataTillMonth(data?.data_present_till);
                setYealrySalesData(data?.yearly?.yearly_sales);
                setQtrSalesData(data?.quarterly?.qtr_sales);
            },
            setGotSalesData,
            setFetchingSalesData
        );
    };

    const getSpendsData = async () => {
        await fetchData(
            `${process.env.REACT_APP_UPLOAD_DATA}/app/spends`,
            { brand: selectedbrand, fy: selectedFY.value },
            setSpendsData,
            setGotSpendsData,
            setFetchingSpendsData
        );
    };

    const getMediaSalesData = async () => {
        await fetchData(
            `${process.env.REACT_APP_UPLOAD_DATA}/app/media_channel_sales`,
            { brand: selectedbrand, fy: selectedFY.value },
            setMediaSalesData,
            setGotMediaSalesData,
            setFetchingMediaSalesData
        );
    };

    const getMediaROIData = async () => {
        await fetchData(
            `${process.env.REACT_APP_UPLOAD_DATA}/app/media_channel_roi`,
            { brand: selectedbrand, fy: selectedFY.value },
            (data) => setYearlyMediaROIData(data?.yearly_roi),
            setGotMediaROIData,
            setFetchingMediaROIData
        );
    };


    const fmcgNews = [
        { title: "FMCG sector sees 10% growth in Q4", link: "#" },
        { title: "New product launches boost FMCG revenues", link: "#" },
        { title: "Rising raw material costs affect FMCG margins", link: "#" },
        { title: "Digital marketing trends transforming FMCG sales", link: "#" },
        { title: "Sustainable packaging gaining momentum in FMCG", link: "#" },
    ];

    // --- Effects ---
    useEffect(() => { fetchBrandName(); }, []);
    useEffect(() => { if (selectedbrand && selectedFY) getSalesData(); }, [selectedbrand, selectedFY]);
    useEffect(() => { if (gotSalesData) getSpendsData(); }, [gotSalesData]);
    useEffect(() => { if (gotSpendsData) getMediaSalesData(); }, [gotSpendsData]);
    useEffect(() => { if (gotMediaSalesData) getMediaROIData(); }, [gotMediaSalesData]);

    // --- Render ---
    return (
        <div className="bgpages py-3">
            <div className="container-fluid">

                {/* Page Heading */}
                <div className="pageheading mb-3 px-4 py-2 rounded-2 text-white" style={{ fontSize: "22px", background: "#143d14" }}>
                    <b>Marketing Cockpit</b>
                </div>

                {/* News Ticker */}
                {gotSalesData && gotSpendsData && gotMediaSalesData && gotMediaROIData && (
                    <div className="news-ticker mb-3">
                        {fmcgNews.map((news, idx) => (
                            <span key={idx}>
                                <a href={news.link} target="_blank" rel="noreferrer">{news.title}</a>
                            </span>
                        ))}
                    </div>
                )}

                {/* Filters Card */}
                <div className="card p-4 shadow-sm rounded-3 mb-3">
                    {gotSalesData ? (
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="fw-semibold text-muted">Active Filters:</span>
                            <span className="badge rounded-pill bg-primary bg-opacity-10 text-white px-3 py-2">
                                Brand: <strong>{maskedBrandOption.maskedBrandOption[selectedbrand]}</strong>
                            </span>
                            <span className="badge rounded-pill bg-success bg-opacity-10 text-white px-3 py-2">
                                FY: <strong>{selectedFY?.value}</strong>
                            </span>
                            <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={handleClearFilters}>
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="row g-3">
                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <label className="fw-semibold mb-1">Brand <span className="text-danger">*</span></label>
                                <Select
                                    className="w-100"
                                    placeholder="Select Brand"
                                    options={brandoptions}
                                    value={brandoptions.find(b => b.value === selectedbrand) || null}
                                    onChange={(value) => setselectedbrand(value.value)}
                                    isDisabled={fetchingSalesData || fetchingSpendsData || fetchingMediaSalesData}
                                />
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12">
                                <label className="fw-semibold mb-1">Financial Year</label>
                                <Select
                                    className="w-100"
                                    placeholder='Select FY'
                                    options={fyOptions}
                                    value={selectedFY}
                                    onChange={(value) => setSelectedFY(value)}
                                    isDisabled={!selectedbrand || fetchingSalesData || fetchingSpendsData || fetchingMediaSalesData}
                                />
                            </div>
                        </div>
                    )}
                </div>



                {/* Loader */}
                {(fetchingSalesData || fetchingSpendsData || fetchingMediaSalesData || fetchingMediaROIData) && (
                    <div className="card py-3 mb-3">
                        <div className="d-flex flex-column align-items-center justify-content-center my-3">
                            <div className="dot-loader"><div></div><div></div><div></div></div>
                            <div className="mt-2 fw-semibold text-muted">Loading data for {maskedBrandOption.maskedBrandOption[selectedbrand]}...</div>
                        </div>
                    </div>
                )}

                {/* Sales Accordion */}
                {gotSalesData && (
                    <div className="accordion mb-3" id="salesAccordion">
                        <div className="accordion-item shadow-sm rounded-3 border-0">
                            <h2 className="accordion-header" id="headingSales">
                                <button className="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSales" aria-expanded="false" aria-controls="collapseSales">
                                    📊 Sales Performance in Crore
                                </button>
                            </h2>
                            <div id="collapseSales" className="accordion-collapse collapse" aria-labelledby="headingSales" data-bs-parent="#salesAccordion">
                                <div className="accordion-body p-3">

                                    {/* KPIs */}
                                    <div className="row text-center mb-4 g-3">
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded">
                                                <small className="text-muted">Previous FY</small>
                                                <h6 className="fw-bold mt-1">₹ {(yearlySalesData[0]?.previous_fy / 10000000)?.toLocaleString()}</h6>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-light rounded">
                                                <small className="text-muted">Current FY</small>
                                                <h6 className="fw-bold mt-1">₹ {(yearlySalesData[1]?.current_fy / 10000000)?.toLocaleString()}</h6>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className={`p-3 rounded ${yoyChange < 0 ? "bg-danger-subtle" : "bg-success-subtle"}`}>
                                                <small className="text-muted">YoY Change</small>
                                                <h6 className={`fw-bold mt-1 ${yoyChange < 0 ? "text-danger" : "text-success"}`}>
                                                    {yoyChange}% {yoyChange < 0 ? "↓" : "↑"}
                                                </h6>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    <QuarterlySalesLineChart
                                        quarterlyData={qtrSalesData || []}
                                        previousFY={previousFY}
                                        currentFY={currentFY}
                                        tilldate={dataTillMonth}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Media Insights Accordion */}
                {(gotSpendsData && gotMediaSalesData) && (
                    <div className="accordion mb-3" id="mediaInsightsAccordion">
                        <div className="accordion-item shadow-sm rounded-3 border-0">
                            <h2 className="accordion-header" id="headingMediaSalesVSpends">
                                <button className="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBrandInsights" aria-expanded="false" aria-controls="collapseBrandInsights">
                                    📊 Media Spends Vs Contribution in Crores
                                </button>
                            </h2>
                            <div id="collapseBrandInsights" className="accordion-collapse collapse" aria-labelledby="headingMediaSalesVSpends" data-bs-parent="#mediaInsightsAccordion">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <SpendsAccordian data={spendsData} till={dataTillMonth} compare={currentFYComparison} />
                                        </div>
                                        <div className="col-md-6">
                                            <MediaSalesAccordian data={mediaSalesData} till={dataTillMonth} compare={currentFYComparison} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Media ROI */}
                {gotMediaROIData && (
                    <div className="mb-3">
                        <ApexMediaRoiChart
                            yearly_roi={yearlyMediaROIData}
                            previous_fy={previousFY}
                            current_fy={currentFY}
                        />
                    </div>
                )}

                <DemoChatBox/>
            </div>
        </div>
    );
};

export default CFOdashboard;