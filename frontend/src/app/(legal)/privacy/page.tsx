import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trainix collects, uses, and protects your data.",
};

const LAST_UPDATED = "August 18, 2026";

export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-strong sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <Section title="1. What we collect">
        <p>To create an account and provide the Service, we collect:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Account information:</strong> name, email address, date of birth, gender, and password (stored as a salted hash — we never store or can see your actual password).</li>
          <li><strong>Fitness and health data:</strong> height, weight, target weight, fitness level, primary goal, workout completion history, and nutrition tracking (meals logged, water intake).</li>
          <li><strong>Body-scan photos and derived metrics:</strong> if you use the AI body-scan feature, we process the photo you upload to estimate body-composition metrics (e.g. body fat percentage, muscle mass, waist-to-hip ratio). The photo and derived metrics are stored so you can track progress over time.</li>
          <li><strong>Usage data:</strong> basic technical data like IP address and browser type, collected automatically to keep the Service secure and working correctly.</li>
        </ul>
      </Section>

      <Section title="2. How we use your data">
        <p>We use your data to: operate your account and authenticate you; generate your personalized workout and nutrition plans and body-scan analysis using AI; send you in-app reminders and notifications (which you can turn off in your profile settings); maintain the security and reliability of the Service; and, if you subscribe to a paid plan, process your payment through our payment processor.</p>
        <p>We do not sell your personal data, and we do not use your health or body-scan data for advertising.</p>
      </Section>

      <Section title="3. Who we share it with">
        <p>We share data only with the service providers that help us run Trainix, under contracts that limit their use of your data to providing that service:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>AI processing:</strong> photos and fitness/nutrition data are sent to our AI provider (OpenAI) to generate your plans and body-scan analysis.</li>
          <li><strong>Cloud storage:</strong> photos are stored using Amazon Web Services (S3 and CloudFront).</li>
          <li><strong>Hosting:</strong> our application infrastructure runs on Render and Vercel.</li>
          <li><strong>Payments:</strong> if you subscribe, your payment details are handled directly by our payment processor (Stripe) — we never see or store your full card number.</li>
        </ul>
        <p>We don't share your data with advertisers or data brokers. We may disclose data if required by law or to protect the safety of our users.</p>
      </Section>

      <Section title="4. Cookies">
        <p>We use a small number of strictly necessary cookies to keep you signed in (an authentication token). These aren't used for advertising or cross-site tracking. If we add analytics or error-monitoring tools that use cookies, we'll update this policy and, where required, ask for your consent first.</p>
      </Section>

      <Section title="5. Data retention">
        <p>We keep your data for as long as your account is active. If you delete your account, we permanently delete your profile, measurements, plans, and notifications. Some minimal records may be retained where we're legally required to (for example, billing records for tax purposes).</p>
      </Section>

      <Section title="6. Your rights">
        <p>You can view and edit most of your data directly in your profile. You can delete your account at any time from your profile settings, which permanently erases your fitness data. Depending on where you live, you may also have the right to request a copy of your data or object to certain processing — contact us and we'll help.</p>
      </Section>

      <Section title="7. Security">
        <p>We use industry-standard practices to protect your data, including encrypted connections (HTTPS), hashed passwords, and access controls limiting who can reach production data. No system is perfectly secure, but we take reasonable steps to protect your information and to fix issues quickly when we find them.</p>
      </Section>

      <Section title="8. Children">
        <p>Trainix is not intended for anyone under 16, and we don't knowingly collect data from children under that age.</p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>If we make material changes to how we handle your data, we'll notify you in-app before the changes take effect.</p>
      </Section>

      <Section title="10. Contact">
        <p>Questions about this policy or your data? Reach us at <a className="link" href="mailto:privacy@trainix.app">privacy@trainix.app</a>.</p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-strong">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-muted">{children}</div>
    </section>
  );
}
