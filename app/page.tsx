import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Activity, TrendingUp, AlertTriangle, ArrowRight, Shield, Microscope } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

export default async function HomePage() {
  const { userId } = await auth();
  const targetHref = "/dashboard"; // Changed to dashboard so guests can enter

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar with Frosted Glass */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Activity className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-lg font-bold tracking-tight">Blood Health</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!userId ? (
              <>
                <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] bg-primary/10 blur-[100px] opacity-70 animate-pulse"></div>
        <div className="absolute left-1/4 top-32 -z-10 w-[400px] h-[400px] rounded-[100%] bg-blue-500/10 blur-[120px] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Advanced Clinical Decision Support
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter mb-6 text-foreground drop-shadow-sm">
            Precision Hematology <br className="hidden lg:block" />
            <span className="gradient-text pb-2">Analytics Engine</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Upload your Complete Blood Count (CBC) records and leverage our advanced prognostic model to predict risks, identify trends, and deliver clinical insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={targetHref}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Analyze CBC Data <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Floating Dashboard Preview */}
          <div className="animate-float relative z-20 mx-auto mt-20 max-w-5xl rounded-2xl border border-border/50 bg-background/50 p-2 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl overflow-hidden shadow-inner border border-border/30 bg-card">
              <Image 
                src="/dashboard-preview.png" 
                alt="Blood Health Dashboard Preview" 
                width={1200} 
                height={800} 
                className="w-full object-cover"
                priority
              />
            </div>
            {/* Decorative Glow behind the image */}
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30 border-t border-border/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Comprehensive Risk Assessment</h2>
            <p className="text-muted-foreground text-lg">Integrating multiple biomarkers for accurate prognostic modeling.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="medical-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 group bg-card">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary/10">
                <Microscope className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Multi-Factor Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluates Hemoglobin, WBC, Platelets, and RBC indices concurrently to detect complex hematological pathologies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="medical-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 group bg-card">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary/10">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Longitudinal Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitors patient data over time, establishing individualized baselines to detect subtle physiological shifts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="medical-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 group bg-card">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary/10">
                <AlertTriangle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Early Warning System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Triggers clinical alerts when biomarkers cross critical thresholds, enabling proactive medical intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/50 mb-8 border border-border shadow-sm">
            <Shield className="w-10 h-10 text-primary opacity-90" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Secure & Confidential</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            Patient data is processed in-memory for risk prediction. We employ industry-standard encryption and do not share health information with third parties.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Activity className="w-5 h-5" />
            <span className="font-bold">Blood Health</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Blood Health Analytics. Clinical support modeling demo.
          </p>
        </div>
      </footer>
    </main>
  );
}
