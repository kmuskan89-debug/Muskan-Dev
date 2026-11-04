export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL || "https://muskan-portfolio.example.com"
).replace(/\/+$/, "");

export default SITE_URL;

