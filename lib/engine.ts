import { GroupKey, groups, rescue, cxrSupportive, cxrAlternative } from "./knowledge";

export type Patient = {
  patientId: string; age: number; sex: string; smoking: string; packYears: number; bmi: number;
  comorbidities: string[]; currentMeds: string; noLama: boolean;
  mmrc: number; cat: Record<string, number>;
  exacerbations: number; hospitalized: boolean;
  fev1: number; fev1Pred: number; fvc: number;
  eos: number; spo2: number; labNotes: string;
  cxr: string[]; cxrNotes: string;
};

export const emptyPatient: Patient = {
  patientId: "", age: 60, sex: "Male", smoking: "Former smoker", packYears: 0, bmi: 25,
  comorbidities: [], currentMeds: "", noLama: false,
  mmrc: 0, cat: Object.fromEntries(["cough","phlegm","tight","breath","activity","confidence","sleep","energy"].map(k => [k, 0])),
  exacerbations: 0, hospitalized: false,
  fev1: 2.0, fev1Pred: 3.0, fvc: 3.0,
  eos: 150, spo2: 96, labNotes: "",
  cxr: [], cxrNotes: "",
};

export const catTotal = (p: Patient) => Object.values(p.cat).reduce((a, b) => a + b, 0);

export function goldStage(fev1Pct: number) {
  if (fev1Pct >= 80) return { stage: "GOLD 1", severity: "Mild" };
  if (fev1Pct >= 50) return { stage: "GOLD 2", severity: "Moderate" };
  if (fev1Pct >= 30) return { stage: "GOLD 3", severity: "Severe" };
  return { stage: "GOLD 4", severity: "Very severe" };
}

export function goldGroup(p: Patient): GroupKey {
  if (p.exacerbations >= 1 || p.hospitalized) return "E";
  if (p.mmrc >= 2 || catTotal(p) >= 10) return "B";
  return "A";
}

export type Result = {
  ratio: number; fev1Pct: number; confirmed: boolean;
  stage: string; severity: string; group: GroupKey;
  cat: number; triple: boolean; icsAvoid: boolean;
  diagnosis: string; cxrSupport: string[]; cxrAlt: string[];
  flags: { level: "ok" | "warn" | "bad" | "info"; text: string }[];
  rescueList: string[]; rescueCautions: string[];
};

export function assess(p: Patient): Result {
  const ratio = p.fvc > 0 ? p.fev1 / p.fvc : 0;
  const fev1Pct = p.fev1Pred > 0 ? (p.fev1 / p.fev1Pred) * 100 : 0;
  const confirmed = ratio < 0.7;
  const { stage, severity } = goldStage(fev1Pct);
  const group = goldGroup(p);
  const cat = catTotal(p);
  const asthma = p.comorbidities.includes("Asthma");
  const flags: Result["flags"] = [];

  const cxrSupport = p.cxr.filter(c => cxrSupportive.includes(c));
  const cxrAlt = p.cxr.filter(c => cxrAlternative.includes(c));

  let triple = false;
  let icsAvoid = false;

  if (!confirmed) {
    flags.push({ level: "bad", text: "FEV1/FVC is 0.70 or higher, so airflow obstruction is not confirmed. Enter post-bronchodilator values and consider an alternative diagnosis before using this treatment guidance." });
  }
  if (cxrAlt.length) {
    flags.push({ level: "warn", text: `CXR shows ${cxrAlt.join(", ").toLowerCase()}. These are not explained by COPD alone; evaluate for other or coexisting conditions.` });
  }
  if (group === "E") {
    if (p.hospitalized) { triple = true; flags.push({ level: "bad", text: "Hospitalization for exacerbation in the past year: LAMA-LABA-ICS is suggested upfront (Grade 2C)." }); }
    if (p.eos >= 300) { triple = true; flags.push({ level: "bad", text: "Blood eosinophils ≥300 cells/µL with exacerbations: LAMA-LABA-ICS is reasonable initial therapy (Grade 2C)." }); }
    if (p.eos < 100) { icsAvoid = true; flags.push({ level: "ok", text: "Blood eosinophils <100 cells/µL: minimal ICS benefit and higher pneumonia risk. Favor LAMA-LABA." }); }
    if (!triple && p.eos >= 100 && p.eos < 300) flags.push({ level: "info", text: "Eosinophils 100–299 cells/µL: start LAMA-LABA; ICS benefit is incremental. Reassess at follow-up." });
  }
  if (asthma) {
    if (group !== "A") { triple = true; }
    flags.push({ level: "info", text: "Concomitant asthma: symptoms and exacerbations may respond better with an ICS. LABA-LAMA-ICS is preferred over LABA-ICS." });
  }
  if (group === "B" && p.eos >= 300) flags.push({ level: "info", text: "Eosinophils ≥300 cells/µL without exacerbations: ICS is not part of initial therapy for Group B in this guidance." });

  if (p.comorbidities.includes("BPH / urinary retention")) flags.push({ level: "warn", text: "Urinary retention risk: LAMAs can worsen it. Consider a LABA-based option or aclidinium (low bioavailability), and monitor." });
  if (p.comorbidities.includes("Narrow-angle glaucoma")) flags.push({ level: "warn", text: "Narrow-angle glaucoma: muscarinic antagonists (notably revefenacin) can worsen it. Use with caution." });
  if (p.comorbidities.includes("Kidney impairment")) flags.push({ level: "warn", text: "Kidney impairment: tiotropium and glycopyrronium products are renally excreted. Monitor for anticholinergic effects." });
  if (p.comorbidities.includes("Hepatic impairment")) flags.push({ level: "warn", text: "Hepatic impairment: avoid revefenacin." });
  if (p.comorbidities.includes("Cardiovascular disease")) flags.push({ level: "info", text: "Cardiovascular disease: LABAs and LAMAs have similar, generally reassuring cardiovascular safety. Watch for tachycardia and tremor with LABA, and for SABA overuse." });
  if (p.spo2 > 0 && p.spo2 <= 88) flags.push({ level: "bad", text: "Resting SpO2 ≤88%: assess for hypoxemia and need for oxygen therapy." });
  if (p.smoking === "Current smoker") flags.push({ level: "warn", text: "Current smoker: smoking cessation should start alongside drug therapy." });

  const rescueList = p.noLama ? rescue.noLama : rescue.onLama;
  const diagnosis = confirmed
    ? `COPD confirmed by spirometry (FEV1/FVC ${ratio.toFixed(2)}), ${stage} ${severity.toLowerCase()} airflow limitation, GOLD group ${group}.`
    : `COPD not confirmed on the values entered (FEV1/FVC ${ratio.toFixed(2)}).`;

  return { ratio, fev1Pct, confirmed, stage, severity, group, cat, triple, icsAvoid, diagnosis, cxrSupport, cxrAlt, flags, rescueList, rescueCautions: rescue.cautions };
}

export function treatmentSummary(r: Result): string {
  if (!r.confirmed) return "Confirm the diagnosis before starting therapy.";
  if (r.triple && r.group !== "A") return "LAMA-LABA-ICS (single inhaler preferred) plus rescue short-acting bronchodilator";
  return groups[r.group].strategy;
}
