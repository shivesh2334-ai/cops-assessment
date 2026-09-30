# COPD Assessment & Treatment System (Next.js / Vercel)

Clinical decision support for initial pharmacologic therapy of stable COPD. It classifies a patient into GOLD group A, B or E, confirms airflow obstruction from spirometry, screens CXR and lab findings, and suggests treatment. The knowledge base is embedded in the code, so there is no backend or database.

Source: UpToDate, "Stable COPD: Initial pharmacologic management" (updated Jan 14, 2026), which summarizes the GOLD 2026 report.

## What it does

| Section | Function |
|---|---|
| Patient Information | Demographics, smoking, comorbidities, medications |
| Clinical Assessment | mMRC, CAT (8 items), exacerbation history, post-bronchodilator spirometry, blood eosinophils, SpO2, chest X-ray findings |
| Diagnosis & Treatment | Spirometric confirmation (FEV1/FVC <0.70), GOLD 1-4 stage, ABE group, treatment strategy, drug options, eosinophil/asthma/comorbidity flags, rescue therapy, JSON report download |
| Knowledge Base | Group criteria, LABA/LAMA tables, eosinophil guide, not-recommended approaches |

## Decision rules

- Group E: at least 1 moderate (antibiotics and/or steroids) or severe (hospitalization) exacerbation in the past year.
- Group B: no exacerbation, and mMRC 2 or higher, or CAT 10 or higher.
- Group A: no exacerbation, mMRC 0-1 and CAT under 10.
- Group A: LAMA preferred (LABA alternative). Group B: LAMA-LABA. Group E: LAMA-LABA, or LAMA-LABA-ICS if hospitalized, eosinophils 300 or higher, or asthma.
- Eosinophils under 100: avoid ICS.

## Repository layout

```
app/layout.tsx, page.tsx, globals.css   UI (four sections)
lib/knowledge.ts                        Embedded knowledge base (edit here to update guidance)
lib/engine.ts                           Scoring, staging, diagnosis and treatment logic
vercel.json                             Region bom1 (Mumbai)
```

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose Add New > Project and import the repository.
3. Keep the detected Next.js preset and deploy. No environment variables are needed.

## Run locally

```bash
npm install
npm run dev
```

## Data handling

Entries are stored only in the browser's localStorage and can be downloaded as JSON. Nothing is sent to a server. Do not enter identifiable patient data on a public deployment.

## Updating the knowledge base

Edit `lib/knowledge.ts` and commit; Vercel redeploys automatically. Treatment rules are in `lib/engine.ts`.

## Disclaimer

Decision support only. It does not replace clinical judgment and is not validated as a medical device.
