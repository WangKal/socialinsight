import React from "react";

export default function Terms() {
  const today = new Date().toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Privacy Policy & Terms of Service
      </h1>

      {/* ---------------- PRIVACY POLICY ---------------- */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4">Privacy Policy</h2>
        <p className="text-sm text-gray-500 mb-6">
          Effective Date: {today}
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h3>
        <p>
          Servitium Enterprise (“we”, “us”, “our”) provides a browser-based social
          media post capture and analysis tool (the “Service”). Your privacy is
          important to us, and this Privacy Policy explains how we collect, use,
          and protect your information.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          2. Information We Collect
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account Information:</strong> Email address, full name, and
            company name.
          </li>
          <li>
            <strong>Usage Data:</strong> Public posts captured, replies analyzed,
            token and credit usage, timestamps.
          </li>
          <li>
            <strong>Device & Browser Data:</strong> IP address, browser type,
            operating system, and access logs.
          </li>
        </ul>
        <p className="mt-2">
          We do <strong>not</strong> collect plaintext passwords, private
          messages, or sensitive personal data unless explicitly provided by the
          user.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          3. How We Use Your Information
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and maintain the Service</li>
          <li>Process post analysis and display insights</li>
          <li>Manage credits, tokens, and payments</li>
          <li>Communicate service updates and notices</li>
          <li>Improve performance, reliability, and security</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Data Sharing</h3>
        <p>
          We do not sell, rent, or trade personal data. We may share anonymized
          and aggregated information for analytics or reporting. Data may be
          disclosed if required by law or to protect our legal rights.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          5. Cookies & Local Storage
        </h3>
        <p>
          We use cookies and browser storage for authentication, session
          management, and improved user experience. Disabling cookies may limit
          functionality.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Security</h3>
        <p>
          We apply reasonable technical and organizational safeguards; however,
          no system is completely secure and absolute security cannot be
          guaranteed.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Data Retention</h3>
        <p>
          Data is retained only as long as necessary for service delivery,
          compliance, or legitimate business purposes.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Minors</h3>
        <p>
          The Service is not intended for individuals under the age of 18.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">9. Changes</h3>
        <p>
          We may update this Privacy Policy periodically. The latest version will
          always be available on our website.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">10. Contact</h3>
        <p>
          For privacy-related questions, contact us at:
          <br />
          <strong>support@servitium.enterprise</strong>
        </p>
      </section>

      {/* ---------------- TERMS & CONDITIONS ---------------- */}
      <section>
        <h2 className="text-3xl font-semibold mb-4">Terms & Conditions</h2>
        <p className="text-sm text-gray-500 mb-6">
          Effective Date: {today}
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          1. Acceptance of Terms
        </h3>
        <p>
          By accessing or using the Service, you agree to these Terms. If you do
          not agree, you must not use the Service.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          2. Service Description
        </h3>
        <p>
          The Service enables capture and analysis of publicly accessible social
          media content. We are not affiliated with or endorsed by any third-
          party platform and are not responsible for their content or policies.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          3. User Responsibilities
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Only analyze content you are legally permitted to access</li>
          <li>Do not use the Service for illegal or harmful purposes</li>
          <li>Maintain confidentiality of your account credentials</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          4. Accounts & Credits
        </h3>
        <p>
          Users may receive free credits if enabled. Paid credits are purchased
          in Kenyan Shillings (KES) or United States Dollars (USD).
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>1 Credit = 1,000 tokens</li>
          <li>Indicative price: KES 10 per credit (or USD equivalent)</li>
          <li>Credits track total, used, and remaining balances</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          5. Payments & Refunds
        </h3>
        <p>
          Payments are processed via third-party providers. Prices may change,
          and currency conversions may apply. Refunds are discretionary and
          limited to verified technical failures.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          6. Disclaimers & Limitation of Liability
        </h3>
        <p>
          The Service is provided “as is” without warranties of any kind. We do
          not guarantee accuracy or completeness of analysis results.
        </p>
        <p className="mt-2">
          To the maximum extent permitted by law, Servitium Enterprise shall not
          be liable for direct, indirect, incidental, or consequential damages
          arising from:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Analysis inaccuracies</li>
          <li>Platform changes or removed content</li>
          <li>Token or credit loss due to technical issues</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          7. Intellectual Property
        </h3>
        <p>
          All software, trademarks, and content belong to Servitium Enterprise.
          Unauthorized copying or reverse engineering is prohibited.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Termination</h3>
        <p>
          We may suspend or terminate accounts for violations. Upon termination,
          all credits and access are forfeited.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          9. Governing Law
        </h3>
        <p>
          These Terms are governed by the laws of the Republic of Kenya. Disputes
          shall be resolved in Kenyan courts.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">
          10. Changes to Terms
        </h3>
        <p>
          Continued use of the Service after updates constitutes acceptance of
          the revised Terms.
        </p>
      </section>
    </div>
  );
}
