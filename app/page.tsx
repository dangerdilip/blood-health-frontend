import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Activity, TrendingUp, AlertTriangle, ArrowRight, Shield, Microscope, BarChart3 } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

export default async function HomePage() {
  const { userId } = await auth();
  const targetHref = userId ? "/dashboard" : "/sign-in";

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">Blood Health</span>
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
                  className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            ML-Powered Health Analytics
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Understand Your Blood <br />
            <span className="gradient-text">Before It's Too Late.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your Complete Blood Count (CBC) records and let our advanced Cox Proportional Hazards model predict risks, identify trends, and provide clinical decision support.
          </p>
          
          <Link href={targetHref} className="inline-flex">
            <div className="glow-button bg-card border border-white/10 px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 hover:text-primary transition-colors">
              Analyze My Blood <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-secondary/50 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Analysis</h2>
            <p className="text-muted-foreground">Built with strict clinical reference ranges and robust ML architecture.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Microscope className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clinical Precision</h3>
              <p className="text-muted-foreground leading-relaxed">
                Evaluates your data against strict medical thresholds, identifying abnormalities with high confidence.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trend Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                By analyzing multiple CBC tests over time, our model detects subtle physiological stress patterns before they become critical.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proactive Alerts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instantly flags extreme values like severe neutropenia or life-threatening anemia with immediate recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-white/5">
        <p className="max-w-2xl mx-auto px-6">
          <strong>Disclaimer:</strong> This application provides clinical decision support based on machine learning. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
        </p>
      </footer>
    </main>
  );
}
