import { Terminal } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read our Privacy Policy to understand how Loghead collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-[#00FF94] selection:text-black">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(0,255,148,0.05),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-24 relative z-10">
        {/* Breadcrumb / Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#00FF94] transition-colors mb-8 group"
        >
          <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Return to Home</span>
        </Link>

        <header className="mb-16 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-lg">
            Last updated:{" "}
            <span className="text-zinc-400 font-mono">October 18, 2025</span>
          </p>
        </header>

        <article className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-400 prose-strong:text-white prose-strong:font-semibold">
          <p className="text-xl text-zinc-300 leading-relaxed mb-12">
            This privacy notice for <strong>Guidenco Inc</strong> (“we,” “us,”
            or “our”) describes how and why we might collect, store, use, and/or
            share (“process”) your information when you use our services
            (“Services”), including the Loghead product.
          </p>

          <p className="mb-4">
            <b>Questions or concerns?</b> Reading this privacy notice will help
            you understand your privacy rights and choices. If you do not agree
            with our policies and practices, please do not use our Services. If
            you still have any questions or concerns, please contact us at{" "}
            <a className="text-[#00FF94]" href="mailto:info@onvo.ai">
              info@onvo.ai
            </a>
            .
          </p>

          <div className="space-y-12">
            {/* SUMMARY */}
            <section>
              <h3 className="text-2xl text-white mb-4">
                SUMMARY OF KEY POINTS
              </h3>
              <p>
                This summary provides key points from our privacy notice, but
                you can find out more details about any of these topics by
                finding the section you are looking for in this document.
              </p>
              <ul className="list-disc pl-6">
                <li>
                  <strong> What personal information do we process?</strong>{" "}
                  When you visit, use, or navigate our Services, we may process
                  personal information depending on how you interact with us and
                  the Services, the choices you make, and the products and
                  features you use.
                </li>
                <li>
                  <strong>
                    Do we process any sensitive personal information?
                  </strong>{" "}
                  We do not process sensitive personal information.
                </li>
                <li>
                  <strong>
                    Do we receive any information from third parties?
                  </strong>{" "}
                  We do not receive any information from third parties.
                </li>
                <li>
                  <strong>How do we process your information?</strong> We
                  process your information to provide, improve, and administer
                  our Services, communicate with you, for security and fraud
                  prevention, and to comply with law. We may also process your
                  information for other purposes with your consent. We process
                  your information only when we have a valid legal reason to do
                  so.
                </li>
                <li>
                  <strong>
                    In what situations and with which parties do we share
                    personal information?
                  </strong>{" "}
                  We may share information in specific situations and with
                  specific third parties.
                </li>
                <li>
                  <strong>How do we keep your information safe?</strong> We have
                  organizational and technical processes and procedures in place
                  to protect your personal information. However, no electronic
                  transmission over the internet or information storage
                  technology can be guaranteed to be 100% secure, so we cannot
                  promise or guarantee that hackers, cybercriminals, or other
                  unauthorized third parties will not be able to defeat our
                  security and improperly collect, access, steal, or modify your
                  information.
                </li>
                <li>
                  <strong>What are your rights?</strong> Depending on where you
                  are located geographically, the applicable privacy law may
                  mean you have certain rights regarding your personal
                  information.
                </li>
                <li>
                  <strong>How do you exercise your rights?</strong> The easiest
                  way to exercise your rights is by emailing us at{" "}
                  <a className="text-[#00FF94]" href="mailto:support@onvo.ai">
                    {" "}
                    support@onvo.ai
                  </a>
                  , or by contacting us. <br />
                  We will consider and act upon any request in accordance with
                  applicable data protection laws. Want to learn more about what
                  we do with any information we collect? Review the privacy
                  notice in full.
                </li>
                {/* <li>
                  <strong>Your rights:</strong> vary by jurisdiction.
                </li> */}
              </ul>
            </section>

            {/* 01 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  01
                </span>
                What Information Do We Collect?
              </h3>

              <p className="font-semibold text-zinc-300">
                Personal information you disclose to us
              </p>

              <p>
                <strong>In Short:</strong> We collect personal information that
                you provide to us.
              </p>

              <p>
                We collect personal information that you voluntarily provide to
                us when you register on the Services, express an interest in
                obtaining information about us or our products and Services,
                when you participate in activities on the Services, or otherwise
                when you contact us.
              </p>

              <p>
                <strong>Personal Information Provided by You.</strong> The
                personal information that we collect depends on the context of
                your interactions with us and the Services, the choices you
                make, and the products and features you use. The personal
                information we collect may include the following:
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6">
                <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-6 list-disc pl-6">
                  <li>Names</li>
                  <li>Phone numbers</li>
                  <li>Email addresses</li>
                  <li>Mailing addresses</li>
                  <li>Usernames</li>
                  <li>Passwords</li>
                  <li>Job titles</li>
                  <li>Billing addresses</li>
                  <li>Debit/credit card numbers</li>
                </ul>
              </div>

              <p className="mt-4">
                <strong>Sensitive Information.</strong> We do not process
                sensitive information.
              </p>

              <p>
                <strong>Payment Data.</strong> We may collect data necessary to
                process your payment if you make purchases, such as your payment
                instrument number, and the security code associated with your
                payment instrument. All payment data is stored by Stripe. You
                may find their privacy notice here:{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF94] hover:underline"
                >
                  https://stripe.com/privacy
                </a>
                .
              </p>

              <p>
                <strong>Social Media Login Data.</strong> We may provide you
                with the option to register with us using your existing social
                media account details, such as Facebook or Twitter. If you
                choose to register in this way, we will collect the information
                described in the section titled{" "}
                <em>“How Do We Handle Your Social Logins?”</em>
              </p>

              <p>
                All personal information that you provide to us must be true,
                complete, and accurate, and you must notify us of any changes to
                such personal information.
              </p>

              <hr className="border-zinc-800 my-8" />

              <p className="font-semibold text-zinc-300">
                Information automatically collected
              </p>

              <p>
                <strong>In Short:</strong> Some information — such as your
                Internet Protocol (IP) address and/or browser and device
                characteristics — is collected automatically when you visit our
                Services.
              </p>

              <p>
                We automatically collect certain information when you visit,
                use, or navigate the Services. This information does not reveal
                your specific identity (like your name or contact information)
                but may include device and usage information such as IP address,
                browser and device characteristics, operating system, language
                preferences, referring URLs, device name, country, location, and
                information about how and when you use our Services. This
                information is primarily needed to maintain the security and
                operation of our Services, and for internal analytics and
                reporting purposes.
              </p>

              <p>
                Like many businesses, we also collect information through
                cookies and similar technologies. You can find out more about
                this in our Cookie Notice.
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6 space-y-4">
                <p>
                  <strong>Log and Usage Data.</strong> Service-related,
                  diagnostic, usage, and performance information collected when
                  you access or use the Services, including IP address, browser
                  type, timestamps, pages viewed, searches, feature usage, error
                  reports, and system activity.
                </p>

                <p>
                  <strong>Device Data.</strong> Information about your computer,
                  phone, tablet, or other device, including IP address, device
                  identifiers, browser type, hardware model, ISP or mobile
                  carrier, operating system, and system configuration.
                </p>

                <p>
                  <strong>Location Data.</strong> Information about your
                  device’s location, which may be precise or imprecise depending
                  on device settings. You can opt out by disabling location
                  access, but some features may not function properly.
                </p>
              </div>
            </section>

            {/* 02 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  02
                </span>
                How Do We Process Your Information?
              </h3>

              <p>
                <strong>In Short:</strong> We process your information to
                provide, improve, and administer our Services, communicate with
                you, for security and fraud prevention, and to comply with law.
                We may also process your information for other purposes with
                your consent.
              </p>

              <p>
                We process your personal information for a variety of reasons,
                depending on how you interact with our Services, including:
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6">
                <ul className="space-y-4 list-none pl-0">
                  <li className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] mt-2.5 shrink-0" />
                    <div>
                      <strong className="text-zinc-200 block mb-1">
                        Account Creation and Authentication
                      </strong>
                      <span className="text-sm">
                        We may process your information so you can create and
                        log in to your account, as well as keep your account in
                        working order.
                      </span>
                    </div>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] mt-2.5 shrink-0" />
                    <div>
                      <strong className="text-zinc-200 block mb-1">
                        Protection of Vital Interests
                      </strong>
                      <span className="text-sm">
                        We may process your information when necessary to save
                        or protect an individual’s vital interest, such as to
                        prevent harm.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* 03 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  03
                </span>
                What Legal Bases Do We Rely On to Process Your Information?
              </h3>

              <p>
                <strong>In Short:</strong> We only process your personal
                information when we believe it is necessary and we have a valid
                legal reason (i.e., legal basis) to do so under applicable law,
                such as with your consent, to comply with laws, to provide you
                with services to enter into or fulfill our contractual
                obligations, to protect your rights, or to fulfill our
                legitimate business interests.
              </p>

              <p className="font-semibold text-zinc-300 mt-6">
                If you are located in the EU or UK, this section applies to you.
              </p>

              <p>
                The General Data Protection Regulation (GDPR) and UK GDPR
                require us to explain the valid legal bases we rely on in order
                to process your personal information. As such, we may rely on
                the following legal bases:
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6">
                <ul className="space-y-4 list-none pl-0">
                  <li className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] mt-2.5 shrink-0" />
                    <div>
                      <strong className="text-zinc-200 block mb-1">
                        Consent
                      </strong>
                      <span className="text-sm">
                        We may process your information if you have given us
                        permission (i.e., consent) to use your personal
                        information for a specific purpose. You can withdraw
                        your consent at any time.
                      </span>
                    </div>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] mt-2.5 shrink-0" />
                    <div>
                      <strong className="text-zinc-200 block mb-1">
                        Legal Obligations
                      </strong>
                      <span className="text-sm">
                        We may process your information where it is necessary
                        for compliance with our legal obligations, such as
                        cooperating with law enforcement, exercising or
                        defending legal rights, or disclosing information as
                        evidence in litigation.
                      </span>
                    </div>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] mt-2.5 shrink-0" />
                    <div>
                      <strong className="text-zinc-200 block mb-1">
                        Vital Interests
                      </strong>
                      <span className="text-sm">
                        We may process your information where necessary to
                        protect your vital interests or the vital interests of a
                        third party, such as in situations involving threats to
                        safety.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <p className="font-semibold text-zinc-300 mt-8">
                If you are located in Canada, this section applies to you.
              </p>

              <p>
                We may process your information if you have given us specific
                permission (i.e., express consent) to use your personal
                information for a specific purpose, or in situations where your
                permission can be inferred (i.e., implied consent). You can
                withdraw your consent at any time.
              </p>

              <p className="mt-6">
                In some exceptional cases, we may be legally permitted under
                applicable law to process your information without your consent,
                including:
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6">
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>
                    If collection is clearly in the interests of an individual
                    and consent cannot be obtained in a timely way
                  </li>
                  <li>For investigations and fraud detection and prevention</li>
                  <li>
                    For business transactions provided certain conditions are
                    met
                  </li>
                  <li>
                    If it is contained in a witness statement and necessary to
                    assess, process, or settle an insurance claim
                  </li>
                  <li>
                    For identifying injured, ill, or deceased persons and
                    communicating with next of kin
                  </li>
                  <li>
                    If there are reasonable grounds to believe an individual has
                    been, is, or may be a victim of financial abuse
                  </li>
                  <li>
                    If collection and use with consent would compromise
                    availability or accuracy and is reasonable for investigating
                    a breach of an agreement or law
                  </li>
                  <li>
                    If disclosure is required to comply with a subpoena,
                    warrant, court order, or rules of the court
                  </li>
                  <li>
                    If it was produced by an individual in the course of their
                    employment, business, or profession and is consistent with
                    its original purpose
                  </li>
                  <li>
                    If the collection is solely for journalistic, artistic, or
                    literary purposes
                  </li>
                  <li>
                    If the information is publicly available and specified by
                    regulations
                  </li>
                </ul>
              </div>
            </section>

            {/* 04 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  04
                </span>
                When and With Whom Do We Share Your Personal Information?
              </h3>

              <p>
                <strong>In Short:</strong> We may share information in specific
                situations described in this section and/or with the following
                third parties.
              </p>

              <p>
                We may need to share your personal information in the following
                situations:
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6 space-y-6">
                <div>
                  <strong className="text-zinc-200 block mb-1">
                    Business Transfers
                  </strong>
                  <p className="text-sm">
                    We may share or transfer your information in connection
                    with, or during negotiations of, any merger, sale of company
                    assets, financing, or acquisition of all or a portion of our
                    business to another company.
                  </p>
                </div>

                <div>
                  <strong className="text-zinc-200 block mb-1">
                    Google Analytics
                  </strong>
                  <p className="text-sm">
                    We may share your information with Google Analytics to track
                    and analyze the use of the Services. The Google Analytics
                    Advertising Features that we may use include: Remarketing
                    with Google Analytics, Google Analytics Demographics and
                    Interests Reporting, and Google Display Network Impressions
                    Reporting.
                  </p>
                  <p className="text-sm mt-2">
                    To opt out of being tracked by Google Analytics across the
                    Services, visit{" "}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00FF94] hover:underline"
                    >
                      https://tools.google.com/dlpage/gaoptout
                    </a>
                    .
                  </p>
                  <p className="text-sm mt-2">
                    You can opt out of Google Analytics Advertising Features
                    through Ads Settings and Ad Settings for mobile apps. Other
                    opt-out means include{" "}
                    <a
                      href="https://optout.networkadvertising.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00FF94] hover:underline"
                    >
                      https://optout.networkadvertising.org/
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://www.networkadvertising.org/mobile-choice"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00FF94] hover:underline"
                    >
                      https://www.networkadvertising.org/mobile-choice
                    </a>
                    .
                  </p>
                  <p className="text-sm mt-2">
                    For more information on the privacy practices of Google,
                    please visit the Google Privacy & Terms page.
                  </p>
                </div>

                <div>
                  <strong className="text-zinc-200 block mb-1">
                    Google API Services
                  </strong>
                  <p className="text-sm">
                    Our use and transfer to any other app of information
                    received from Google APIs adheres to the Google API Services
                    User Data Policy, including the Limited Use requirements. We
                    only use this data to provide and improve our services and
                    do not sell it to third parties or use it for advertising
                    purposes.
                  </p>
                </div>

                <div>
                  <strong className="text-zinc-200 block mb-1">
                    AI Service
                  </strong>
                  <p className="text-sm">
                    We do not share any data directly with our AI models. Our AI
                    is solely used to write code that facilitates data
                    visualization, and no user data is shared or accessed by our
                    AI models during this process.
                  </p>
                  <p className="text-sm mt-2">
                    When you connect your data sources, you retain full control
                    over your data. Our system only reads the data necessary for
                    visualization purposes and does not store or retain any
                    sensitive information.
                  </p>
                  <p className="text-sm mt-2">
                    We follow the principle of data minimization and only
                    collect and process data that is essential for providing our
                    services.
                  </p>
                </div>
              </div>
            </section>

            {/* 05 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  05
                </span>
                Do We Use Cookies and Other Tracking Technologies?
              </h3>

              <p>
                <strong>In Short:</strong> We may use cookies and other tracking
                technologies to collect and store your information.
              </p>

              <p>
                We may use cookies and similar tracking technologies (such as
                web beacons and pixels) to access or store information. Specific
                information about how we use such technologies and how you can
                refuse certain cookies is set out in our Cookie Notice.
              </p>

              <p>
                You can review our Cookie Notice here:{" "}
                <a
                  href="https://www.loghead.dev/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF94] hover:underline"
                >
                  https://www.loghead.dev/cookies
                </a>
                .
              </p>
            </section>
            {/* 06 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  06
                </span>
                How Do We Handle Your Social Logins?
              </h3>

              <p>
                <strong>In Short:</strong> If you choose to register or log in
                to our Services using a social media account, we may have access
                to certain information about you.
              </p>

              <p>
                Our Services offer you the ability to register and log in using
                your third-party social media account details (such as Facebook
                or Twitter logins). Where you choose to do this, we will receive
                certain profile information about you from your social media
                provider.
              </p>

              <p>
                The profile information we receive may vary depending on the
                social media provider concerned, but will often include your
                name, email address, friends list, and profile picture, as well
                as other information you choose to make public on such a social
                media platform.
              </p>

              <p>
                We will use the information we receive only for the purposes
                that are described in this privacy notice or that are otherwise
                made clear to you on the relevant Services. Please note that we
                do not control, and are not responsible for, other uses of your
                personal information by your third-party social media provider.
              </p>

              <p>
                We recommend that you review their privacy notice to understand
                how they collect, use, and share your personal information, and
                how you can set your privacy preferences on their sites and
                apps.
              </p>
            </section>

            {/* 07 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  07
                </span>
                How Long Do We Keep Your Information?
              </h3>

              <p>
                <strong>In Short:</strong> We keep your information for as long
                as necessary to fulfill the purposes outlined in this privacy
                notice unless otherwise required by law.
              </p>

              <p>
                We will only keep your personal information for as long as it is
                necessary for the purposes set out in this privacy notice,
                unless a longer retention period is required or permitted by law
                (such as tax, accounting, or other legal requirements). No
                purpose in this notice will require us keeping your personal
                information for longer than the period of time in which users
                have an account with us. When we have no ongoing legitimate
                business need to process your personal information, we will
                either delete or anonymize such information, or, if this is not
                possible (for example, because your personal information has
                been stored in backup archives), then we will securely store
                your personal information and isolate it from any further
                processing until deletion is possible.
              </p>
            </section>

            {/* 08 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  08
                </span>
                HOW DO WE KEEP YOUR INFORMATION SAFE?
              </h3>

              <p>
                <strong>In Short:</strong>We aim to protect your personal
                information through a system of organizational and technical
                security measures.
              </p>

              <p>
                We have implemented appropriate and reasonable technical and
                organizational security measures designed to protect the
                security of any personal information we process. However,
                despite our safeguards and efforts to secure your information,
                no electronic transmission over the Internet or information
                storage technology can be guaranteed to be 100% secure, so we
                cannot promise or guarantee that hackers, cybercriminals, or
                other unauthorized third parties will not be able to defeat our
                security and improperly collect, access, steal, or modify your
                information. Although we will do our best to protect your
                personal information, transmission of personal information to
                and from our Services is at your own risk. You should only
                access the Services within a secure environment.
              </p>
            </section>

            {/* 09 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  09
                </span>
                DO WE COLLECT INFORMATION FROM MINORS?
              </h3>

              <p>
                <strong>In Short:</strong>We do not knowingly collect data from
                or market to children under 18 years of age.
              </p>

              <p>
                We do not knowingly solicit data from or market to children
                under 18 years of age. By using the Services, you represent that
                you are at least 18 or that you are the parent or guardian of
                such a minor and consent to such minor dependent’s use of the
                Services. If we learn that personal information from users less
                than 18 years of age has been collected, we will deactivate the
                account and take reasonable measures to promptly delete such
                data from our records. If you become aware of any data we may
                have collected from children under age 18, please contact us at
                ronnel@onvo.ai.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  10
                </span>
                What Are Your Privacy Rights?
              </h3>

              <p>
                <strong>In Short:</strong> In some regions, such as the European
                Economic Area (EEA), United Kingdom (UK), Switzerland, and
                Canada, you have rights that allow you greater access to and
                control over your personal information.
              </p>

              <p>
                You may review, change, or terminate your account at any time.
              </p>

              <p>
                In some regions (such as the EEA, UK, Switzerland, and Canada),
                you have certain rights under applicable data protection laws.
                These may include the right:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>
                  To request access and obtain a copy of your personal
                  information
                </li>
                <li>
                  To request rectification or erasure of your personal
                  information
                </li>
                <li>To restrict the processing of your personal information</li>
                <li>If applicable, to data portability</li>
                <li>Not to be subject to automated decision-making</li>
              </ul>

              <p className="mt-4">
                In certain circumstances, you may also have the right to object
                to the processing of your personal information. You can make
                such a request by contacting us using the contact details
                provided in the section{" "}
                <em>“How Can You Contact Us About This Notice?”</em>
              </p>

              <p>
                We will consider and act upon any request in accordance with
                applicable data protection laws. If you are located in the EEA
                or UK and believe we are unlawfully processing your personal
                information, you also have the right to complain to your Member
                State data protection authority or the UK data protection
                authority.
              </p>

              <p>
                If you are located in Switzerland, you may contact the Federal
                Data Protection and Information Commissioner.
              </p>

              <p className="font-semibold text-zinc-300 mt-6">
                Withdrawing your consent
              </p>

              <p>
                If we are relying on your consent to process your personal
                information, which may be express and/or implied consent
                depending on the applicable law, you have the right to withdraw
                your consent at any time. You can withdraw your consent by
                contacting us using the contact details provided below or by
                updating your preferences.
              </p>

              <p>
                Please note that this will not affect the lawfulness of the
                processing before its withdrawal, nor, when applicable law
                allows, will it affect the processing of your personal
                information conducted in reliance on lawful processing grounds
                other than consent.
              </p>

              <p className="font-semibold text-zinc-300 mt-6">
                Opting out of marketing and promotional communications
              </p>

              <p>
                You can unsubscribe from our marketing and promotional
                communications at any time by clicking on the unsubscribe link
                in the emails that we send, or by contacting us using the
                details provided below. You will then be removed from the
                marketing lists.
              </p>

              <p>
                However, we may still communicate with you — for example, to
                send you service-related messages that are necessary for the
                administration and use of your account, to respond to service
                requests, or for other non-marketing purposes.
              </p>

              <p className="font-semibold text-zinc-300 mt-6">
                Account Information
              </p>

              <p>
                If you would at any time like to review or change the
                information in your account or terminate your account, you can:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Log in to your account settings and update your user account
                </li>
                <li>Contact us using the contact information provided</li>
              </ul>

              <p>
                Upon your request to terminate your account, we will deactivate
                or delete your account and information from our active
                databases. However, we may retain some information in our files
                to prevent fraud, troubleshoot problems, assist with any
                investigations, enforce our legal terms, and/or comply with
                applicable legal requirements.
              </p>

              <p className="font-semibold text-zinc-300 mt-6">
                Cookies and similar technologies
              </p>

              <p>
                Most web browsers are set to accept cookies by default. If you
                prefer, you can usually choose to set your browser to remove
                cookies or reject cookies. If you choose to remove or reject
                cookies, this could affect certain features or services of our
                Services.
              </p>

              <p>
                For further information, please see our Cookie Notice:{" "}
                <a
                  href="https://www.loghead.dev/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF94] hover:underline"
                >
                  https://www.loghead.dev/cookies
                </a>
                .
              </p>

              <p className="mt-4">
                If you have questions or comments about your privacy rights, you
                may email us at{" "}
                <a
                  href="mailto:info@onvo.ai"
                  className="text-[#00FF94] hover:underline"
                >
                  info@onvo.ai
                </a>
                .
              </p>
            </section>

            {/* 11 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  11
                </span>
                Controls for Do-Not-Track Features
              </h3>

              <p>
                Most web browsers and some mobile operating systems and mobile
                applications include a Do-Not-Track (&quot;DNT&quot;) feature or
                setting you can activate to signal your privacy preference not
                to have data about your online browsing activities monitored and
                collected.
              </p>

              <p>
                At this stage, no uniform technology standard for recognizing
                and implementing DNT signals has been finalized. As such, we do
                not currently respond to DNT browser signals or any other
                mechanism that automatically communicates your choice not to be
                tracked online.
              </p>

              <p>
                If a standard for online tracking is adopted that we must follow
                in the future, we will inform you about that practice in a
                revised version of this privacy notice.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  12
                </span>
                Do United States Residents Have Specific Privacy Rights?
              </h3>

              <p>
                <strong>In Short:</strong> If you are a resident of California,
                you are granted specific rights regarding access to your
                personal information.
              </p>

              <p className="font-semibold text-zinc-300 mt-6">
                What categories of personal information do we collect?
              </p>

              <p>
                We have collected the following categories of personal
                information in the past twelve (12) months:
              </p>

              <div className="overflow-x-auto mt-6">
                <table className="w-full border border-zinc-800 text-sm">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="border border-zinc-800 px-3 py-2 text-left">
                        Category
                      </th>
                      <th className="border border-zinc-800 px-3 py-2 text-left">
                        Examples
                      </th>
                      <th className="border border-zinc-800 px-3 py-2 text-left">
                        Collected
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        A. Identifiers
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Contact details such as real name, alias, postal
                        address, telephone number, IP address, email address,
                        and account name
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">YES</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        B. California Customer Records
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Name, contact information, education, employment,
                        financial information
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">YES</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        C. Protected classifications
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Gender and date of birth
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        D. Commercial information
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Transaction and purchase history
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        E. Biometric information
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Fingerprints and voiceprints
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        F. Internet activity
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Browsing history and interactions
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        G. Geolocation data
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Device location
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">YES</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        H. Audio / visual data
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Images, video, call recordings
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        I. Professional info
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Job title, work history
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        J. Education information
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Student records
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        K. Inferences
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Preferences and characteristics
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-800 px-3 py-2">
                        L. Sensitive personal information
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">
                        Cell value
                      </td>
                      <td className="border border-zinc-800 px-3 py-2">NO</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-6">
                We will use and retain the collected personal information as
                needed to provide the Services or for:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Category A – As long as the user has an account with us</li>
                <li>Category B – As long as the user has an account with us</li>
                <li>Category G – As long as the user has an account with us</li>
              </ul>

              <p className="mt-4">
                We may also collect other personal information through customer
                support, surveys, contests, and service delivery interactions.
              </p>

              <p className="mt-4">
                We have not disclosed, sold, or shared personal information for
                a business or commercial purpose in the preceding twelve (12)
                months, and we will not sell or share personal information in
                the future.
              </p>

              <p className="mt-4">
                To exercise these rights, you can contact us by emailing at{" "}
                <a
                  href="mailto:info@onvo.ai"
                  className="text-[#00FF94] hover:underline"
                >
                  info@onvo.ai
                </a>
                .
              </p>
            </section>

            {/* 13 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  13
                </span>
                Do We Make Updates to This Notice?
              </h3>

              <p>
                <strong>In Short:</strong> Yes, we will update this notice as
                necessary to stay compliant with relevant laws.
              </p>

              <p>
                We may update this privacy notice from time to time. The updated
                version will be indicated by an updated &quot;Revised&quot; date
                and the updated version will be effective as soon as it is
                accessible.
              </p>

              <p>
                If we make material changes to this privacy notice, we may
                notify you either by prominently posting a notice of such
                changes or by directly sending you a notification.
              </p>

              <p>
                We encourage you to review this privacy notice frequently to be
                informed of how we are protecting your information.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  14
                </span>
                How Can You Contact Us About This Notice?
              </h3>

              <p>
                If you have questions or comments about this notice, you may
                contact our Data Protection Officer (DPO),{" "}
                <strong>Ronnel Davis</strong>, by email, by phone, or by post:
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6 space-y-2 text-sm">
                <p>
                  <strong>Guidenco Inc</strong>
                </p>
                <p>Ronnel Davis</p>
                <p>651 N Broad St, Suite 201</p>
                <p>Middletown, DE 19709</p>
                <p>United States</p>

                <div className="pt-4 border-t border-zinc-800 space-y-1">
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:ronnel@onvo.ai"
                      className="text-[#00FF94] hover:underline"
                    >
                      ronnel@onvo.ai
                    </a>
                  </p>
                  <p>Phone: +91 80750 65108</p>
                </div>
              </div>
            </section>

            {/* 15 */}
            <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  15
                </span>
                How Can You Review, Update, or Delete the Data We Collect From
                You?
              </h3>

              <p>
                You have the right to request access to the personal information
                we collect from you, change that information, or delete it.
              </p>

              <p>
                To request to review, update, or delete your personal
                information, please email:{" "}
                <a
                  href="mailto:support@onvo.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF94] hover:underline"
                >
                  support@onvo.ai
                </a>
                .
              </p>
            </section>

            {/* <section>
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-[#00FF94] font-mono">
                  11
                </span>
                Contact Us
              </h3>
              <p>
                Guidenco Inc
                <br />
                651 N Broad St, Suite 201
                <br />
                Middletown, DE 19709, United States
              </p>
              <p>
                Email: <a href="mailto:info@onvo.ai">info@onvo.ai</a>
              </p>
            </section> */}
          </div>
        </article>
      </div>
    </main>
  );
}
