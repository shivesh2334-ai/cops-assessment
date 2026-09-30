"use client";

import { useEffect, useState } from "react";
import {
  catItems, mmrcOptions, cxrSupportive, cxrAlternative, comorbidityOptions,
  groups, gold, eosinophilGuide, laba, lama, nonPharm, obsolete, SOURCE, GroupKey,
} from "@/lib/knowledge";
import { Patient, emptyPatient, assess, catTotal, treatmentSummary } from "@/lib/engine";

const PAGES = ["Patient Information", "Clinical Assessment", "Diagnosis & Treatment", "Knowledge Base"] as const;
type Page = (typeof PAGES)[number];
const STORE = "copd-assessment-v1";
const flagClass = { ok: "box-ok", warn: "box-warn", bad: "box-bad", info: "box-info" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className="label">{label}</label>{children}</div>);
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        <thead><tr>{head.map(h => <th key={h} className="text-left border-b-2 border-gray-300 p-2">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (<tr key={i} className="border-b border-gray-200">{r.map((c, j) => <td key={j} className="p-2 align-top">{c}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const [page, setPage] = useState<Page>("Patient Information");
  const [p, setP] = useState<Patient>(emptyPatient);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) { const s = JSON.parse(raw); setP({ ...emptyPatient, ...s.p }); setDone(!!s.done); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE, JSON.stringify({ p, done })); } catch {}
  }, [p, done, ready]);

  const set = <K extends keyof Patient>(k: K, v: Patient[K]) => setP(prev => ({ ...prev, [k]: v }));
  const toggle = (k: "comorbidities" | "cxr", v: string) =>
    set(k, p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v]);
  const r = assess(p);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 3000); };
  const download = () => {
    const body = { assessedAt: new Date().toISOString(), source: SOURCE, patient: p, result: { ...r, treatment: treatmentSummary(r) } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = `COPD_Assessment_${p.patientId || "patient"}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };
  const reset = () => { setP(emptyPatient); setDone(false); flash("Cleared this browser's saved assessment."); };

  const g = groups[r.group];

  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-64 md:min-h-screen bg-[#f0f2f6] p-5 md:sticky md:top-0 md:self-start">
        <div className="text-4xl" aria-hidden>🫁</div>
        <h2 className="font-semibold mt-2 mb-3">Navigation</h2>
        <nav className="space-y-1" aria-label="Sections">
          {PAGES.map(n => (
            <button key={n} onClick={() => setPage(n)} aria-current={page === n}
              className={`w-full text-left px-3 py-2 rounded-md ${page === n ? "bg-brand text-white" : "hover:bg-white"}`}>{n}</button>
          ))}
        </nav>
        <div className="box-info text-sm mt-6">Initial therapy for stable COPD based on GOLD 2026 as summarized by UpToDate (Jan 2026).</div>
        <button className="btn mt-2" onClick={reset}>Clear saved data</button>
        <p className="text-xs text-gray-600 mt-2">Entries are kept only in this browser.</p>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        <h1 className="text-3xl md:text-4xl text-brand text-center mb-8">🫁 COPD Assessment &amp; Treatment System</h1>
        {msg && <div role="status" className="box-ok">{msg}</div>}

        {page === "Patient Information" && (
          <section>
            <h2 className="section-header">Patient Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Patient ID / MRN"><input className="field" value={p.patientId} onChange={e => set("patientId", e.target.value)} /></Field>
              <Field label="Smoking status">
                <select className="field" value={p.smoking} onChange={e => set("smoking", e.target.value)}>
                  {["Current smoker", "Former smoker", "Never smoked"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Age"><input type="number" min={18} max={120} className="field" value={p.age} onChange={e => set("age", +e.target.value)} /></Field>
              <Field label="Pack-years"><input type="number" min={0} className="field" value={p.packYears} onChange={e => set("packYears", +e.target.value)} /></Field>
              <Field label="Sex">
                <select className="field" value={p.sex} onChange={e => set("sex", e.target.value)}>{["Male", "Female", "Other"].map(o => <option key={o}>{o}</option>)}</select>
              </Field>
              <Field label="BMI"><input type="number" step="0.1" className="field" value={p.bmi} onChange={e => set("bmi", +e.target.value)} /></Field>
            </div>
            <h3 className="text-lg mt-6 mb-2">Comorbidities</h3>
            <div className="grid sm:grid-cols-2 gap-1">
              {comorbidityOptions.map(c => (
                <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={p.comorbidities.includes(c)} onChange={() => toggle("comorbidities", c)} />{c}</label>
              ))}
            </div>
            <div className="mt-4">
              <Field label="Current medications"><textarea className="field" rows={3} value={p.currentMeds} onChange={e => set("currentMeds", e.target.value)} placeholder="List current medications" /></Field>
            </div>
            <label className="flex items-center gap-2 mt-3"><input type="checkbox" checked={p.noLama} onChange={e => set("noLama", e.target.checked)} />Cannot use a LAMA (cost, availability or side effects)</label>
            <button className="btn mt-4" onClick={() => flash("Patient information saved in this browser.")}>Save Patient Information</button>
          </section>
        )}

        {page === "Clinical Assessment" && (
          <section>
            <h2 className="section-header">Clinical Assessment</h2>

            <h3 className="text-lg mb-2">1. Dyspnea (mMRC)</h3>
            <select className="field" value={p.mmrc} onChange={e => set("mmrc", +e.target.value)} aria-label="mMRC grade">
              {mmrcOptions.map((o, i) => <option key={i} value={i}>{i}: {o}</option>)}
            </select>
            <div className="box-info"><b>mMRC score: {p.mmrc}</b></div>

            <h3 className="text-lg mb-2 mt-6">2. COPD Assessment Test (CAT)</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
              {catItems.map(it => (
                <div key={it.key}>
                  <label className="label" htmlFor={it.key}>{it.label}: {p.cat[it.key]}</label>
                  <input id={it.key} type="range" min={0} max={5} value={p.cat[it.key]} className="w-full"
                    onChange={e => set("cat", { ...p.cat, [it.key]: +e.target.value })} />
                  <div className="text-xs text-gray-600">{it.help}</div>
                </div>
              ))}
            </div>
            <div className="box-info"><b>CAT score: {catTotal(p)}</b> (0–9 low, 10–20 medium, 21–30 high, 31–40 very high)</div>

            <h3 className="text-lg mb-2 mt-6">3. Exacerbation history (past year)</h3>
            <div className="grid md:grid-cols-2 gap-4 items-end">
              <Field label="Exacerbations needing antibiotics and/or steroids"><input type="number" min={0} className="field" value={p.exacerbations} onChange={e => set("exacerbations", +e.target.value)} /></Field>
              <label className="flex items-center gap-2"><input type="checkbox" checked={p.hospitalized} onChange={e => set("hospitalized", e.target.checked)} />Hospitalized for a COPD exacerbation</label>
            </div>

            <h3 className="text-lg mb-2 mt-6">4. Spirometry (post-bronchodilator)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="FEV1 (L)"><input type="number" step="0.1" min={0} className="field" value={p.fev1} onChange={e => set("fev1", +e.target.value)} /></Field>
              <Field label="FEV1 predicted (L)"><input type="number" step="0.1" min={0} className="field" value={p.fev1Pred} onChange={e => set("fev1Pred", +e.target.value)} /></Field>
              <Field label="FVC (L)"><input type="number" step="0.1" min={0} className="field" value={p.fvc} onChange={e => set("fvc", +e.target.value)} /></Field>
            </div>
            <div className="box-info"><b>FEV1/FVC {r.ratio.toFixed(2)} | FEV1 {r.fev1Pct.toFixed(0)}% predicted | {r.stage} ({r.severity})</b></div>

            <h3 className="text-lg mb-2 mt-6">5. Laboratory and oxygenation</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Blood eosinophils (cells/µL)"><input type="number" min={0} className="field" value={p.eos} onChange={e => set("eos", +e.target.value)} /></Field>
              <Field label="Resting SpO2 (%)"><input type="number" min={0} max={100} className="field" value={p.spo2} onChange={e => set("spo2", +e.target.value)} /></Field>
            </div>
            <p className="text-xs text-gray-600 mt-1">Eosinophils: &lt;100 low, 100–299 intermediate, ≥300 high.</p>
            <div className="mt-3"><Field label="Other results"><textarea className="field" rows={2} value={p.labNotes} onChange={e => set("labNotes", e.target.value)} /></Field></div>

            <h3 className="text-lg mb-2 mt-6">6. Chest X-ray</h3>
            <div className="grid sm:grid-cols-2 gap-x-6">
              <div><div className="label">Findings supportive of COPD</div>
                {cxrSupportive.map(c => <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={p.cxr.includes(c)} onChange={() => toggle("cxr", c)} />{c}</label>)}</div>
              <div><div className="label">Findings suggesting another or coexisting condition</div>
                {cxrAlternative.map(c => <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={p.cxr.includes(c)} onChange={() => toggle("cxr", c)} />{c}</label>)}</div>
            </div>
            <div className="mt-3"><Field label="CXR notes"><textarea className="field" rows={2} value={p.cxrNotes} onChange={e => set("cxrNotes", e.target.value)} /></Field></div>

            <button className="btn mt-6" onClick={() => { setDone(true); flash("Assessment completed. Open Diagnosis & Treatment for recommendations."); }}>Complete Assessment</button>
          </section>
        )}

        {page === "Diagnosis & Treatment" && (
          <section>
            <h2 className="section-header">Diagnosis &amp; Treatment Recommendations</h2>
            {!done ? (
              <div className="box-warn">Complete the Clinical Assessment first.</div>
            ) : (
              <>
                <div className={r.confirmed ? "box-ok" : "box-bad"}><b>{r.diagnosis}</b></div>
                <div className="grid sm:grid-cols-3 gap-4 my-4">
                  <div className="border rounded-lg p-4"><div className="text-sm text-gray-600">GOLD group</div><div className="text-3xl">{r.group}</div><div className="text-sm">{g.name}</div></div>
                  <div className="border rounded-lg p-4"><div className="text-sm text-gray-600">Airflow limitation</div><div className="text-3xl">{r.stage}</div><div className="text-sm">FEV1 {r.fev1Pct.toFixed(0)}% predicted</div></div>
                  <div className="border rounded-lg p-4"><div className="text-sm text-gray-600">Symptom burden</div><div className="text-3xl">{r.cat >= 10 || p.mmrc >= 2 ? "High" : "Low"}</div><div className="text-sm">CAT {r.cat}, mMRC {p.mmrc}</div></div>
                </div>

                {r.cxrSupport.length > 0 && <p className="text-sm mb-2">CXR findings supportive of COPD: {r.cxrSupport.join(", ")}.</p>}

                <h3 className="text-lg mt-4 mb-2">Treatment strategy</h3>
                <div className="box-ok"><b>{treatmentSummary(r)}</b><p className="text-sm mt-2">{g.rationale}</p></div>

                <h3 className="text-lg mt-4 mb-2">Medication options</h3>
                <ul className="list-disc pl-6 space-y-1">{g.options.map(o => <li key={o}>{o}</li>)}</ul>
                {r.triple && r.group !== "A" && <p className="mt-2">Triple therapy applies here. ICS adverse effects include pneumonia, oropharyngeal candidiasis, cataracts and osteoporosis risk.</p>}
                {p.noLama && <p className="mt-2">LAMA unavailable: for Group E, single bronchodilator or LABA-ICS may help; LAMA-ICS has not been studied. For Groups A and B, a LABA alone is reasonable.</p>}

                {r.flags.length > 0 && (<><h3 className="text-lg mt-6 mb-2">Special considerations</h3>
                  {r.flags.map((f, i) => <div key={i} className={flagClass[f.level]}>{f.text}</div>)}</>)}

                <h3 className="text-lg mt-6 mb-2">Rescue therapy (all patients)</h3>
                <div className="box-info"><ul className="list-disc pl-5 space-y-1">{r.rescueList.map(x => <li key={x}>{x}</li>)}</ul>
                  <ul className="list-disc pl-5 space-y-1 mt-3 text-sm">{r.rescueCautions.map(x => <li key={x}>{x}</li>)}</ul></div>

                <h3 className="text-lg mt-6 mb-2">Non-pharmacologic management</h3>
                <ul className="list-disc pl-6">{nonPharm.map(x => <li key={x}>{x}</li>)}</ul>

                <div className="box-warn mt-6"><b>Follow-up:</b> adjust therapy at follow-up visits based on response. See the UpToDate topic &quot;Stable COPD: Follow-up pharmacologic management.&quot;</div>
                <button className="btn" onClick={download}>Download Report (JSON)</button>
              </>
            )}
          </section>
        )}

        {page === "Knowledge Base" && (
          <section>
            <h2 className="section-header">COPD Knowledge Base</h2>
            <p className="text-sm text-gray-600 mb-4">Source: {SOURCE}. Content lives in <code>lib/knowledge.ts</code>.</p>

            <h3 className="text-lg mb-2">GOLD ABE groups</h3>
            {(Object.keys(groups) as GroupKey[]).map(k => (
              <details key={k} className="border rounded-lg p-3 mb-2" open>
                <summary className="cursor-pointer font-medium">Group {k}: {groups[k].name}</summary>
                <ul className="list-disc pl-6 mt-2">{groups[k].criteria.map(c => <li key={c}>{c}</li>)}</ul>
                <p className="mt-2"><b>Strategy:</b> {groups[k].strategy}</p>
                <ul className="list-disc pl-6 mt-2 text-sm">{groups[k].options.map(o => <li key={o}>{o}</li>)}</ul>
              </details>
            ))}

            <h3 className="text-lg mt-6">LABAs</h3>
            <Table head={["Drug", "Dose", "Notes"]} rows={laba.map(x => [x.drug, x.dose, x.note])} />
            <h3 className="text-lg mt-6">LAMAs</h3>
            <Table head={["Drug", "Dose", "Notes"]} rows={lama.map(x => [x.drug, x.dose, x.note])} />
            <h3 className="text-lg mt-6">Spirometric severity (FEV1/FVC &lt;0.70 confirms obstruction)</h3>
            <Table head={["Stage", "FEV1 % predicted", "Severity"]} rows={gold.map(x => [x.stage, x.fev1, x.severity])} />
            <h3 className="text-lg mt-6">Eosinophils and ICS</h3>
            <Table head={["Count", "ICS effect", "Note"]} rows={eosinophilGuide.map(x => [x.range, x.effect, x.note])} />
            <h3 className="text-lg mt-6">Not recommended</h3>
            <ul className="list-disc pl-6">{obsolete.map(x => <li key={x}>{x}</li>)}</ul>
          </section>
        )}

        <p className="text-xs text-gray-600 mt-10 border-t pt-4">
          Decision support for clinicians. It does not replace clinical judgment. Not validated as a medical device. Do not enter identifiable patient data on a public deployment.
        </p>
      </main>
    </div>
  );
}
