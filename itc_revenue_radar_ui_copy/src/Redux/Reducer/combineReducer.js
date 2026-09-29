import stateReducer from "./reducer";
import dashboardReducer from "../dashboard/dashboardSlice";
import cmoDashboardReducer from "../cmoDashboard/cmoDashboardSlice";
import sessionReducer from "../session/sessionSlice";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  app: stateReducer,
  dashboard: dashboardReducer,
  cmoDashboard: cmoDashboardReducer,
  session: sessionReducer,
});

export default rootReducer;
