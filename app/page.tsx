import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Activity, TrendingUp, AlertTriangle, ArrowRight, Shield, Microscope, BarChart3 } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

export default async function HomePage() {
  const { userId } = await auth();
  const targetHref = userId ? "/dashboard" : "/dashboard"; // Changed to dashboard so guests can enter

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 medical-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Blood Health</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!userId ? (
              <>
                <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Advanced Clinical Decision Support
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
            Precision Hematology <br className="hidden lg:block" />
            <span className="gradient-text">Analytics Engine</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your Complete Blood Count (CBC) records and leverage our advanced Cox Proportional Hazards model to predict risks, identify longitudinal trends, and provide clinical decision support.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={targetHref}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Analyze CBC Data <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Risk Assessment</h2>
            <p className="text-muted-foreground">Integrating multiple biomarkers for accurate prognostic modeling.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="medical-card p-8 rounded-2xl transition-all hover:border-primary/30 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Microscope className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Factor Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluates Hemoglobin, WBC, Platelets, and RBC indices concurrently to detect complex hematological pathologies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="medical-card p-8 rounded-2xl transition-all hover:border-primary/30 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Longitudinal Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitors patient data over time, establishing individualized baselines to detect subtle physiological shifts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="medical-card p-8 rounded-2xl transition-all hover:border-primary/30 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Early Warning System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Triggers clinical alerts when biomarkers cross critical thresholds, enabling proactive medical intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Secure & Confidential</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Patient data is processed in-memory for risk prediction. We employ industry-standard encryption and do not share health information with third parties.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground">
        <p className="text-sm">© {new Date().getFullYear()} Blood Health Analytics. For demonstration and clinical support modeling only.</p>
      </footer>
    </main>
  );
}
