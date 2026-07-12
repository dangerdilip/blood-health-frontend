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
import { Activity, AlertCircle, TrendingUp, CheckCircle, Plus, Trash2, ShieldAlert, Droplet, Database, FlaskConical } from "lucide-react";
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
  const [activeMetric, setActiveMetric] = useState("hemoglobin");

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
    <>
      {/* Animated Backgrounds */}
      <div className="fixed inset-0 z-[-1] pointer-events-none hidden dark:block bg-dark-mesh"></div>
      <div className="fixed inset-0 z-[-1] pointer-events-none block dark:hidden bg-light-mesh"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up relative z-10">
        <div className="flex justify-between items-end mb-10 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter mb-2 text-foreground drop-shadow-sm">Clinical Dashboard</h1>
            <p className="text-muted-foreground font-medium">Enter Complete Blood Count (CBC) history for prognostic risk modeling.</p>
          </div>
          {saveStatus && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in-up shadow-sm border border-primary/20 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4" /> {saveStatus}
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Col: Forms */}
          <div className="lg:col-span-7 space-y-8">
            
            {!isSignedIn && isLoaded && (
              <div className="bg-secondary/80 backdrop-blur-md border border-border text-foreground px-5 py-4 rounded-xl flex items-center justify-between animate-fade-in-up shadow-md">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-primary" />
                  <p className="text-sm font-semibold tracking-wide">Guest Mode: Data is saved to your browser temporarily.</p>
                </div>
                <a href="/sign-up" className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Sign Up
                </a>
              </div>
            )}

            {records.map((rec, idx) => (
              <div key={idx} className="medical-card p-7 rounded-2xl relative group transition-all duration-300 hover:shadow-xl hover:border-primary/30 bg-card/90 backdrop-blur-sm border border-border/80">
                <div className="flex justify-between items-center mb-6 border-b border-border/40 pb-5">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground tracking-tight">
                    <FlaskConical className="w-5 h-5 text-primary" /> CBC Record {idx + 1}
                  </h3>
                  {records.length > 1 && (
                    <button 
                      onClick={() => removeRecord(idx)}
                      className="text-muted-foreground hover:text-destructive transition-all p-2 rounded-lg hover:bg-destructive/10 hover:shadow-sm"
                      title="Remove Record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="col-span-full sm:col-span-2 md:col-span-3 mb-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Test Date</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={rec.date}
                      onChange={(e) => handleChange(idx, "date", e.target.value)}
                      className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm shadow-inner font-medium hover:border-border"
                    />
                  </div>

                  {markers.map((m) => (
                    <div key={m.key} className="relative group/input">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2" title={m.label}>
                        <Droplet className="w-3 h-3 text-primary/70" /> {m.short}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          placeholder="0.0"
                          value={rec[m.key]}
                          onChange={(e) => handleChange(idx, m.key, e.target.value)}
                          className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm shadow-inner font-mono font-medium hover:border-border"
                        />
                        {result?.normal_ranges && (
                          <div className="text-[10px] text-muted-foreground/60 mt-1 absolute -bottom-5 right-1 font-mono tracking-tighter opacity-0 group-hover/input:opacity-100 transition-opacity">
                            Ref: {result.normal_ranges[m.key].min}-{result.normal_ranges[m.key].max}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {validationError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-5 py-4 rounded-xl flex items-center gap-3 animate-fade-in-up shadow-sm backdrop-blur-sm">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm font-bold tracking-wide">{validationError}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={addRecord}
                className="flex-1 bg-background/50 hover:bg-secondary text-foreground border-2 border-border/80 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm backdrop-blur-sm"
              >
                <Plus className="w-5 h-5" /> Add Historical Record
              </button>
              <button
                onClick={analyzeRisk}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm group"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <Activity className="w-5 h-5 group-hover:animate-pulse" /> Run Assessment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Col: Results */}
          <div className="lg:col-span-5 space-y-8">
            {loading ? (
              <div className="medical-card p-12 rounded-2xl flex flex-col items-center justify-center min-h-[450px] shadow-2xl border border-border/50 bg-card/80 backdrop-blur-md">
                <div className="relative w-32 h-32 flex items-center justify-center mb-10">
                  <div className="blood-drop"></div>
                  <div className="blood-ripple"></div>
                </div>
                <h3 className="text-2xl font-extrabold mb-3 text-foreground tracking-tight animate-pulse">Analyzing Biomarkers</h3>
                <p className="text-muted-foreground text-center text-sm font-semibold max-w-[250px]">Executing Cox Proportional Hazards and multifactor risk models...</p>
              </div>
            ) : result ? (
              <div className={`medical-card p-8 rounded-2xl border-t-8 shadow-2xl bg-card/95 backdrop-blur-md animate-fade-in-up ${getStatusColor(result.blood_status)}`}>
                <div className="flex items-start gap-5 mb-8">
                  <div className={`p-4 rounded-2xl bg-background border shadow-md ${getStatusColor(result.blood_status)}`}>
                    {result.error || result.blood_status?.includes("Critical") ? <ShieldAlert className="w-8 h-8" /> : 
                     result.blood_status?.includes("Abnormal") ? <AlertCircle className="w-8 h-8" /> : 
                     <CheckCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">{result.blood_status}</h2>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">{result.future_risk}</p>
                  </div>
                </div>

                {result.risk_score !== undefined && (
                  <div className="mb-8 bg-background/50 rounded-xl p-5 border border-border/80 shadow-inner">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">30-Day Prognostic Score</span>
                      <span className="text-2xl font-black text-foreground drop-shadow-sm">{(result.risk_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden shadow-inner border border-border/20">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${result.risk_score > 0.3 ? 'bg-destructive' : result.risk_score > 0.15 ? 'bg-chart-4' : 'bg-primary'}`}
                        style={{ width: `${Math.min(result.risk_score * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Clinical Recommendation</h4>
                    <p className="text-sm font-medium text-foreground leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>

                {result.alerts && result.alerts.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 mb-6 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-destructive flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4" /> Critical Findings
                    </h4>
                    <ul className="space-y-3">
                      {result.alerts.map((alert, i) => (
                        <li key={i} className="text-sm font-medium text-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5 font-bold">•</span> {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.flags && result.flags.length > 0 && (
                  <div className="bg-chart-4/5 border border-chart-4/20 rounded-xl p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-chart-4 flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4" /> System Flags
                    </h4>
                    <ul className="space-y-3">
                      {result.flags.map((flag, i) => (
                        <li key={i} className="text-sm font-medium text-foreground flex items-start gap-2">
                          <span className="text-chart-4 mt-0.5 font-bold">•</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="medical-card p-12 rounded-2xl flex flex-col items-center justify-center min-h-[450px] border-dashed border-2 border-border/60 text-center bg-card/30 backdrop-blur-sm relative overflow-hidden group shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-8 shadow-inner border border-border/50 group-hover:scale-110 transition-transform duration-500">
                  <Database className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">Awaiting Clinical Data</h3>
                <p className="text-muted-foreground text-sm max-w-[280px] font-medium leading-relaxed">Enter your CBC records on the left and run the assessment to view advanced insights and prognostic scores.</p>
              </div>
            )}

            {/* Trend Chart (if multiple records) */}
            {records.length > 1 && records.every(r => r.hemoglobin && r.wbc && r.platelets) && (
              <div className="medical-card p-8 rounded-2xl shadow-xl bg-card/95 backdrop-blur-md border border-border/80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground tracking-tight">
                    <TrendingUp className="w-5 h-5 text-primary" /> Longitudinal Biomarker Trends
                  </h3>
                  <div className="flex bg-background/50 p-1 rounded-lg border border-border/50">
                    <button 
                      onClick={() => setActiveMetric("hemoglobin")}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${activeMetric === 'hemoglobin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Hb
                    </button>
                    <button 
                      onClick={() => setActiveMetric("wbc")}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${activeMetric === 'wbc' ? 'bg-[#0284c7] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      WBC
                    </button>
                    <button 
                      onClick={() => setActiveMetric("platelets")}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${activeMetric === 'platelets' ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      PLT
                    </button>
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={records}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-30" vertical={false} />
                      <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground font-mono" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="currentColor" className="text-muted-foreground font-mono" fontSize={11} axisLine={false} tickLine={false} tickMargin={12} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      
                      {activeMetric === "hemoglobin" && (
                        <Line type="monotone" dataKey="hemoglobin" name="Hb" stroke="#0d9488" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: 'var(--card)' }} activeDot={{ r: 7 }} animationDuration={1000} />
                      )}
                      {activeMetric === "wbc" && (
                        <Line type="monotone" dataKey="wbc" name="WBC" stroke="#0284c7" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: 'var(--card)' }} activeDot={{ r: 7 }} animationDuration={1000} />
                      )}
                      {activeMetric === "platelets" && (
                        <Line type="monotone" dataKey="platelets" name="PLT" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: 'var(--card)' }} activeDot={{ r: 7 }} animationDuration={1000} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
