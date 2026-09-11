import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar3 from "../Navbars/Navbar3";
import FooterPages from "../Footer/FooterPages";

function DashboardLayout({ theme = "light", toggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    return () => document.body.classList.remove("light-theme", "dark-theme");
  }, [theme]);

  return (
    <div className={`rr-app-shell ${theme}-theme`}>
      <Navbar3
        theme={theme}
        toggleTheme={toggleTheme}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className="rr-app-main"
        data-collapsed={collapsed ? "true" : "false"}
      >
        <main className="rr-app-content">
          <Outlet context={{ theme, collapsed }} />
        </main>

        <footer className="rr-app-footer">
          <FooterPages />
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;
