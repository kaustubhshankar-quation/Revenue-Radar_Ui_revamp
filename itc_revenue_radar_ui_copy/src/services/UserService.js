import Keycloak from "keycloak-js";

const _kc = new Keycloak('/keycloak.json');

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback) => {
  document.getElementById("root").innerHTML = `
    <div class="rr-keycloak-auth" style="
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      background:
        radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 25%),
        linear-gradient(135deg, #0f172a 0%, #111827 45%, #14532d 100%);
      font-family: 'Inter', 'Segoe UI', sans-serif;
      position:relative;
      overflow:hidden;
    ">
      
      <div style="
        width:100%;
        max-width:460px;
        text-align:center;
        padding:40px 32px;
        border-radius:24px;
        background:rgba(255,255,255,0.08);
        backdrop-filter:blur(16px);
        -webkit-backdrop-filter:blur(16px);
        border:1px solid rgba(255,255,255,0.14);
        box-shadow:0 20px 60px rgba(0,0,0,0.25);
        position:relative;
        z-index:2;
      ">
        
        <div style="
          position:relative;
          width:96px;
          height:96px;
          margin:0 auto 24px;
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <div style="
            position:absolute;
            inset:0;
            border-radius:50%;
            background:radial-gradient(circle, rgba(132,204,22,0.35), rgba(34,197,94,0.08), transparent 70%);
            animation: loaderPulse 1.8s ease-in-out infinite;
          "></div>

          <div class="spinner-border text-light" style="
            width:3.5rem;
            height:3.5rem;
            border-width:0.35em;
            position:relative;
            z-index:2;
          " role="status"></div>
        </div>

        <h3 style="
          font-weight:700;
          letter-spacing:0.3px;
          color:#ffffff;
          margin:0 0 10px 0;
          font-size:1.5rem;
        ">
          Getting Things Ready For You...
        </h3>

        <p style="
          font-size:0.95rem;
          opacity:0.8;
          margin:0 0 24px 0;
          color:rgba(255,255,255,0.78);
          line-height:1.6;
        ">
          Please wait a moment while we prepare your dashboard experience ✨
        </p>

        <div style="
          width:100%;
          height:8px;
          background:rgba(255,255,255,0.12);
          border-radius:999px;
          overflow:hidden;
        ">
          <div style="
            height:100%;
            width:35%;
            border-radius:999px;
            background:linear-gradient(90deg, #84cc16, #22c55e, #4ade80);
            animation: loadingSlide 1.6s ease-in-out infinite;
          "></div>
        </div>
      </div>

      <style>
        @keyframes loaderPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        @keyframes loadingSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(180%);
          }
          100% {
            transform: translateX(320%);
          }
        }
      </style>
    </div>
  `;

_kc.init({
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256',
})
  .then((authenticated) => {
    if (!authenticated) {
      console.log("user is not authenticated..!");
      sessionStorage.removeItem("error")
    }
    onAuthenticatedCallback(); //render
  })
  .catch(error => {
    onAuthenticatedCallback() //app2
    sessionStorage.setItem("error", "Server Down")
    console.log(error)
  })
};

const doLogin = _kc.login;
const doSignUp = _kc.register;
const doCreateAccount = _kc.createAccount;

const doLogout = _kc.logout;

const getToken = () => _kc.token;
const getSessionId = () => _kc.sessionId;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback) =>
  _kc.updateToken(5)
    .then(successCallback)
    .catch(doLogin);

const getUsername = () => _kc.tokenParsed?.preferred_username;
const getFullName = () => _kc.tokenParsed?.name;
const getEmail = () => _kc.tokenParsed?.email;

const hasRole = (roles) => roles.some((role) => _kc.hasRealmRole(role));

const getAccountUrl = () => _kc.createAccountUrl();
const getUpdatePassword = () => _kc.updatePasswordUrl();



const UserService = {
  initKeycloak,
  doLogin,
  doSignUp,
  doLogout,
  doCreateAccount,
  isLoggedIn,
  getToken,
  updateToken,
  getUsername,
  hasRole,
  getFullName,
  getEmail,
  getSessionId,
  getAccountUrl,
  getUpdatePassword
};

export default UserService;
