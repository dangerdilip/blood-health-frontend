import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();

  const targetHref = userId ? "/dashboard" : "/sign-in";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Blood Health Risk Analyzer
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          This is an ML-integrated clinical decision support system built using
          a large longitudinal dataset of real patient CBC records.
          <br /><br />
          By analyzing one or more Complete Blood Count (CBC) tests — including
          hemoglobin, white blood cells, platelets, RBC indices, and red cell
          morphology — the system evaluates current blood health and estimates
          the probability of future deterioration over the next 30–90 days.
        </p>

        <ul className="list-disc pl-6 text-gray-700 mb-8 space-y-2">
          <li>Trend-aware analysis using multiple CBC records</li>
          <li>Machine-learning + rule-based clinical logic</li>
          <li>Automatic detection of extreme or dangerous values</li>
          <li>Clear recommendations for monitoring or urgent follow-up</li>
        </ul>

        <Link
          href={targetHref}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Get Started
        </Link>

        <p className="text-xs text-gray-500 mt-6">
          ⚠ This tool is for clinical decision support only and does not replace
          professional medical advice.
        </p>
      </div>
    </main>
  );
}
