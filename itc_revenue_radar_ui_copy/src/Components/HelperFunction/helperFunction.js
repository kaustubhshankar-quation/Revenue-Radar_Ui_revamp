import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import maskedBrandOption from '../JSON Files/MaskedBrandOption.json'
import getNotification from "../../Redux/Action/action";
import UserService from "../../services/UserService";

const { REACT_APP_UPLOAD_DATA } = process.env;
const { REACT_APP_REDIRECT_URI } = process.env;

/** Shared JSON headers used by most tool-page axios configs */
export const defaultJsonHeaders = {
  Accept: "text/plain",
  "Content-Type": "application/json",
};

/**
 * Maps HTTP / axios failures to the same toast notifications used across tool pages.
 * Behavior matches the previous inline status switches (500/400/422/404/401/default).
 */
export function notifyRequestError(dispatch, err) {
  const status = err?.response?.status;
  const messageByStatus = {
    500: "Server is Down! Please try again after sometime",
    400: "Input is not in prescribed format",
    422: "Input is not in prescribed format",
    404: "Page not Found",
    401: "Session expired! Please log in again",
  };
  const message =
    messageByStatus[status] ||
    "Server is Down! Please try again after sometime";

  dispatch(
    getNotification({
      message,
      type: "default",
    })
  );
}

/**
 * Keycloak login redirect used when a tool action runs while logged out.
 * @param {string} pathSuffix e.g. "/simulator" or "simulator"
 */
export function requireLogin(pathSuffix = "") {
  const path = !pathSuffix
    ? ""
    : pathSuffix.startsWith("/")
      ? pathSuffix
      : `/${pathSuffix}`;

  setTimeout(() => {
    UserService.doLogin({
      redirectUri: `${REACT_APP_REDIRECT_URI}${path}`,
    });
  }, 1000);
}

/**
 * Build react-select options from a list.
 * @param {Array} list
 * @param {string|Function} [getLabel] property name or mapper (default: item itself)
 * @param {string|Function} [getValue] property name or mapper (default: same as label)
 */
export function toSelectOptions(list, getLabel, getValue) {
  if (!Array.isArray(list)) return [];

  const resolve = (mapper, item) => {
    if (mapper == null) return item;
    if (typeof mapper === "string") return item?.[mapper];
    return mapper(item);
  };

  const valueMapper = getValue == null ? getLabel : getValue;

  return list.map((item) => ({
    label: resolve(getLabel, item),
    value: resolve(valueMapper, item),
  }));
}

/** Format a number as Indian Cr currency label (cockpit KPI cards). */
export function formatCr(value, { scaleToCr = true } = {}) {
  if (value === null || value === undefined || isNaN(value)) return "₹ 0 Cr";
  const n = scaleToCr ? Number(value) / 10000000 : Number(value);
  return `₹ ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} Cr`;
}

/** Bootstrap text class for YoY / growth values. */
export function getGrowthClass(value) {
  if (Number(value) > 0) return "text-success";
  if (Number(value) < 0) return "text-danger";
  return "text-secondary";
}

/** Previous/current FY labels with optional data-till month suffix. */
export function buildFyTillLabels(previousFY, currentFY, tilldate) {
  if (!tilldate) {
    return {
      previousTillLabel: previousFY,
      currentTillLabel: currentFY,
    };
  }

  const [year, month] = tilldate.split("-");
  return {
    previousTillLabel: `${previousFY} (${year}-${String(Number(month) - 1).padStart(2, "0")})`,
    currentTillLabel: `${currentFY} (${tilldate})`,
  };
}

/** Role → brand payload used by cockpit dashboardSlice.loadDashboardData. */
export function resolveDashboardBrandPayload(fy = "2025-26") {
  if (UserService.hasRole(["BBMNGR"])) {
    return { brand: "BAD BANGLES", fy };
  }
  if (UserService.hasRole(["OODMNGR"]) || UserService.hasRole(["SALES"])) {
    return { brand: "OODLES", fy };
  }
  if (UserService.hasRole(["CBMNGR"])) {
    return { brand: "CHERRY BRIGHT", fy };
  }
  return { brand: "MILD URGENCY", fy };
}

/**
 * Shared brand allow-list by role (tool pages + sessionSlice).
 * Expects brand objects with a `brand` field (get_brand_fy shape).
 * @param {Array<{brand: string}>} brands
 * @param {string[]} [hideList] brands to exclude (e.g. ExceptionVariables.brandoptionshide)
 */
export function filterBrandsByRole(brands = [], hideList = []) {
  const filtered = brands
    ?.filter((it) => !hideList?.includes(it?.brand))
    ?.sort((a, b) => a.brand.localeCompare(b.brand));

  if (UserService.hasRole(["BBMNGR"])) {
    return filtered?.filter((it) => it?.brand === "BAD BANGLES");
  }
  if (UserService.hasRole(["OODMNGR"]) || UserService.hasRole(["SALES"])) {
    return filtered?.filter((it) => it?.brand === "OODLES");
  }
  if (UserService.hasRole(["MUMNGR"])) {
    return filtered?.filter((it) => it?.brand === "MILD URGENCY");
  }
  if (UserService.hasRole(["CBMNGR"])) {
    return filtered?.filter((it) => it?.brand === "CHERRY BRIGHT");
  }
  return filtered;
}

/** Plot range label: "04-2025" → "Apr 2025" (Simulator / Optimizer / Saved Scenarios). */
export function formatPlotMonthYear(dateString) {
  if (!dateString) return "";
  const [month, year] = dateString.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

/** Timestamp used when saving/updating scenarios. */
export function getCurrentFormattedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** Brand abbreviation map for scenario naming. */
export const BRAND_ABB_DICT = {
  "YIPPEE NOODLES": "ND",
  "BINGO OS": "OS",
  "BINGO PC": "PC",
  "TEDHE MEDHE": "TN",
  "MARIE LIGHT": "ML",
  "DARK FANTASY": "DF",
  "MOMS MAGIC": "MM",
  "MAD ANGLES": "MA",
  BOUNCE: "BOUNCE",
  OODLES: "OOD",
  "BAD BANGLES": "BB",
};

export function getBrandAbb(brand) {
  return BRAND_ABB_DICT[brand] || brand;
}

/** Scenario name character validation (letters, numbers, space, underscore). */
export function isValidScenarioName(str) {
  return /^[A-Za-z0-9_ ]+$/.test(String(str || ""));
}

export const uploadPDF = async (input,filename,selectedBrand, reportType, setLoading, setDownloadUrl) => {
    try {
        setLoading(true); // disable button & show loader

        const canvas = await html2canvas(input, { scale: 3, useCORS: true, scrollY: -window.scrollY });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        // Convert to Blob for upload
        const pdfBlob = pdf.output("blob");

        // const now = new Date();
        // const formattedDateTime = `${String(now.getDate()).padStart(2, "0")}-${String(
        //     now.getMonth() + 1
        // ).padStart(2, "0")}-${now.getFullYear()}_${String(now.getHours()).padStart(
        //     2,
        //     "0"
        // )}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;

        const pdfName = `${filename}.pdf`;

        // Upload to backend
        const formData = new FormData();
        formData.append("file", pdfBlob, pdfName);
        formData.append("report_type", reportType);
        formData.append("brand", maskedBrandOption.maskedBrandOption[selectedBrand]);
        formData.append("blob_name", pdfName);

        const response = await fetch(`${REACT_APP_UPLOAD_DATA}/app/uploadReport`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            setDownloadUrl(data.pdf_name); // show “Download PDF” button
        } else {
            alert("Failed to upload report");
        }
    } catch (error) {
        console.error("Error generating/uploading PDF:", error);
    } finally {
        setLoading(false);
    }
};

export const downloadPdf = async (job_id, close) => {
    try {
        const url = `${REACT_APP_UPLOAD_DATA}/app/downloadReport?job_id=${encodeURIComponent(job_id)}`;

        // Create a temporary <a> tag to trigger browser download directly
        const a = document.createElement("a");
        a.href = url;
        a.download = job_id.split("/").pop(); // only filename
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Optionally, you can add a small delay to ensure loader is visible
        await new Promise((res) => setTimeout(res, 500));

    } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download PDF");
    } finally {
        close();
    }
};
