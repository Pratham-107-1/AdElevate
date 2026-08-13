import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";

export default function ComingSoon({ title, note }) {
  return (
    <Layout>
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-3 text-4xl">🚧</div>
        <h1 className="font-heading text-2xl font-extrabold text-navy mb-2">{title}</h1>
        <p className="text-sm text-slate-500">
          {note || "This page hasn't been built yet — send its Figma reference and I'll build it next."}
        </p>
        <Link to="/" className="mt-6 text-sm font-semibold text-coral">← Back to Home</Link>
      </div>
    </Layout>
  );
}
