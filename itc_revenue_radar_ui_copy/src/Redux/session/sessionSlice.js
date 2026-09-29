import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import ExceptionVariables from "../../Components/JSON Files/ExceptionVariables.json";
import {
  defaultJsonHeaders,
  filterBrandsByRole,
} from "../../Components/HelperFunction/helperFunction";

const initialState = {
  fyOptions: [],
  brandOptions: [],
  marketsByBrand: {},
  selectedFy: "",
  selectedBrand: "",
  selectedMarket: "",
  brandFyLoaded: false,
  brandFyLoading: false,
  marketsLoading: false,
  error: null,
};

export const loadBrandFy = createAsyncThunk(
  "session/loadBrandFy",
  async (_, { getState, rejectWithValue }) => {
    const { brandFyLoaded, fyOptions, brandOptions } = getState().session || {};
    if (brandFyLoaded) {
      return { fy: fyOptions, brands: brandOptions, fromCache: true };
    }

    try {
      const baseURL = process.env.REACT_APP_UPLOAD_DATA;
      const response = await axios.get(`${baseURL}/app/get_brand_fy`, {
        headers: { ...defaultJsonHeaders },
      });

      if (response.data === "Invalid User!") {
        return rejectWithValue({ message: "Invalid User!" });
      }

      const fy = response.data?.fy || [];
      const brands = filterBrandsByRole(
        response.data?.brands || [],
        ExceptionVariables?.brandoptionshide
      );

      return { fy, brands, fromCache: false };
    } catch (err) {
      return rejectWithValue({
        message: err?.message || "Failed to load brand/FY options",
        response: err?.response
          ? { status: err.response.status }
          : undefined,
      });
    }
  }
);

export const loadMarkets = createAsyncThunk(
  "session/loadMarkets",
  async (brand, { getState, rejectWithValue }) => {
    if (!brand || brand === "Select") {
      return { brand: brand || "", markets: [], fromCache: true };
    }

    const cached = getState().session?.marketsByBrand?.[brand];
    if (cached) {
      return { brand, markets: cached, fromCache: true };
    }

    try {
      const baseURL = process.env.REACT_APP_UPLOAD_DATA;
      const FormData = require("form-data");
      const sendData = new FormData();
      sendData.append("brand", brand);

      const response = await axios.post(
        `${baseURL}/app/get_markets`,
        sendData,
        { headers: { ...defaultJsonHeaders } }
      );

      if (response.data === "Invalid User!") {
        return rejectWithValue({ message: "Invalid User!" });
      }

      return {
        brand,
        markets: response.data?.markets || [],
        fromCache: false,
      };
    } catch (err) {
      return rejectWithValue({
        message: err?.message || "Failed to load markets",
        response: err?.response
          ? { status: err.response.status }
          : undefined,
      });
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSelectedFy(state, action) {
      state.selectedFy = action.payload || "";
    },
    setSelectedBrand(state, action) {
      state.selectedBrand = action.payload || "";
      state.selectedMarket = "";
    },
    setSelectedMarket(state, action) {
      state.selectedMarket = action.payload || "";
    },
    setSessionFilters(state, action) {
      const { selectedFy, selectedBrand, selectedMarket } = action.payload || {};
      if (selectedFy !== undefined) state.selectedFy = selectedFy || "";
      if (selectedBrand !== undefined) {
        state.selectedBrand = selectedBrand || "";
        if (selectedMarket === undefined) state.selectedMarket = "";
      }
      if (selectedMarket !== undefined) {
        state.selectedMarket = selectedMarket || "";
      }
    },
    clearSessionFilters(state) {
      state.selectedFy = "";
      state.selectedBrand = "";
      state.selectedMarket = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBrandFy.pending, (state) => {
        state.brandFyLoading = true;
        state.error = null;
      })
      .addCase(loadBrandFy.fulfilled, (state, action) => {
        state.brandFyLoading = false;
        state.brandFyLoaded = true;
        if (!action.payload.fromCache) {
          state.fyOptions = action.payload.fy;
          state.brandOptions = action.payload.brands;
        }
      })
      .addCase(loadBrandFy.rejected, (state, action) => {
        state.brandFyLoading = false;
        state.error =
          action.payload?.message || "Failed to load brand/FY options";
      })
      .addCase(loadMarkets.pending, (state) => {
        state.marketsLoading = true;
        state.error = null;
      })
      .addCase(loadMarkets.fulfilled, (state, action) => {
        state.marketsLoading = false;
        const { brand, markets, fromCache } = action.payload;
        if (brand && !fromCache) {
          state.marketsByBrand[brand] = markets;
        }
      })
      .addCase(loadMarkets.rejected, (state, action) => {
        state.marketsLoading = false;
        state.error = action.payload?.message || "Failed to load markets";
      });
  },
});

export const {
  setSelectedFy,
  setSelectedBrand,
  setSelectedMarket,
  setSessionFilters,
  clearSessionFilters,
} = sessionSlice.actions;

export default sessionSlice.reducer;
