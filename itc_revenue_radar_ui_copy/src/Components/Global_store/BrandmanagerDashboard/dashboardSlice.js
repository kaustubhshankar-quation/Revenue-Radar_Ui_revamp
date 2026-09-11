import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  salesData: [],
  spendsData: [],
  mediaSalesData: [],
  regionWiseData: [],
  brandWiseMAPEData:{},
  regionWiseROI:{},
  loading: false,
  loaded: false,
  error: null
};

export const loadDashboardData = createAsyncThunk(
  "dashboard/loadDashboardData",
  async ({ brand, fy }) => {

    const baseURL = process.env.REACT_APP_UPLOAD_DATA;

    // 1️⃣ SALES
    const sales = await axios.post(
      `${baseURL}/app/sales_value`,
      { brand, fy }
    );

    // 2️⃣ SPENDS
    const spends = await axios.post(
      `${baseURL}/app/spends`,
      { brand, fy }
    );

    // 3️⃣ MEDIA SALES
    const mediaSales = await axios.post(
      `${baseURL}/app/media_channel_sales`,
      { brand, fy }
    );

    // 4️⃣ ROI
    const roi = await axios.post(
      `${baseURL}/app/media_channel_roi`,
      { brand, fy }
    );

    // 5 REGION WISE DETAIL
    const rwd = await axios.post(
      `${baseURL}/app/region_wise_detail`,
      { brand, fy }
    );
    // 6 BRAND LEVEL MAPE
    const blm = await axios.post(
      `${baseURL}/app/brand_level_mape`,
      { brand, fy }
    );
    // 7 REGION WISE ROI FOR HEAT MAP
    const rwroi = await axios.post(
      `${baseURL}/app/region_wise_media_channel_roi`,
      { brand, fy }
    );

    return {
      sales: sales.data,
      spends: spends.data,
      mediaSales: mediaSales.data,
      roi: roi.data,
      rwd:rwd.data,
      rwroi:rwroi.data,
      blm:blm.data
    };
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,

  reducers: {

    clearDashboard: (state) => {
      state.salesData = [];
      state.spendsData = [];
      state.mediaSalesData = [];
      state.mediaROIData = [];
      state.regionWiseData = [];
      state.brandWiseMAPEData={};
      state.regionWiseROI={};
      state.loaded = false;
    }

  },

  extraReducers: (builder) => {

    builder

      .addCase(loadDashboardData.pending, (state) => {
        state.loading = true;
      })

      .addCase(loadDashboardData.fulfilled, (state, action) => {

        state.loading = false;
        state.loaded = true;

        state.salesData = action.payload.sales;
        state.spendsData = action.payload.spends;
        state.mediaSalesData = action.payload.mediaSales;
        state.mediaROIData = action.payload.roi;
        state.regionWiseData = action.payload.rwd;
        state.brandWiseMAPEData=action.payload.blm;
        state.regionWiseROI=action.payload.rwroi;
      })

      .addCase(loadDashboardData.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load dashboard data";
      });

  }
});

export const { clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;