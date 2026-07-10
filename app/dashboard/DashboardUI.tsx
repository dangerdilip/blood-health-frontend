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
import { getUserRecords, saveUserRecords, CBCRecordInput } from "../actions";

// Use environment variable if available, otherwise fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blood-health-app.onrender.com/risk/predict";

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
  hemoglobin: 0,
  wbc: 0,
  platelets: 0,
  rbc: 0,
  mcv: 0,
  mch: 0,
  mchc: 0,
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
  
  // We use `any` here or allow string in state so empty inputs don't crash
  const [records, setRecords] = useState<any[]>([{ ...defaultRecord, hemoglobin: "", wbc: "", platelets: "", rbc: "", mcv: "", mch: "", mchc: "" }]);
  const [result, setResult] = useState<APIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Load Data
  useEffect(() => {
    if (!isLoaded) return;
    
    async function loadData() {
      if (isSignedIn) {
        const res = await getUserRecords();
        if (res.records && res.records.length > 0) {
          setRecords(res.records);
        }
      } else {
        const local = localStorage.getItem("cbc_records");
        if (local) {
          try {
            setRecords(JSON.parse(local));
          } catch (e) {}
        }
      }
    }
    loadData();
  }, [isSignedIn, isLoaded]);

  // Auto-Save Data
  useEffect(() => {
    if (!isLoaded) return;
    
    const handler = setTimeout(async () => {
      // Don't save if it's completely empty or invalid
      const hasValidData = records.some(r => r.hemoglobin > 0 || r.wbc > 0);
      if (!hasValidData) return;

      if (isSignedIn) {
        setSaveStatus("Saving...");
        
        // Ensure values are numbers for DB
        const cleanRecords: CBCRecordInput[] = records.map(r => ({
          date: r.date,
          hemoglobin: Number(r.hemoglobin) || 0,
          wbc: Number(r.wbc) || 0,
          platelets: Number(r.platelets) || 0,
          rbc: Number(r.rbc) || 0,
          mcv: Number(r.mcv) || 0,
          mch: Number(r.mch) || 0,
          mchc: Number(r.mchc) || 0,
        }));
        
        await saveUserRecords(cleanRecords);
        setSaveStatus("Saved to Cloud");
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        localStorage.setItem("cbc_records", JSON.stringify(records));
        setSaveStatus("Saved Locally");
        setTimeout(() => setSaveStatus(""), 2000);
      }
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

  const addRecord = () => setRecords((prev) => [...prev, { ...defaultRecord, hemoglobin: "", wbc: "", platelets: "", rbc: "", mcv: "", mch: "", mchc: "" }]);
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
      setResult({ error: true, blood_status: "Connection Failed", recommendation: "Unable to reach the risk analysis service." });
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
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Blood Health Analytics</h1>
          <p className="text-muted-foreground text-lg">Enter complete blood count records to predict stability and risk.</p>
        </div>
        {saveStatus && (
          <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full animate-fade-in-up">
            {saveStatus}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Col: Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {!isSignedIn && isLoaded && (
            <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in-up">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">You are in Guest Mode. Data is saved locally.</p>
              </div>
              <a href="/sign-up" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-all">
                Sign Up to Save
              </a>
            </div>
          )}

          {records.map((rec, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl relative group transition-all hover:border-primary/30">
              <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Record {idx + 1}
                </h3>
                {records.length > 1 && (
                  <button 
                    onClick={() => removeRecord(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                    title="Remove Record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div className="col-span-full sm:col-span-2 md:col-span-3 mb-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Test Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={rec.date}
                    onChange={(e) => handleChange(idx, "date", e.target.value)}
                    className="w-full bg-input/50 border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  />
                </div>

                {markers.map((m) => (
                  <div key={m.key}>
                    <label className="block text-sm font-medium text-muted-foreground mb-1" title={m.label}>
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
                        className="w-full bg-input/50 border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                      {result?.normal_ranges && (
                        <div className="text-[10px] text-muted-foreground mt-1 absolute -bottom-5 right-0">
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

          <div className="flex flex-wrap gap-4">
            <button
              onClick={addRecord}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-6 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Historical Record
            </button>
            <button
              onClick={analyzeRisk}
              disabled={loading}
              className="flex-1 glow-button bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" /> Analyze Risk
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Results */}
        <div className="lg:col-span-5 space-y-6">
          {loading ? (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] border-primary/20">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 animate-pulse">Running ML Models...</h3>
              <p className="text-muted-foreground text-center text-sm">Evaluating Cox Proportional Hazards</p>
            </div>
          ) : result ? (
            <div className={`glass-card p-6 rounded-2xl border-t-4 animate-fade-in-up ${getStatusColor(result.blood_status)}`}>
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-background border ${getStatusColor(result.blood_status)}`}>
                  {result.error || result.blood_status?.includes("Critical") ? <ShieldAlert className="w-8 h-8" /> : 
                   result.blood_status?.includes("Abnormal") ? <AlertCircle className="w-8 h-8" /> : 
                   <CheckCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{result.blood_status}</h2>
                  <p className="text-muted-foreground text-sm">{result.future_risk}</p>
                </div>
              </div>

              {result.risk_score !== undefined && (
                <div className="mb-6 bg-background rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-muted-foreground">30-Day Risk Score</span>
                    <span className="text-2xl font-bold">{(result.risk_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${result.risk_score > 0.3 ? 'bg-destructive' : result.risk_score > 0.15 ? 'bg-chart-4' : 'bg-primary'}`}
                      style={{ width: `${Math.min(result.risk_score * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>
              </div>

              {result.alerts && result.alerts.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4" /> Clinical Alerts
                  </h4>
                  <ul className="space-y-2">
                    {result.alerts.map((alert, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span> {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.flags && result.flags.length > 0 && (
                <div className="bg-chart-4/5 border border-chart-4/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-chart-4 flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4" /> System Flags
                  </h4>
                  <ul className="space-y-2">
                    {result.flags.map((flag, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-chart-4 mt-0.5">•</span> {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-border/50 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Data</h3>
              <p className="text-muted-foreground text-sm max-w-[250px]">Enter your CBC records and click Analyze Risk to view your clinical assessment.</p>
            </div>
          )}

          {/* Trend Chart (if multiple records) */}
          {records.length > 1 && records.every(r => r.hemoglobin && r.wbc && r.platelets) && (
            <div className="glass-card p-6 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Key Markers Trend
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1629', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="hemoglobin" name="Hb" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="wbc" name="WBC" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
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
