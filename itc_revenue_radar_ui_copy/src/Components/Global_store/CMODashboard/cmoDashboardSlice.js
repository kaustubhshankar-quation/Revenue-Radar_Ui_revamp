import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    salesData: [],
    spendsData: [],
    mediaSalesData: [],
    //   regionWiseData: [],
    //   brandWiseMAPEData:{},
    loading: false,
    loaded: false,
    //   error: null
};

export const loadCMODashboardData = createAsyncThunk(
    "cmoDashboard/loadCMODashboardData",
    async ({ fy }) => {

        const baseURL = process.env.REACT_APP_UPLOAD_DATA;

        // 1️⃣ SALES
        const sales = await axios.get(
            `${baseURL}/app/cmo/sales_value`,
            {
                params: {
                    fy
                }
            }
        );

        // 2️⃣ SPENDS
        const spends = await axios.get(
            `${baseURL}/app/cmo/spends`,
            {
                params: {
                    fy
                }
            }
        );

        // 3️⃣ MEDIA SALES
        const mediaSales = await axios.get(
            `${baseURL}/app/cmo/media_contribution`,
            {
                params: {
                    fy
                }
            }
        );

        // // 4️⃣ ROI
        // const roi = await axios.post(
        //   `${baseURL}/app/media_channel_roi`,
        //   { brand, fy }
        // );

        // // 5 REGION WISE DETAIL
        // const rwd = await axios.post(
        //   `${baseURL}/app/region_wise_detail`,
        //   { brand, fy }
        // );
        // // 6 BRAND LEVEL MAPE
        // const blm = await axios.post(
        //   `${baseURL}/app/brand_level_mape`,
        //   { brand, fy }
        // );

        return {
            sales: sales.data,
            spends: spends.data,
            mediaSales: mediaSales.data,
            //   roi: roi.data,
            //   rwd:rwd.data,
            //   blm:blm.data
        };
    }
);

const cmoDashboardSlice = createSlice({
    name: "cmoDashboard",
    initialState,
    reducers: {

        clearCMODashboard: (state) => {
            state.salesData = [];
            state.spendsData = [];
            state.mediaSalesData = [];
            //   state.mediaROIData = [];
            //   state.regionWiseData = [];
            //   state.brandWiseMAPEData={};
            state.loaded = false;
        }

    },

    extraReducers: (builder) => {

        builder

            .addCase(loadCMODashboardData.pending, (state) => {
                state.loading = true;
            })

            .addCase(loadCMODashboardData.fulfilled, (state, action) => {

                state.loading = false;
                state.loaded = true;

                state.salesData = action.payload.sales;
                state.spendsData = action.payload.spends;
                state.mediaSalesData = action.payload.mediaSales;
                // state.mediaROIData = action.payload.roi;
                // state.regionWiseData = action.payload.rwd;
                // state.brandWiseMAPEData=action.payload.blm;
            })

            .addCase(loadCMODashboardData.rejected, (state) => {
                state.loading = false;
                state.error = "Failed to load dashboard data";
            });

    }
});

export const { clearCMODashboard } = cmoDashboardSlice.actions;

export default cmoDashboardSlice.reducer;