// The Figma design shows 8 curated category pills with friendly labels
// that don't match the backend's AdCategory enum names 1:1 (e.g. "Food &
// Dining" vs the real ELECTRONICS/FOOD_AND_BEVERAGES/etc. values). This is
// a deliberate, documented mapping decided while building the Home page -
// flagged for a full taxonomy reconciliation if/when a dedicated
// Categories page is built, since the backend enum has 21 values total
// and this only surfaces a subset as pills.
export const CATEGORY_PILLS = [
  { label: "All", value: null },
  { label: "Clothing & Fashion", value: "FASHION" },
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Food & Dining", value: "FOOD_AND_BEVERAGES" },
  { label: "Health & Beauty", value: "BEAUTY_AND_WELLNESS" },
  { label: "Home Services", value: "SERVICES" },
  { label: "Household Goods", value: "HOME_APPLIANCES" },
  { label: "Education", value: "EDUCATION" },
  { label: "Auto Services", value: "AUTOMOBILE" },
];

// Full 21-value enum, for contexts that need every category (e.g. the ad
// posting form) rather than the curated homepage subset.
export const ALL_CATEGORIES = [
  "ELECTRONICS", "FASHION", "FOOD_AND_BEVERAGES", "GROCERY", "HEALTHCARE",
  "BEAUTY_AND_WELLNESS", "HOME_APPLIANCES", "FURNITURE", "REAL_ESTATE",
  "AUTOMOBILE", "EDUCATION", "SPORTS_AND_FITNESS", "ENTERTAINMENT",
  "TRAVEL_AND_TOURISM", "SERVICES", "BOOKS_AND_STATIONERY", "PET_SUPPLIES",
  "TOYS_AND_GAMES", "JEWELRY", "SOFTWARE_AND_IT", "OTHER",
];
