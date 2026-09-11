import React, { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import UserService from "../../services/UserService.js";

import getNotification from "../../Redux/Action/action.js";
import { useDispatch } from "react-redux";
import AuthService from "../../services/AuthService.js";

const { REACT_APP_REDIRECT_URI } = process.env;
const { REACT_APP_UPLOAD_DATA } = process.env;

function SubNavbar() {
  const dispatch = useDispatch();
  const [logindata, setlogindata] = useState({})
  const location = useLocation()
  const [showmanalysistypes, setshowmanalysistypes] = useState(false)
  const [showbanalysistypes, setshowbanalysistypes] = useState(false)
  const [showsimulatortypes, setshowsimulatortypes] = useState(false)
  const [showoptimizertypes, setshowoptimizertypes] = useState(false)
  const [showsavedscenariostypes, setshowsavedscenariostypes] = useState(false)
  return (
    <>
      {null}
    </>
  );
}

export default SubNavbar;
