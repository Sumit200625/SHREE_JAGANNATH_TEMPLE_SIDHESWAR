// Single source of truth for prices & categories (used by BOTH the website and the server).
// The server never trusts an amount sent by the browser for a seva - it looks the price up here.

export const SEVAS = [
  { name: "Annadan Seva (Mahaprasad)", price: 1100, desc: "Feed visiting pilgrims and saints. Earthen kudua pot mahaprasad meals." },
  { name: "Pushpalankara & Puja Seva", price: 501, desc: "Sponsor flower garlands (tulasi, marigold) for deity decoration." },
  { name: "Daily Morning Balabhoga Seva", price: 251, desc: "Sponsor morning breakfast sweets and coconuts." },
  { name: "Khadya Bhoga & Evening Aarti", price: 751, desc: "Evening dry bhoga offering and special light aarti." },
  { name: "Anna Daan Seva (Large Group - 50 Pilgrims)", price: 5001, desc: "Feed up to 50 pilgrims in the Anandabazar complex." },
  { name: "Temple Development Seva (Stone Boundary Wall)", price: 2500, desc: "Contribute to the construction of Meghnad Pacheri boundary stone wall." },
];

export const DONATION_CATEGORIES = [
  "general_fund", "anna_daan", "festival_fund", "construction_fund", "cleanliness_fund", "charity",
];

export const MIN_DONATION = 50;       // INR
export const MAX_DONATION = 500000;   // INR per online payment
