export const SITE_NAME = "Redlight Therapy Co.";
export const BUSINESS_EMAIL = "redlighttherapyco.26@gmail.com";

export function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const BUSINESS_TYPES = [
  "Distributor",
  "Retailer",
  "Online reseller",
  "Beauty clinic",
  "Salon",
  "Spa or wellness business",
  "Gym or fitness business",
  "Other",
] as const;

export const ENQUIRY_STATUSES = ["new", "in_progress", "quoted", "won", "closed", "spam"] as const;
export const STATUS_LABEL: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  quoted: "Quoted",
  won: "Won",
  closed: "Closed",
  spam: "Spam",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};
