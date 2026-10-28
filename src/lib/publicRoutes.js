// Public website sections ↔ URLs (single source of truth for MainWebsite
// and the router in App.jsx). Every section has its own URL so it can be
// shared, refreshed, reached with the back button, and indexed by Google.
// The visa flow steps (visa-result / visa-apply / visa-track) are transient
// in-page states and keep the current URL, so they are not listed here.
export const PAGE_PATHS = {
  home:                "/",
  "visa-center":       "/visa-center",
  residency:           "/residency",
  "company-formation": "/company-formation",
  knowledge:           "/knowledge-center",
  travel:              "/travel",
  about:               "/about",
  booking:             "/booking",
  academy:             "/academy",
  advertising:         "/advertising",
  student:             "/student",
};

export const PATH_PAGES = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page])
);

export const PUBLIC_PATHS = Object.values(PAGE_PATHS);
