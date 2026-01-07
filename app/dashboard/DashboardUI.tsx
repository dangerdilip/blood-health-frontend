"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "https://blood-health-app.onrender.com/risk/predict";

/* ---------------- TYPES ---------------- */

type CBCRecord = {
  date: string;
  hemoglobin: number | "";
  wbc: number | "";
  platelets: number | "";
  rbc: number | "";
  mcv: number | "";
  mch: number | "";
  mchc: number | "";
};

/* ---------------- STYLES ---------------- */

const container: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "32px 20px",
};

const header: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  marginBottom: 8,
  color: "#0f172a",
};

const subHeader: React.CSSProperties = {
  color: "#475569",
  marginBottom: 28,
};

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 20,
  marginBottom: 24,
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
};

const fieldGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 14,
};

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: "#334155",
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
};

const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #2563eb, #1e40af)",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: 10,
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  background: "#f8fafc",
  color: "#2563eb",
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #c7d2fe",
  fontWeight: 500,
  cursor: "pointer",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 28,
};

/* ---------------- COMPONENT ---------------- */

export default function DashboardUI() {
  const [records, setRecords] = useState<CBCRecord[]>([
    {
      date: "",
      hemoglobin: "",
      wbc: "",
      platelets: "",
      rbc: "",
      mcv: "",
      mch: "",
      mchc: "",
    },
  ]);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  /* ---------- HANDLERS ---------- */

  const handleChange = (
    index: number,
    field: keyof CBCRecord,
    value: string
  ) => {
    let finalValue: any = value;

    if (field !== "date") {
      if (value === "") finalValue = "";
      else {
        const num = Number(value);
        if (num < 0) return;
        finalValue = num;
      }
    }

    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: finalValue } : r))
    );
  };

  const addRecord = () => {
    setRecords((prev) => [
      ...prev,
      {
        date: "",
        hemoglobin: "",
        wbc: "",
        platelets: "",
        rbc: "",
        mcv: "",
        mch: "",
        mchc: "",
      },
    ]);
  };

  const removeLastRecord = () => {
    if (records.length > 1) {
      setRecords((prev) => prev.slice(0, -1));
    }
  };

  const analyzeRisk = async () => {
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        patient_id: "frontend-user",
        records: records.map((r) => ({
          ...r,
          hemoglobin: Number(r.hemoglobin),
          wbc: Number(r.wbc),
          platelets: Number(r.platelets),
          rbc: Number(r.rbc),
          mcv: Number(r.mcv),
          mch: Number(r.mch),
          mchc: Number(r.mchc),
        })),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
      if (records.length >= 2) setShowChart(true);
    } catch {
      setResult({ error: "Failed to connect to backend" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div style={container}>
      <h1 style={header}>Blood Health Risk Analyzer</h1>
      <p style={subHeader}>
        Enter one or more CBC reports to assess blood stability and future risk.
      </p>

      {records.map((rec, idx) => (
        <div key={idx} style={card}>
          <h3 style={{ marginBottom: 16 }}>
            CBC Record {idx + 1}
          </h3>

          <div style={fieldGroup}>
            <label style={label}>Test Date</label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={rec.date}
              onChange={(e) => handleChange(idx, "date", e.target.value)}
              style={input}
            />
          </div>

          {[
            ["hemoglobin", "Hemoglobin (g/dL)"],
            ["wbc", "White Blood Cells (×10³/µL)"],
            ["platelets", "Platelets (×10³/µL)"],
            ["rbc", "Red Blood Cells (million/µL)"],
            ["mcv", "MCV (fL)"],
            ["mch", "MCH (pg)"],
            ["mchc", "MCHC (g/dL)"],
          ].map(([key, labelText]) => (
            <div key={key} style={fieldGroup}>
              <label style={label}>{labelText}</label>
              <input
                type="number"
                min={0}
                value={(rec as any)[key]}
                onChange={(e) =>
                  handleChange(idx, key as keyof CBCRecord, e.target.value)
                }
                style={input}
              />
            </div>
          ))}
        </div>
      ))}

      <div style={buttonRow}>
        <button style={secondaryBtn} onClick={addRecord}>
          + Add CBC Record
        </button>
        <button style={secondaryBtn} onClick={removeLastRecord}>
          − Remove Last Record
        </button>
        <button style={primaryBtn} onClick={analyzeRisk}>
          {loading ? "Analyzing…" : "Analyze Risk"}
        </button>
      </div>

      {result && (
        <div style={card}>
          <h3>Result</h3>
          <p><b>Status:</b> {result.blood_status}</p>
          <p><b>Future Risk:</b> {result.future_risk}</p>
          <p><b>Recommendation:</b> {result.recommendation}</p>

          {result.alerts?.length > 0 && (
            <>
              <h4 style={{ marginTop: 12 }}>⚠ Clinical Alerts</h4>
              <ul>
                {result.alerts.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {records.length >= 2 && (
        <>
          <button
            style={secondaryBtn}
            onClick={() => setShowChart((s) => !s)}
          >
            {showChart ? "Hide Trend Chart" : "Show Trend Chart"}
          </button>

          {showChart && (
            <div style={{ ...card, marginTop: 16 }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={records}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="hemoglobin" stroke="#2563eb" />
                  <Line dataKey="wbc" stroke="#dc2626" />
                  <Line dataKey="platelets" stroke="#16a34a" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

