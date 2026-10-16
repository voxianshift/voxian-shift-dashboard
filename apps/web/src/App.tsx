import { SCORING_VERSION } from "@voxian/shared";

export function App() {
  return (
    <main className="min-h-dvh bg-slate-950 p-6 text-slate-100">
      <h1 className="text-2xl font-semibold text-cyan-300">Voxian Shift</h1>
      <p className="text-sm text-slate-400">Scoring v{SCORING_VERSION}</p>
    </main>
  );
}
