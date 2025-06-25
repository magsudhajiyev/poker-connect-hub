import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400">Last updated: March 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-lg p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Information We Collect</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, share poker hands, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Name and email address</li>
                <li>Profile information and preferences</li>
                <li>Poker hands and game data you share</li>
                <li>Communications with us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. Information Sharing</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. Data Security</h2>
              <p className="text-slate-300 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Cookies and Tracking</h2>
              <p className="text-slate-300 leading-relaxed">
                We use cookies and similar tracking technologies to collect and use personal information about you. You can control the use of cookies at the individual browser level, but disabling cookies may limit your use of certain features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Your Rights</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. Children's Privacy</h2>
              <p className="text-slate-300 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. International Data Transfers</h2>
              <p className="text-slate-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">9. Changes to This Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">10. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@pokerconnect.com.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;