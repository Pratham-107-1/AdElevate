import Layout from "../components/layout/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-navy to-sapphire px-5 py-16 text-center">
        <h1 className="font-heading text-3xl font-black text-white mb-3">About Adelevate</h1>
        <p className="mx-auto max-w-lg text-white/65">
          India's trusted business & service marketplace, connecting verified local
          providers with customers who need them.
        </p>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-12 text-[15px] leading-relaxed text-charcoal">
        <p className="mb-4">
          Adelevate helps local businesses get discovered and helps customers find
          services they can trust. Every ad on the platform goes through admin
          review before it goes live, and providers can be reached directly through
          each listing.
        </p>
        <p>
          Have questions or feedback? Reach out any time - we're always looking to
          make the marketplace better for both providers and customers.
        </p>
      </div>
    </Layout>
  );
}
