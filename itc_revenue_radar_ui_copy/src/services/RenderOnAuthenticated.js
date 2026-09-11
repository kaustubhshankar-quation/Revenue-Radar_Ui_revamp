import UserService from "../services/UserService"; import AuthService from "../services/AuthService";


const RenderOnAuthenticated = ({ children }) => {
    return (UserService.isLoggedIn()) ? children : false;
}

export default RenderOnAuthenticated