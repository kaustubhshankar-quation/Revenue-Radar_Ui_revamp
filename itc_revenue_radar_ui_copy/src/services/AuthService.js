import { Navigate } from 'react-router-dom';

import { useNavigate } from "react-router-dom";
import Keycloak from "keycloak-js";
import { postRequest, getRequest, setCookie, getCookie, deleteCookie } from '../services/DataRequestService';

const { REACT_APP_CLIENT_SECRET } = process.env;
const { REACT_APP_CLIENTID } = process.env;
const { REACT_APP_SERVER } = process.env;

const client_secret = REACT_APP_CLIENT_SECRET
const clientID = REACT_APP_CLIENTID
const server = REACT_APP_SERVER

const login = async (credentials) => {
  let loginStatus = false;
  try {

    let requestObject = {

      url: `${server}/protocol/openid-connect/token`,
      config: {
        params: {
          "clientId": clientID
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      data: {
        "username": credentials.username,
        "password": credentials.password,
        "client_id": clientID,
        "client_secret": client_secret,
        "grant_type": "password"
      }
    }
    const responseObject = await postRequest(requestObject);

    const responseUserInfoApi = await getUserInfo(responseObject.access_token);
    console.log(responseUserInfoApi)
    if (responseObject.access_token && responseObject.refresh_token) {
      // Store tokens in cookies

      setCookie('access_token', responseObject.access_token);
      setCookie('refresh_token', responseObject.refresh_token);
      setCookie('username', responseUserInfoApi.name);

      // Redirect user after successful login
      window.location.href = '/dashboard';  // or use useNavigate() from react-router-dom
      loginStatus = true;
      return loginStatus;

    }
    else if (responseUserInfoApi.response.status === 401) {
      console.log("Please enter correct credentials!!")
      return "creds incorrect";
    }
  } catch (error) {

    console.error('Login failed', error);
    console.log('danger', 'Login failed', error);
    return loginStatus;
  }

};

const getUserInfo = async (token) => {
  let requestObject = {

    url: `${server}/protocol/openid-connect/userinfo`,
    config: {
      params: {
        "clientId": clientID
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      }
    }
  }
  const responseObject = await getRequest(requestObject);
  return responseObject;
}


//When the access token expires, use the refresh token to obtain a new access token.
const refreshaccess_token = async () => {
  const refresh_token = getCookie('refresh_token');

  if (!refresh_token) {
    logout();  // Handle user logout if no refresh token is available
    return;
  }

  try {
    const response = await fetch('YOUR_REFRESH_TOKEN_API_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await response.json();

    if (data.access_token) {
      setCookie('access_token', data.access_token);
    } else {
      logout();  // Handle user logout if refreshing token fails
    }
  } catch (error) {
    console.error('Token refresh failed', error);
    logout();
  }
};


//Create a function to check if the user is logged in by verifying the access token.
const isAuthenticated = () => {
  const access_token = getCookie('access_token');
  return !!access_token;  // Return true if access token exists
};

//Remove tokens from storage and redirect the user to the login page on logout.
const logout = () => {
  // Clear tokens    
  deleteCookie('access_token');
  deleteCookie('refresh_token');
  deleteCookie('username');
  // Redirect to login
  window.location.href = '/';  // or useNavigate() from react-router-dom
};


//Use a higher-order component (HOC) or React Router to protect certain routes.
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!getCookie('access_token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};
const parseToken = (token) => {
  if (!token) return null;

  // JWT format is "header.payload.signature"
  const base64Url = token.split('.')[1]; // Get the payload part
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Convert URL-safe Base64 to regular Base64
  const decodedPayload = atob(base64); // Decode the Base64 payload
  return JSON.parse(decodedPayload); // Parse and return as JSON
};
let _kc = parseToken(getCookie('access_token'))
console.log(_kc)

const getUsername = () => _kc?.preferred_username;
const getFullName = () => _kc?.name;
const getEmail = () => _kc?.email;
const getIndustry = () => _kc?.industry;
const getPhone = () => _kc?.phone;
const hasRole = (roles) => roles.some((role) => _kc?.realm_access?.roles.includes(role));

const AuthService = {
  login,
  logout,
  ProtectedRoute,
  isAuthenticated,
  refreshaccess_token,
  getUsername,
  getFullName,
  hasRole
}

export default AuthService;