import React from "react";
import FooterPages from "../Footer/FooterPages";
import Navbar3 from "../Navbars/Navbar3";
import SubNavbar from "../Navbars/SubNavbar";

function Support() {
  return (
    <>
      <Navbar3 />
      <SubNavbar />
      <div className="bgpages">
        <div className=" container py-2">
          <div className="rr-card rr-card-header">
            <div className="rr-page-header-left">
              <div className="rr-breadcrumb">Dashboard / Support</div>
              <h2 className="rr-page-title">Support</h2>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="rr-card rr-card-section p-3">
            You may call us at +91-80-49568423 or mail us at Contactus@quation.in
          </div>
        </div>
      </div>
      <FooterPages />
    </>
  );
}

export default Support;
