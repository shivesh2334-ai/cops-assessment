// Embedded knowledge base.
// Source: UpToDate, "Stable COPD: Initial pharmacologic management" (topic 1447, updated Jan 14, 2026),
// which summarizes the GOLD 2026 report. Edit this file to update the app's guidance.

export const SOURCE = "UpToDate: Stable COPD – Initial pharmacologic management (Jan 2026); GOLD 2026";

export const mmrcOptions = [
  "No breathlessness except with strenuous exercise",
  "Breathless when hurrying or walking up a slight hill",
  "Walks slower than people of same age, or has to stop for breath when walking at own pace",
  "Stops for breath after walking about 100 meters or after a few minutes",
  "Too breathless to leave house or breathless when dressing",
];

export const catItems: { key: string; label: string; help: string }[] = [
  { key: "cough", label: "Cough frequency", help: "0 = never cough, 5 = cough all the time" },
  { key: "phlegm", label: "Phlegm in chest", help: "0 = no phlegm, 5 = chest completely full" },
  { key: "tight", label: "Chest tightness", help: "0 = not tight, 5 = very tight" },
  { key: "breath", label: "Breathlessness on hills/stairs", help: "0 = not breathless, 5 = very breathless" },
  { key: "activity", label: "Limited in home activities", help: "0 = not limited, 5 = very limited" },
  { key: "confidence", label: "Confidence leaving home", help: "0 = very confident, 5 = not confident" },
  { key: "sleep", label: "Sleep quality", help: "0 = sleep soundly, 5 = don't sleep soundly" },
  { key: "energy", label: "Energy level", help: "0 = lots of energy, 5 = no energy" },
];

export const cxrSupportive = [
  "Hyperinflation",
  "Flattened diaphragm",
  "Increased retrosternal airspace",
  "Bullae",
  "Narrow cardiac silhouette",
  "Bronchial wall thickening",
];
export const cxrAlternative = [
  "Mass or nodule",
  "Consolidation / infiltrate",
  "Pleural effusion",
  "Cardiomegaly / pulmonary edema",
  "Bronchiectasis",
];

export const comorbidityOptions = [
  "Cardiovascular disease",
  "Diabetes",
  "Asthma",
  "Hypertension",
  "GERD",
  "Osteoporosis",
  "BPH / urinary retention",
  "Narrow-angle glaucoma",
  "Kidney impairment",
  "Hepatic impairment",
];

export type GroupKey = "A" | "B" | "E";

export const groups: Record<GroupKey, {
  name: string; criteria: string[]; strategy: string; rationale: string; options: string[];
}> = {
  A: {
    name: "Less symptomatic, low risk",
    criteria: ["mMRC 0–1 or CAT <10", "No exacerbation needing antibiotics/steroids or hospitalization in the past year"],
    strategy: "Long-acting bronchodilator (LAMA preferred; once-daily LABA is an alternative) plus rescue short-acting bronchodilator",
    rationale:
      "Long-acting bronchodilators improve lung function and reduce exacerbations even with mild symptoms (tiotropium: 0.27 vs 0.50 events/patient-year in early COPD). LAMAs modestly reduce exacerbations more than LABAs. Short-acting therapy alone is reasonable only for infrequent, intermittent dyspnea.",
    options: [
      "Tiotropium DPI 18 mcg once daily, or SMI 2.5 mcg/actuation, 2 inhalations once daily",
      "Umeclidinium DPI 62.5 mcg, 1 inhalation once daily",
      "Aclidinium DPI 400 mcg, 1 inhalation twice daily",
      "Glycopyrrolate (glycopyrronium) 50 mcg once daily (availability varies by region)",
      "LABA alternative: olodaterol SMI 2.5 mcg/actuation, 2 inhalations once daily; salmeterol DPI 50 mcg twice daily; indacaterol where available",
    ],
  },
  B: {
    name: "More symptomatic, low risk",
    criteria: ["mMRC ≥2 or CAT ≥10", "No exacerbation needing antibiotics/steroids or hospitalization in the past year"],
    strategy: "Dual bronchodilator therapy (LAMA-LABA), preferably as a single fixed-dose inhaler",
    rationale:
      "LAMA-LABA improves FEV1 over either agent alone and gives slightly better quality of life and dyspnea. Fixed-dose single inhalers improve adherence. Safety profile is similar to monotherapy.",
    options: [
      "Tiotropium-olodaterol SMI 2.5/2.5 mcg per actuation, 2 inhalations once daily",
      "Umeclidinium-vilanterol DPI 62.5/25 mcg, 1 inhalation once daily",
      "Glycopyrronium-indacaterol DPI 50/110 mcg once daily (Canada, Europe and elsewhere)",
      "Glycopyrrolate-formoterol MDI 9/4.8 mcg per actuation, 2 inhalations twice daily",
      "Aclidinium-formoterol DPI 400/12 mcg, 1 inhalation twice daily",
    ],
  },
  E: {
    name: "High risk of exacerbations",
    criteria: ["≥1 moderate exacerbation (systemic antibiotics and/or glucocorticoids) or severe exacerbation (hospitalization) in the past year"],
    strategy: "LAMA-LABA in most cases; LAMA-LABA-ICS for hospitalization, blood eosinophils ≥300 cells/µL, or concomitant asthma",
    rationale:
      "Group E has the highest risk of hospitalization and death. LAMA-LABA reduces moderate-to-severe exacerbations versus either agent alone (vs LAMA HR 0.87; vs LABA HR 0.70) with fewer pneumonia episodes than LABA-ICS. Triple therapy reduces severe exacerbations and may reduce mortality in higher-risk patients.",
    options: [
      "LAMA-LABA fixed-dose inhaler (same options as Group B)",
      "LAMA-LABA-ICS when triple therapy criteria are met (see flags below); single-inhaler triple preferred when available",
    ],
  },
};

export const rescue = {
  onLama: [
    "Albuterol (SABA) as needed for episodic dyspnea",
    "Levalbuterol (SABA) as an alternative",
    "Avoid routine SAMA use with a LAMA (cumulative anticholinergic effects, theoretical LAMA blockade)",
  ],
  noLama: [
    "Ipratropium-albuterol SMI 20/100 mcg, 1 inhalation every 4–6 hours as needed",
    "Ipratropium-albuterol nebulized 0.5 mg/2.5 mg per 3 mL vial every 4–6 hours as needed",
    "Combination gives greater bronchodilation than either agent alone at usual doses (Grade 2C)",
  ],
  cautions: [
    "Use SABA as needed, not on a regular schedule; frequent use means moving to long-acting agents",
    "Overuse causes tremor and tachycardia; hypokalemia in extreme cases",
    "Avoid oral SABAs (more side effects, less effective)",
  ],
};

export const gold = [
  { stage: "GOLD 1", fev1: "≥80%", severity: "Mild" },
  { stage: "GOLD 2", fev1: "50–79%", severity: "Moderate" },
  { stage: "GOLD 3", fev1: "30–49%", severity: "Severe" },
  { stage: "GOLD 4", fev1: "<30%", severity: "Very severe" },
];

export const eosinophilGuide = [
  { range: "<100 cells/µL", effect: "Minimal ICS benefit", note: "Higher pneumonia risk on ICS; avoid ICS" },
  { range: "100–299 cells/µL", effect: "Incremental ICS benefit", note: "Start LAMA-LABA; reassess" },
  { range: "≥300 cells/µL", effect: "Consistent ICS benefit", note: "With exacerbations, LAMA-LABA-ICS is reasonable initial therapy" },
];

export const laba = [
  { drug: "Salmeterol", dose: "DPI 50 mcg twice daily", note: "Slow onset (~120 min); TORCH trial showed no mortality increase" },
  { drug: "Formoterol", dose: "Nebulized 20 mcg/2 mL twice daily (US)", note: "Onset within 3 min; DPI in Canada/Europe" },
  { drug: "Arformoterol", dose: "Nebulized 15 mcg/2 mL twice daily", note: "Nebulizer only" },
  { drug: "Indacaterol", dose: "Once daily (75 mcg US; 150–300 mcg Europe)", note: "Withdrawn in US/Canada; available in some regions" },
  { drug: "Olodaterol", dose: "SMI 2.5 mcg/actuation, 2 inhalations once daily", note: "SMI helps poor inspiratory flow or hand-breath coordination" },
  { drug: "Vilanterol", dose: "Once daily, combination only", note: "Combined with umeclidinium or fluticasone furoate" },
];

export const lama = [
  { drug: "Tiotropium", dose: "DPI 18 mcg or SMI 2.5 mcg ×2 once daily", note: "Most studied; renally excreted" },
  { drug: "Aclidinium", dose: "DPI 400 mcg twice daily", note: "Bioavailability <5%; no urinary retention signal in trials" },
  { drug: "Umeclidinium", dose: "DPI 62.5 mcg once daily", note: "Peak ~3 h, sustained 24 h" },
  { drug: "Glycopyrrolate", dose: "50 mcg once daily or 25 mcg twice daily (outside US)", note: "Renally excreted" },
  { drug: "Revefenacin", dose: "Nebulized 175 mcg/3 mL once daily", note: "For patients who cannot use other devices; avoid in hepatic impairment; can worsen narrow-angle glaucoma and urinary retention" },
];

export const nonPharm = [
  "Smoking cessation",
  "Pulmonary rehabilitation",
  "Vaccination",
  "Nutrition",
  "Inhaler technique and self-management education",
  "Single fixed-dose combination inhalers when possible (better adherence)",
];

export const obsolete = [
  "Inhaled glucocorticoids are no longer recommended without a long-acting bronchodilator.",
  "Theophylline is not recommended in place of long-acting inhaled bronchodilators unless those are unavailable.",
];
