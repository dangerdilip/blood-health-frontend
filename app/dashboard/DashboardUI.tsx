"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { Activity, AlertCircle, TrendingUp, CheckCircle, Plus, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// Use environment variable if available, otherwise fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blood-health-app.onrender.com/risk/predict";

type CBCRecordInput = {
  date: string;
  hemoglobin: number | "";
  wbc: number | "";
  platelets: number | "";
  rbc: number | "";
  mcv: number | "";
  mch: number | "";
  mchc: number | "";
};

type APIResult = {
  error?: boolean;
  blood_status?: string;
  future_risk?: string;
  recommendation?: string;
  risk_score?: number;
  alerts?: string[];
  flags?: string[];
  normal_ranges?: Record<string, { min: number; max: number; unit: string }>;
  records_submitted?: number;
  min_records_for_trend?: number;
};

const defaultRecord: CBCRecordInput = {
  date: new Date().toISOString().split("T")[0],
  hemoglobin: "",
  wbc: "",
  platelets: "",
  rbc: "",
  mcv: "",
  mch: "",
  mchc: "",
};

const markers = [
  { key: "hemoglobin", label: "Hemoglobin", short: "Hb" },
  { key: "wbc", label: "White Blood Cells", short: "WBC" },
  { key: "platelets", label: "Platelets", short: "PLT" },
  { key: "rbc", label: "Red Blood Cells", short: "RBC" },
  { key: "mcv", label: "MCV", short: "MCV" },
  { key: "mch", label: "MCH", short: "MCH" },
  { key: "mchc", label: "MCHC", short: "MCHC" },
];

export default function DashboardUI() {
  const { isSignedIn, isLoaded } = useAuth();
  
  const [records, setRecords] = useState<any[]>([{ ...defaultRecord }]);
  const [result, setResult] = useState<APIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Load Data from LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    function loadData() {
      const storageKey = isSignedIn ? "cbc_records_user" : "cbc_records_guest";
      const local = localStorage.getItem(storageKey);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) {
            setRecords(parsed);
          }
        } catch (e) {
          console.error("Failed to parse local records");
        }
      }
    }
    loadData();
  }, [isSignedIn, isLoaded]);

  // Auto-Save Data to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    const handler = setTimeout(() => {
      // Don't save if it's completely empty
      const hasValidData = records.some(r => Number(r.hemoglobin) > 0 || Number(r.wbc) > 0);
      if (!hasValidData) return;

      const storageKey = isSignedIn ? "cbc_records_user" : "cbc_records_guest";
      localStorage.setItem(storageKey, JSON.stringify(records));
      
      setSaveStatus("Saved Locally");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 1500);
    
    return () => clearTimeout(handler);
  }, [records, isSignedIn, isLoaded]);


  const handleChange = (index: number, field: string, value: string) => {
    setValidationError("");
    let finalValue: any = value;
    if (field !== "date") {
      if (value === "") finalValue = "";
      else {
        const num = Number(value);
        if (num < 0) return;
        finalValue = num;
      }
    }
    setRecords((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: finalValue } : r)));
  };

  const addRecord = () => setRecords((prev) => [...prev, { ...defaultRecord }]);
  const removeRecord = (index: number) => setRecords((prev) => prev.filter((_, i) => i !== index));

  const validateRecords = () => {
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (!rec.date) return `Record ${i + 1}: Date is required.`;
      for (const m of markers) {
        if (rec[m.key] === "" || Number(rec[m.key]) <= 0) {
          return `Record ${i + 1}: ${m.label} is required and must be > 0.`;
        }
      }
    }
    return "";
  };

  const analyzeRisk = async () => {
    const error = validateRecords();
    if (error) {
      setValidationError(error);
      return;
    }

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
    } catch {
      setResult({ error: true, blood_status: "Connection Failed", recommendation: "Unable to reach the clinical analysis service." });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "text-muted-foreground";
    if (status.includes("Critical") || status.includes("Failed") || status.includes("Invalid")) return "text-destructive border-destructive";
    if (status.includes("Abnormal")) return "text-chart-4 border-chart-4";
    return "text-primary border-primary";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Clinical Dashboard</h1>
          <p className="text-muted-foreground">Enter Complete Blood Count (CBC) history for prognostic risk modeling.</p>
        </div>
        {saveStatus && (
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-fade-in-up">
            <CheckCircle className="w-3.5 h-3.5 text-primary" /> {saveStatus}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Col: Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {!isSignedIn && isLoaded && (
            <div className="bg-secondary border border-border text-foreground px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in-up shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">Guest Mode: Data is saved to your browser.</p>
              </div>
              <a href="/sign-up" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-all shadow-sm">
                Sign Up
              </a>
            </div>
          )}

          {records.map((rec, idx) => (
            <div key={idx} className="medical-card p-6 rounded-xl relative group transition-all">
              <div className="flex justify-between items-center mb-6 border-b border-border/60 pb-4">
                <h3 className="text-md font-semibold flex items-center gap-2 text-foreground">
                  <Activity className="w-4 h-4 text-primary" /> CBC Record {idx + 1}
                </h3>
                {records.length > 1 && (
                  <button 
                    onClick={() => removeRecord(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                    title="Remove Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div className="col-span-full sm:col-span-2 md:col-span-3 mb-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Test Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={rec.date}
                    onChange={(e) => handleChange(idx, "date", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm shadow-sm"
                  />
                </div>

                {markers.map((m) => (
                  <div key={m.key}>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5" title={m.label}>
                      {m.short}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="0.0"
                        value={rec[m.key]}
                        onChange={(e) => handleChange(idx, m.key, e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm shadow-sm"
                      />
                      {result?.normal_ranges && (
                        <div className="text-[10px] text-muted-foreground mt-1 absolute -bottom-5 right-0 font-mono">
                          {result.normal_ranges[m.key].min}-{result.normal_ranges[m.key].max}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {validationError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in-up">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{validationError}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={addRecord}
              className="flex-1 bg-background hover:bg-secondary text-foreground border border-border px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" /> Add Historical Record
            </button>
            <button
              onClick={analyzeRisk}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" /> Run Assessment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Results */}
        <div className="lg:col-span-5 space-y-6">
          {loading ? (
            <div className="medical-card p-8 rounded-xl flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Executing Models</h3>
              <p className="text-muted-foreground text-center text-sm">Evaluating Cox Proportional Hazards</p>
            </div>
          ) : result ? (
            <div className={`medical-card p-6 rounded-xl border-t-4 animate-fade-in-up ${getStatusColor(result.blood_status)}`}>
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-background border shadow-sm ${getStatusColor(result.blood_status)}`}>
                  {result.error || result.blood_status?.includes("Critical") ? <ShieldAlert className="w-7 h-7" /> : 
                   result.blood_status?.includes("Abnormal") ? <AlertCircle className="w-7 h-7" /> : 
                   <CheckCircle className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{result.blood_status}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{result.future_risk}</p>
                </div>
              </div>

              {result.risk_score !== undefined && (
                <div className="mb-6 bg-background rounded-lg p-4 border border-border shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">30-Day Prognostic Score</span>
                    <span className="text-xl font-bold text-foreground">{(result.risk_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${result.risk_score > 0.3 ? 'bg-destructive' : result.risk_score > 0.15 ? 'bg-chart-4' : 'bg-primary'}`}
                      style={{ width: `${Math.min(result.risk_score * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Clinical Recommendation</h4>
                  <p className="text-sm text-foreground leading-relaxed">{result.recommendation}</p>
                </div>
              </div>

              {result.alerts && result.alerts.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-3.5 h-3.5" /> Critical Findings
                  </h4>
                  <ul className="space-y-2">
                    {result.alerts.map((alert, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span> {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.flags && result.flags.length > 0 && (
                <div className="bg-chart-4/10 border border-chart-4/20 rounded-lg p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-chart-4 flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-3.5 h-3.5" /> System Flags
                  </h4>
                  <ul className="space-y-2">
                    {result.flags.map((flag, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-chart-4 mt-0.5">•</span> {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="medical-card p-8 rounded-xl flex flex-col items-center justify-center min-h-[400px] border-dashed text-center bg-background/50">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-md font-semibold text-foreground mb-2">Awaiting Patient Data</h3>
              <p className="text-muted-foreground text-sm max-w-[250px]">Enter CBC records and run assessment to view clinical insights.</p>
            </div>
          )}

          {/* Trend Chart (if multiple records) */}
          {records.length > 1 && records.every(r => r.hemoglobin && r.wbc && r.platelets) && (
            <div className="medical-card p-6 rounded-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-md font-semibold mb-6 flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4 text-primary" /> Longitudinal Biomarker Trends
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-50" />
                    <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickMargin={10} />
                    <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="hemoglobin" name="Hb" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="wbc" name="WBC" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="platelets" name="PLT" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
