import UserService from "./UserService";
import AuthService from "./AuthService";

const RenderOnAnonymous = ({ children }) => (!UserService.isLoggedIn()) ? children : null;

export default RenderOnAnonymous