/**
 * Product data transcribed from the two supplied PDFs:
 *  - "Redlight Therapy Co. Wholesale Range" (13 pages; product names, photos, test & certificate summaries)
 *  - "Redlight Therapy Co. Trade Price List, November 2026" (trade prices, RRP, margins, volume terms)
 *
 * Nothing here is invented. Where the PDFs do not give a value (dimensions, what's included,
 * usage instructions, any detail for the 100 LED panel) the field is left empty and the site
 * shows "Available on request". Edit everything in the admin dashboard once it is seeded.
 */
import type { ModelRow, SpecRow } from "@/db/schema";

export type SeedCategory = {
  slug: string; name: string; shortName: string; tagline: string; description: string; image: string; sort: number;
};

export const seedCategories: SeedCategory[] = [
  {
    slug: "red-light-therapy-panels",
    name: "Red Light Therapy Panels",
    shortName: "Panels",
    tagline: "Powerful technology. Premium design.",
    description:
      "Full-size LED panels in two sizes, 300 LED and 100 LED. The 300 LED panel has been measured giving out 660 nm red and 850 nm near-infrared light, with no measured flicker.",
    image: "/images/products/300-led-panel.webp",
    sort: 1,
  },
  {
    slug: "led-face-masks",
    name: "LED Face Masks",
    shortName: "Face Masks",
    tagline: "The next generation of light-based skincare.",
    description:
      "Two LED face masks: the Red Light Therapy Face Mask and the Starter LED Face Mask. Both have EMC test reports and conformity certificates under the EMC Directive 2014/30/EU.",
    image: "/images/products/starter-face-mask.webp",
    sort: 2,
  },
  {
    slug: "hair-growth-caps",
    name: "Hair Growth Caps",
    shortName: "Hair Caps",
    tagline: "Innovation in light-based hair care.",
    description:
      "A wearable red light therapy cap, certified for electromagnetic compatibility and for electrical safety under the Low Voltage Directive.",
    image: "/images/products/hair-cap.webp",
    sort: 3,
  },
  {
    slug: "therapy-straps",
    name: "Therapy Straps",
    shortName: "Straps",
    tagline: "Targeted light, made wearable.",
    description: "A battery-powered red light therapy strap for the knee, with an EMC test report and declaration of conformity.",
    image: "/images/products/knee-strap.webp",
    sort: 4,
  },
];

export type SeedDoc = { title: string; description: string; fileName: string };

export type SeedProduct = {
  slug: string; name: string; category: string; featured: boolean; sort: number;
  summary: string; description: string; image: string; imageAlt: string;
  models: ModelRow[]; features: string[]; specs: SpecRow[];
  dimensions: string; whatsIncluded: string; usage: string;
  seoDescription: string; docs: SeedDoc[];
};

const EMC = "Compliance";
const LIGHT = "Light output (measured)";
const POWER = "Power";

export const seedProducts: SeedProduct[] = [
  {
    slug: "300-led-red-light-panel",
    name: "300 LED Red Light Panel",
    category: "red-light-therapy-panels",
    featured: true,
    sort: 1,
    summary:
      "The largest panel in the range. Measured output sits in two bands, 660 nm red and 850 nm near-infrared, with 0% flicker.",
    description:
      "The 300 LED Red Light Panel is the flagship of the Redlight Therapy Co. wholesale range.\n\nA spectroradiometer measurement of the panel recorded its main red peak at 660.8 nm and a second, near-infrared peak at about 850 nm. About 92% of the measured light was red or near-infrared, and the output was steady, with 0% flicker depth.\n\nIndividual LEDs of the type used were also measured: the red LEDs peaked between 659.9 and 660.8 nm and the near-infrared LEDs between 852.9 and 853.8 nm.\n\nThe panel model named on its documents is RT1500S+. It was EMC tested by Shenzhen ZKT Technology Co., Ltd. against EN IEC 55015 and EN IEC 61547, with an overall result of PASS.",
    image: "/images/products/300-led-panel.webp",
    imageAlt: "300 LED Red Light Panel standing upright beside its black retail box, lit in red",
    models: [{ model: "RT1500S+", note: "Model named on the EMC test report and certificate of compliance" }],
    features: [
      "Two wavelength bands: 660 nm red and 850 nm near-infrared (measured)",
      "About 92% of measured light is red or near-infrared",
      "0% flicker depth measured",
      "EMC tested to EN IEC 55015 and EN IEC 61547: PASS",
      "Four-page documentation pack: EMC test, compliance certificate, light output and LED measurements",
    ],
    specs: [
      { group: LIGHT, label: "Main red peak", value: "660.8 nm" },
      { group: LIGHT, label: "Near-infrared peak", value: "About 850 nm" },
      { group: LIGHT, label: "Light split", value: "Red 45% · Near-infrared 47% · Other 8%" },
      { group: LIGHT, label: "Power density at the measured area", value: "66.0 mW/cm² (measuring distance not recorded; the figure changes with distance)" },
      { group: LIGHT, label: "Flicker", value: "0 Hz, 0% flicker depth" },
      { group: LIGHT, label: "Red LEDs (3 tested)", value: "Peak 659.9 – 660.8 nm; 18.61 – 18.94 mW output each" },
      { group: LIGHT, label: "Near-infrared LEDs (3 tested)", value: "Peak 852.9 – 853.8 nm; 11.14 – 11.74 mW output each" },
      { group: POWER, label: "Rating (as stated on the EMC report)", value: "AC 85–265V, 50/60Hz, 24W" },
      { group: EMC, label: "EMC test report", value: "ZKT-250722L16910E · PASS · issued Jul. 22, 2025" },
      { group: EMC, label: "Certificate of compliance", value: "ZKT-250722L16910C" },
      { group: EMC, label: "Directive", value: "EMC Directive 2014/30/EU" },
      { group: EMC, label: "Standards", value: "EN IEC 55015:2019/A11:2020 · EN IEC 61547:2023 · EN IEC 61000-3-2 · EN 61000-3-3 · EN 61000-4-2 to -4-11" },
    ],
    dimensions: "",
    whatsIncluded: "",
    usage: "",
    seoDescription:
      "300 LED red light therapy panel for wholesale. Measured 660 nm red and 850 nm near-infrared output, 0% flicker, EMC tested. Trade enquiries welcome.",
    docs: [{ title: "300 LED Panel documentation pack", description: "EMC test summary, compliance certificate summary, light output and LED measurements (5 pages)", fileName: "300-led-panel-documentation.pdf" }],
  },
  {
    slug: "100-led-red-light-panel",
    name: "100 LED Red Light Panel",
    category: "red-light-therapy-panels",
    featured: false,
    sort: 2,
    summary: "The compact panel in the range. Full specifications are available on request.",
    description:
      "The 100 LED Red Light Panel is the smaller of the two panels in the Redlight Therapy Co. wholesale range.\n\nDetailed specifications and documentation for this model are available on request. Contact us and we will send them over.",
    image: "/images/products/100-led-panel.webp",
    imageAlt: "100 LED Red Light Panel on a wheeled stand beside its black retail box",
    models: [],
    features: [],
    specs: [],
    dimensions: "",
    whatsIncluded: "",
    usage: "",
    seoDescription: "100 LED red light therapy panel for wholesale and trade buyers. Request specifications and trade pricing.",
    docs: [],
  },
  {
    slug: "red-light-therapy-face-mask",
    name: "Red Light Therapy Face Mask",
    category: "led-face-masks",
    featured: true,
    sort: 3,
    summary: "A DC-powered LED face mask (5V / 1A), EMC tested with an overall PASS by an ISO/IEC 17025 accredited lab.",
    description:
      "The Red Light Therapy Face Mask is an LED face mask powered from a 5V / 1A DC supply.\n\nThe model tested, V-F2509, was EMC tested by Shenzhen Huaxin Information Technology Service Co., Ltd. (A2LA accredited to ISO/IEC 17025:2017) against EN IEC 55014-1 and EN IEC 55014-2, with an overall result of PASS. Models V-F239 and V-F239Pro are also listed on the report.",
    image: "/images/products/face-mask.webp",
    imageAlt: "Dark Red Light Therapy Face Mask on a display head with red light glowing at the eyes, beside its box",
    models: [
      { model: "V-F2509", note: "Model tested" },
      { model: "V-F239", note: "Also listed on the report and certificate" },
      { model: "V-F239Pro", note: "Also listed on the report and certificate" },
    ],
    features: [
      "Powered from a 5V / 1A DC supply",
      "EMC tested to EN IEC 55014-1 and EN IEC 55014-2: PASS",
      "Tested by an A2LA accredited lab (ISO/IEC 17025:2017)",
      "Certificate of conformity under EMC Directive 2014/30/EU",
    ],
    specs: [
      { group: POWER, label: "Power supply", value: "5V / 1A (DC)" },
      { group: EMC, label: "EMC test report", value: "HX251230E001 · PASS · issued Dec. 24, 2025" },
      { group: EMC, label: "Certificate of conformity", value: "HX251230E001C" },
      { group: EMC, label: "Directive", value: "EMC Directive 2014/30/EU" },
      { group: EMC, label: "Standards", value: "EN IEC 55014-1:2021 · EN IEC 55014-2:2021 · EN IEC 61000-3-2 · EN 61000-3-3" },
    ],
    dimensions: "",
    whatsIncluded: "",
    usage: "",
    seoDescription: "Red light therapy LED face mask for wholesale. 5V DC, EMC tested and certified under 2014/30/EU. Trade enquiries welcome.",
    docs: [{ title: "Face Mask documentation pack", description: "EMC test summary and certificate of conformity summary (3 pages)", fileName: "face-mask-documentation.pdf" }],
  },
  {
    slug: "starter-led-face-mask",
    name: "Starter LED Face Mask",
    category: "led-face-masks",
    featured: true,
    sort: 4,
    summary: "A rechargeable LED face mask with a 3.7V, 3000mAh battery and 5V DC input. EMC tested with an overall PASS.",
    description:
      "The Starter LED Face Mask is a rechargeable LED face mask with a DC 5V input and a 3.7V, 3000mAh battery.\n\nIt was EMC tested by Shenzhen Promise Test Technology Co., Ltd. in both charging and working modes, against EN IEC 55014-1 and EN IEC 55014-2, with an overall result of PASS. The report covers models SA-P02M01 to SA-P02M09, which it says differ in name only.",
    image: "/images/products/starter-face-mask.webp",
    imageAlt: "White Starter LED Face Mask on a display head with red light at the eyes and mouth, beside its box",
    models: [
      { model: "SA-P02M01", note: "Model tested" },
      { model: "SA-P02M01 to SA-P02M09", note: "Covered by the report; differ in name only" },
    ],
    features: [
      "Rechargeable: 3.7V, 3000mAh battery",
      "DC 5V input",
      "EMC tested in charging and working modes: PASS",
      "Certificate of compliance under EMC Directive 2014/30/EU",
    ],
    specs: [
      { group: POWER, label: "Input", value: "DC 5V" },
      { group: POWER, label: "Battery", value: "DC 3.7V, 3000mAh" },
      { group: EMC, label: "EMC test report", value: "PRMS2607302-01ER · PASS · issued Aug. 7, 2026" },
      { group: EMC, label: "Certificate of compliance", value: "PRMS2607302-01EC" },
      { group: EMC, label: "Directive", value: "EMC Directive 2014/30/EU" },
      { group: EMC, label: "Standards", value: "EN IEC 55014-1:2021 · EN IEC 55014-2:2021 · EN IEC 61000-3-2 · EN 61000-3-3" },
    ],
    dimensions: "",
    whatsIncluded: "",
    usage: "",
    seoDescription: "Rechargeable starter LED face mask for wholesale. 3000mAh battery, EMC tested under 2014/30/EU. Trade enquiries welcome.",
    docs: [{ title: "Starter Face Mask documentation pack", description: "EMC test summary and certificate of compliance summary (3 pages)", fileName: "starter-face-mask-documentation.pdf" }],
  },
  {
    slug: "red-light-therapy-hair-cap",
    name: "Red Light Therapy Hair Cap",
    category: "hair-growth-caps",
    featured: true,
    sort: 5,
    summary: "A wearable red light therapy cap, certified for both electromagnetic compatibility and electrical safety.",
    description:
      "The Red Light Therapy Hair Cap is a wearable LED cap.\n\nModels QZ022 and QZ036 hold two certificates of conformity issued by East Notice Certification Service Co., Ltd.: one for electromagnetic compatibility (EMC Directive 2014/30/EU) and one for electrical safety (Low Voltage Directive 2014/35/EU), tested against EN IEC 60335-1, EN 60335-2-27 and EN 62233.",
    image: "/images/products/hair-cap.webp",
    imageAlt: "Black Red Light Therapy Hair Cap on a stand with red LEDs lit underneath the peak, beside its box",
    models: [
      { model: "QZ022", note: "Named on both certificates" },
      { model: "QZ036", note: "Named on both certificates" },
    ],
    features: [
      "Wearable cap format",
      "EMC certificate: EN IEC 55014-1 and EN IEC 55014-2",
      "Electrical safety certificate under the Low Voltage Directive 2014/35/EU",
      "Tested against EN IEC 60335-1, EN 60335-2-27 and EN 62233",
    ],
    specs: [
      { group: EMC, label: "EMC certificate", value: "ENC2510105GZ18-1 (test report ENC2510105GZ18E1) · Oct. 20, 2025" },
      { group: EMC, label: "Low Voltage certificate", value: "ENC2510105GZ18-2 (test report ENC2510105GZ18L1) · Oct. 20, 2025" },
      { group: EMC, label: "Directives", value: "EMC Directive 2014/30/EU · Low Voltage Directive 2014/35/EU" },
      { group: EMC, label: "Standards", value: "EN IEC 55014-1:2021 · EN IEC 55014-2:2021 · EN IEC 60335-1:2023+A11:2023 · EN 60335-2-27:2013+A2:2020 · EN 62233:2008" },
    ],
    dimensions: "",
    whatsIncluded: "",
    usage: "",
    seoDescription: "Red light therapy hair cap for wholesale. EMC and Low Voltage Directive certified (models QZ022, QZ036). Trade enquiries welcome.",
    docs: [{ title: "Hair Cap documentation pack", description: "EMC and electrical safety certificate summary (2 pages)", fileName: "hair-cap-documentation.pdf" }],
  },
  {
    slug: "red-light-therapy-knee-strap",
    name: "Red Light Therapy Knee Strap",
    category: "therapy-straps",
    featured: false,
    sort: 6,
    summary: "A battery-powered strap for the knee (DC 5V). EMC tested, with a PASS on every test applicable to it.",
    description:
      "The Red Light Therapy Knee Strap is a battery-powered strap that wraps around the knee, running from DC 5V.\n\nModel K8 was EMC tested by Shenzhen SAIL Testing Technology Co., Ltd. against EN IEC 55014-1 and EN IEC 55014-2, with a PASS on all tests applicable to the product. Models K6 and K9 are also named. On the lab documents the product is called a \"Heated Knee Pad\".",
    image: "/images/products/knee-strap.webp",
    imageAlt: "Black Red Light Therapy Knee Strap on a leg form with a red LED panel lit, beside its box",
    models: [
      { model: "K8", note: "Model tested (prototype production sample)" },
      { model: "K6, K9", note: "Also named on the report and declaration" },
    ],
    features: [
      "Battery powered, DC 5V",
      "EMC tested to EN IEC 55014-1 and EN IEC 55014-2: PASS on all applicable tests",
      "Declaration of conformity under EMC Directive 2014/30/EU",
    ],
    specs: [
      { group: POWER, label: "Power", value: "DC 5V, battery supplied" },
      { group: EMC, label: "EMC test report", value: "SAIL260112045E055 · PASS · issued Jan. 16, 2026" },
      { group: EMC, label: "Declaration of conformity", value: "SAIL260112045E055C" },
      { group: EMC, label: "Directive", value: "EMC Directive 2014/30/EU" },
      { group: EMC, label: "Standards", value: "EN IEC 55014-1:2021 · EN IEC 55014-2:2021 · EN IEC 61000-3-2 · EN 61000-3-3 · EN 61000-4-2" },
    ],
    dimensions: "",
    whatsIncluded: "",
    usage: "",
    seoDescription: "Red light therapy knee strap for wholesale. Battery powered, EMC tested under 2014/30/EU. Trade enquiries welcome.",
    docs: [{ title: "Knee Strap documentation pack", description: "EMC test summary and declaration of conformity summary (3 pages)", fileName: "knee-strap-documentation.pdf" }],
  },
];

/**
 * Trade prices, volume tiers and trade terms are CONFIDENTIAL, so they are not kept in source control.
 * The seed script reads them from private/price-list.json (git-ignored). See private/price-list.example.json.
 */
export type SeedPrice = { sourceName: string; productSlug: string | null; trade: string; rrp: string; margin: string; note: string };
export type SeedTier = { label: string; minQty: number; maxQty: number | null; discountPercent: string; description: string; sort: number };
export type TradeTerms = { priceListDate: string; moq: number; moqText: string; payment: string; delivery: string; volumeNote: string };

export const emptyTradeTerms: TradeTerms = { priceListDate: "", moq: 0, moqText: "", payment: "", delivery: "", volumeNote: "" };

export const generalDocs: SeedDoc[] = [
  { title: "Wholesale Range catalogue", description: "The full 13-page wholesale range, with test and certificate summaries for every product", fileName: "full-wholesale-range.pdf" },
];
