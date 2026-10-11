import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "How MaintenanceOS Handles a Dangerous Repair Report",
  description:
    "What happens when a repair report is flagged as dangerous: who decides, who can clear it, what our AI is built never to promise, and what gets recorded.",
  path: "/how-we-keep-control/",
});

const faqItems = [
  {
    question: "Can the AI book a contractor or promise a time?",
    answer: "No. The assistant will never invent a booking, an arrival time, or a visit. If nothing is booked, it says so plainly."
  },
  {
    question: "What happens if a tenant reports something dangerous?",
    answer: "Reports flagged as dangerous go straight to human review. Only an authorised person can clear them. If there is immediate danger to life, the guidance is to call 999 (never 911)."
  },
  {
    question: "Why isn't the list of safety-critical report types on this page?",
    answer: "Because our product team has not signed it off in our claims register yet."
  },
  {
    question: "Can the AI override the safety rules?",
    answer: "No. Fixed rules on our server control safety, job stages, and approvals. The AI cannot change them."
  },
  {
    question: "Who can clear a latched report? Can a contractor?",
    answer: "Only an authorised person. The computer cannot clear it, and neither can the caller. Which roles count as authorised is not published yet."
  },
  {
    question: "Can MaintenanceOS issue refunds or compensation?",
    answer: "No. The system cannot make payments, refunds, or compensation. We never handle client money."
  },
  {
    question: "Can a caller ask for a person?",
    answer: "Yes. Callers can ask to be transferred. Live transfer is still under testing, so we do not promise every call will connect. If a fault happens, the system fails safe."
  },
  {
    question: "Is my data kept separate from other organisations'?",
    answer: "Yes. Each organisation has its own private space. Code checks and automated tests keep your data apart from other companies."
  },
  {
    question: "Is MaintenanceOS live?",
    answer: "Not yet. We are pre-launch, and voice intake is still under testing. We say so plainly."
  },
  {
    question: "Does MaintenanceOS make us compliant with housing law?",
    answer: "No software can make you compliant. Your legal duties stay with you. MaintenanceOS simply records jobs clearly and keeps danger with a person."
  }
];

export default function HowWeKeepControlPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Pre-launch: MaintenanceOS is still under testing, and we're taking early-access requests."
        title="How we handle dangerous repairs"
        lede="When a repair looks dangerous, a real person must step in."
      />
      
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
        <section
          id="gas"
          aria-labelledby="gas-heading"
          className="scroll-mt-24 rounded-[var(--mos-radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-6 text-[var(--color-warning-text)]"
        >
          <h2 id="gas-heading" className="text-xl font-semibold">
            If you smell gas right now
          </h2>
          <p className="mt-2 text-sm">
            Public safety advice from the gas emergency service, Gas Safe
            Register, HSE and the NHS. MaintenanceOS doesn&apos;t handle gas
            emergencies, so act on these steps straight away.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong>Get out and get fresh air.</strong> Open doors and windows
              on your way if you can.
            </li>
            <li>
              <strong>Don&apos;t use switches or flames.</strong> Don&apos;t turn
              lights or electrical switches on or off, don&apos;t smoke and
              don&apos;t strike matches.
            </li>
            <li>
              <strong>Turn off the gas at the meter</strong> if it&apos;s safe to
              reach. Don&apos;t go into a cellar or basement to do it.
            </li>
            <li>
              <strong>Call the National Gas Emergency Service on{" "}
              <a href="tel:0800111999" className="underline underline-offset-2">0800 111 999</a></strong>{" "}
              (free). In Northern Ireland, call the NI Gas Emergency Service on{" "}
              <a href="tel:0800002001" className="font-semibold underline underline-offset-2">0800 002 001</a>.
              If someone is unwell or in danger, call{" "}
              <a href="tel:999" className="font-semibold underline underline-offset-2">999</a>.
            </li>
          </ol>
          <h3 className="mt-5 text-base font-semibold">Carbon monoxide: know the signs</h3>
          <p className="mt-2 text-sm leading-relaxed">
            You can&apos;t see, smell or taste carbon monoxide. Signs of poisoning
            include headaches, dizziness, feeling sick, breathlessness, collapse and
            loss of consciousness, and they can feel like flu or tiredness. If you
            suspect it: turn off the appliance if it&apos;s safe to, open doors and
            windows, go outside, and call the National Gas Emergency Service on{" "}
            <a href="tel:0800111999" className="font-semibold underline underline-offset-2">0800 111 999</a>.
            Don&apos;t go back inside until you&apos;ve been told it&apos;s safe. Call
            NHS 111 for medical advice, or 999 if someone is finding it hard to
            breathe, has suddenly become confused or has lost consciousness.
          </p>
          <p className="mt-3 text-xs">
            Sources (checked 10 October 2026):{" "}
            <a href="https://www.nationalgas.com/emergency-contacts" className="underline underline-offset-2">National Gas</a>,{" "}
            <a href="https://www.gassaferegister.co.uk/gas-emergency/what-to-do-in-a-gas-emergency/" className="underline underline-offset-2">Gas Safe Register</a>,{" "}
            <a href="https://www.hse.gov.uk/gas/domestic/faqs.htm" className="underline underline-offset-2">HSE</a>,{" "}
            <a href="https://www.nhs.uk/conditions/carbon-monoxide-poisoning/" className="underline underline-offset-2">NHS</a> and{" "}
            <a href="https://www.nidirect.gov.uk/articles/energy-power-supply-and-utilities" className="underline underline-offset-2">nidirect</a>.
          </p>
        </section>

        <section className="space-y-4 text-muted">
          <p>
            MaintenanceOS is built around one idea: the AI can take the details, but it doesn&apos;t get the final say on safety, job progress or approvals. Fixed rules do, and people do.
          </p>
          <p>
            This page sets out those rules in plain English, including the parts we haven&apos;t published yet and why.
          </p>
        </section>

        <section aria-labelledby="who-decides" className="space-y-4">
          <h2 id="who-decides" className="text-xl font-semibold text-ink">
            Who decides what happens next?
          </h2>
          <div className="space-y-4 text-muted">
            <p>Not the AI.</p>
            <p>
              In MaintenanceOS, the AI&apos;s job is language. It listens to or reads what someone reports and turns it into a structured repair request. What happens next is decided by deterministic rules on our server: how safe it is, where it sits in the job&apos;s lifecycle, and whether it needs approval. The AI can&apos;t override those rules, however the conversation goes.
            </p>
            <p>
              That&apos;s deliberate. Language models are good at understanding people. They shouldn&apos;t be the last line of defence on a dangerous report.
            </p>
          </div>
        </section>

        <section aria-labelledby="step-by-step" className="space-y-4">
          <h2 id="step-by-step" className="text-xl font-semibold text-ink">
            What happens step by step
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              Here&apos;s the route a report takes when the rules flag it as dangerous. It&apos;s an illustration, written for this page.
            </p>
            <div className="mos-glass border-dashed p-4 text-sm">
              <p className="font-semibold text-ink mb-2">Illustration only.</p>
              <p className="mb-4">
                Sample wording we wrote to show the steps. It isn&apos;t a recording or transcript of a real call, and it isn&apos;t the list of what our rules flag. Voice intake is still under testing.
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Caller:</strong> &quot;There&apos;s water coming through the kitchen ceiling, right round the light fitting.&quot;</li>
                <li><strong>Assistant:</strong> &quot;Thank you. Can I take the address, and a number we can reach you on tonight?&quot;</li>
                <li><strong>Caller</strong> gives the address and a mobile number.</li>
                <li><strong>Assistant:</strong> &quot;I&apos;ve recorded what you&apos;ve told me. I can&apos;t tell you anyone is on the way, because nothing has been arranged yet.&quot;</li>
                <li><strong>The rules:</strong> in this illustration, the fixed rules flag the report as dangerous. It&apos;s latched, so it can&apos;t go down the routine route, and the AI can&apos;t clear it.</li>
                <li><strong>A person:</strong> the report is held for human review instead of waiting in a queue.</li>
                <li><strong>An authorised person</strong> reviews it, decides what happens next, and clears the latch. The clearance is recorded.</li>
                <li><strong>The caller</strong> is only told something has been arranged once it actually has.</li>
              </ol>
            </div>
          </div>
        </section>

        <section aria-labelledby="looks-dangerous" className="space-y-4">
          <h2 id="looks-dangerous" className="text-xl font-semibold text-ink">
            When a report looks dangerous
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              Some reports can&apos;t wait in a queue. Our rules look for the warning signs of a safety-critical problem in what&apos;s reported. When they find one, the report can enter escalation and human review, and a critical-safety latch keeps it with a person until someone authorised clears it.
            </p>
            <p className="font-semibold text-ink">
              We&apos;ve deliberately not published the list of report types our rules treat as safety-critical.
            </p>
            <p>
              Our product team hasn&apos;t signed it off in our claims register yet, and we&apos;d rather tell you it&apos;s missing than describe it vaguely.
            </p>
            <p>
              The rules work from the words people use, and no rule set catches every way a danger can be described. So keep telling your residents what to do in an emergency, too.
            </p>
            <p>
              Where there&apos;s an immediate danger to life, the assistant&apos;s guidance is to call <strong>999</strong>. Not 911, and not &quot;we&apos;ll get someone out&quot;. It doesn&apos;t give the gas emergency number or a power-cut number, so keep those in your own tenant information and out-of-hours script.
            </p>
            <p>
              What decides &quot;safety-critical&quot; is the rule set, not the AI&apos;s judgement on the day.
            </p>
          </div>
        </section>

        <section aria-labelledby="latched-report" className="space-y-4">
          <h2 id="latched-report" className="text-xl font-semibold text-ink">
            What happens when a report latches?
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              When a report is marked critical for safety, MaintenanceOS sets a latch on it. While the latch is on, the case stays with a person, and only someone with the authority to clear it can do so.
            </p>
            <p>
              Think of it as the job card that stays pinned to the board until the right person signs it off.
            </p>
          </div>
        </section>

        <section aria-labelledby="who-clears-it" className="space-y-4">
          <h2 id="who-clears-it" className="text-xl font-semibold text-ink">
            Who clears it?
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              An authorised person. Not the AI, and not the caller.
            </p>
            <p>
              Clearing a latch is a human decision, and it&apos;s recorded. The point isn&apos;t to slow your team down. It&apos;s to make sure that when a dangerous report is closed, a real person with the authority to close it made that call.
            </p>
            <p className="font-semibold text-ink">
              Which roles count as &quot;authorised&quot; isn&apos;t published yet.
            </p>
            <p>
              That includes whether anyone outside your own team, such as a contractor, could ever clear a latch. It hasn&apos;t been signed off in our claims register.
            </p>
          </div>
        </section>

        <section aria-labelledby="never-promise" className="space-y-4">
          <h2 id="never-promise" className="text-xl font-semibold text-ink">
            What the AI never promises
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              This is the rule tenants feel most, so it&apos;s the one we&apos;re strictest about. The assistant is built not to invent:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>a booking or an appointment time</li>
              <li>that a contractor or engineer has been sent</li>
              <li>a refund, compensation or a waived fee</li>
              <li>account information</li>
              <li>a safety reassurance (&quot;it&apos;ll be fine, leave it till Monday&quot;)</li>
            </ul>
            <p>
              If nothing has been arranged, it&apos;s built not to say it has. The report is recorded, and the gap isn&apos;t filled with a promise. A tenant told &quot;someone&apos;s on the way&quot; when nobody is will be angrier than one told the truth, and they&apos;ll be right to be.
            </p>
            <p>
              MaintenanceOS has no authority to move money. Quotes and invoices go through checks, but there&apos;s no payment, refund, compensation or client-money execution in the system.
            </p>
            <p>
              A caller who asks for a person can ask to be transferred, but live transfer is still under testing, so we don&apos;t yet promise the call will reach someone. If something goes wrong technically, the system is built to fail safe. It doesn&apos;t quietly hand the call somewhere unplanned.
            </p>
          </div>
        </section>

        <section aria-labelledby="record" className="space-y-4">
          <h2 id="record" className="text-xl font-semibold text-ink">
            What goes in the record?
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              Consequential actions leave evidence: what was asked for, what was attempted and what actually happened. MaintenanceOS keeps audit events and action evidence alongside the work order, so you can see the history of a repair without relying on someone&apos;s memory.
            </p>
            <p>
              There&apos;s one rule that matters most here. <strong className="font-semibold text-ink">The system only reports something as done when there&apos;s evidence it succeeded.</strong> &quot;Job booked&quot; is only said if the booking actually exists.
            </p>
          </div>
        </section>

        <section aria-labelledby="data-separation" className="space-y-4">
          <h2 id="data-separation" className="text-xl font-semibold text-ink">
            How data stays separate
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              MaintenanceOS is built for many organisations on one system, and it keeps each one&apos;s records apart: properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call records. Tenant-isolation controls sit in the code and are covered by tests. One letting agent&apos;s data is designed to be kept apart from another&apos;s, and an operation for one organisation is tied to that organisation.
            </p>
            <p>
              Calls and callbacks from the phone provider are signature-checked, so requests pretending to come from it are designed to be rejected.
            </p>
          </div>
        </section>

        <section aria-labelledby="setup" className="space-y-4">
          <h2 id="setup" className="text-xl font-semibold text-ink">
            What you can set up
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              Your properties, residents and contractors sit in your own organisation&apos;s space in MaintenanceOS, and work orders, jobs and communications are tied to them.
            </p>
            <p>
              What the AI can&apos;t do is switch the safety floor off. The rules that decide safety, lifecycle and approvals sit above the AI, and they stay there. Which settings your own team will be able to change isn&apos;t published yet.
            </p>
            <p>
              In a demo we&apos;ll show you how your portfolio would be set up, and what&apos;s in place now versus still being built.
            </p>
          </div>
        </section>

        <section aria-labelledby="tested" className="space-y-4">
          <h2 id="tested" className="text-xl font-semibold text-ink">
            What have we tested so far?
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              At our 30 September 2026 product checkpoint (code version <code>498ad82</code>), all 196 targeted claims-and-safety tests passed. They&apos;re automated tests run against the product code in a controlled test set-up, not on a live service. They cover explicit transfer, the &quot;never invent&quot; rules, tenant isolation, lifecycle integrity, decision rules, invoice rules and state-machine controls, among others.
            </p>
            <p>
              Earlier, on 10 September 2026, local acceptance was evidenced: a full test pass, readiness checks, and backup and restore. &quot;Local&quot; means run on our own machines, not on a hosted service.
            </p>
            <p>
              These are dated, targeted results. They show that specific rules behaved as designed in testing. They don&apos;t prove every rule will hold in every real situation, and voice intake is still under testing.
            </p>
            <p className="font-semibold text-ink italic">
              Pre-launch: MaintenanceOS is still under testing, and we&apos;re taking early-access requests.
            </p>
            <p>
              We won&apos;t publish uptime figures, logos or star ratings we haven&apos;t earned.
            </p>
          </div>
        </section>

        <section aria-labelledby="compliant" className="space-y-4">
          <h2 id="compliant" className="text-xl font-semibold text-ink">
            Does this make us compliant?
          </h2>
          <div className="space-y-4 text-muted">
            <p>
              No tool makes you compliant on its own, and we won&apos;t pretend otherwise. Your legal duties as a landlord, agent or housing provider stay with you. What MaintenanceOS is designed to do is capture repair reports properly, keep dangerous ones in front of a person, and leave a record of what happened.
            </p>
          </div>
        </section>

        <section aria-labelledby="faq" className="space-y-4">
          <h2 id="faq" className="text-xl font-semibold text-ink">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                name="rulebook-faq"
                className="mos-glass p-4"
              >
                <summary className="cursor-pointer font-semibold text-ink">
                  {item.question}
                </summary>
                <p className="mt-3 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-border pt-12 text-center">
          <h2 className="text-xl font-semibold text-ink">
            See how our rules work.
          </h2>
          <p className="text-muted mb-6">
            See the rules working on a sample repair. In an early demo we&apos;ll take you through a sample report, from first contact to latch to clearance, using sample data.
          </p>
          <CtaPair />
        </section>
      </div>
    </>
  );
}
