import stateReducer from "./reducer";
import dashboardReducer from "../../Components/Global_store/BrandmanagerDashboard/dashboardSlice";
import cmoDashboardReducer from "../../Components/Global_store/CMODashboard/cmoDashboardSlice";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
    app: stateReducer,
    dashboard: dashboardReducer,
    cmoDashboard: cmoDashboardReducer
});

export default rootReducer;