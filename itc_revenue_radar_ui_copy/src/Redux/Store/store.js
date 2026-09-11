import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../Reducer/combineReducer";

const store = configureStore({
  reducer: rootReducer
});

export default store;
