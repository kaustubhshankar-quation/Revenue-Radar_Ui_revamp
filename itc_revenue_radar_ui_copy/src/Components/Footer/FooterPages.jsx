import React from "react";
import copyimg from "../../Assets/Images/copyimg.webp";
// import copyimg from "../../Assets/Images/ftr.png";

function FooterPages() {
  return (
    <>
      <footer className="footer-modern">
        <div className="footer-inner container-fluid">
          <div className="row align-items-center g-3">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="footer-brand-wrap">
                <div className="footer-logo-box">
                  <img
                    src={copyimg}
                    alt="Revenue Radar"
                    className="footer-logo"
                  />
                </div>

                <div className="footer-brand-text">
                  <h6 className="footer-title mb-1">Revenue Radar</h6>
                  <small className="footer-copy">
                    © 2023 Quation Solutions Pvt. Ltd. All rights reserved.
                  </small>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6 col-12">
              <div className="footer-actions">
                <a
                  href="#top"
                  className="social-btn scroll-top"
                  aria-label="Scroll to top"
                >
                  <i className="fas fa-arrow-up"></i>
                </a>
              </div>
            </div>

          </div>

        </div>
      </footer>
    </>
  );
}

export default FooterPages;