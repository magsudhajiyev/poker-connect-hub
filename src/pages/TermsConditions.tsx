
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Terms & Conditions
          </h1>
          <p className="text-slate-400">Last updated: March 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-lg p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using PokerConnect ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. Use License</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Permission is granted to temporarily use PokerConnect for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. User Accounts</h2>
              <p className="text-slate-300 leading-relaxed">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. Content Guidelines</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Users are responsible for the content they share on PokerConnect. We reserve the right to remove content that:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Violates any applicable laws or regulations</li>
                <li>Contains hate speech, harassment, or discriminatory content</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains spam or malicious content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Privacy</h2>
              <p className="text-slate-300 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Disclaimer</h2>
              <p className="text-slate-300 leading-relaxed">
                The materials on PokerConnect are provided on an 'as is' basis. PokerConnect makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. Limitations</h2>
              <p className="text-slate-300 leading-relaxed">
                In no event shall PokerConnect or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PokerConnect, even if PokerConnect or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. Governing Law</h2>
              <p className="text-slate-300 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">9. Changes to Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to update these Terms & Conditions at any time. When we do, we will revise the updated date at the top of this page. Your continued use of the Service after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">10. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at terms@pokerconnect.com.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
