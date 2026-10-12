/** Industry role pages — plain sector labels. */

export type IndustryRole = {
  slug: string;
  productName: string;
  label: string;
  card: string;
  title: string;
  sub: string;
  job?: string[];
  fits?: string[];
  safety?: string;
  willNotClaim?: string;
  sections?: { title: string; content: string[] }[];
  faq?: { q: string; a: string }[];
  metaDescription: string;
};

/**
 * Shared UK-maintenance positioning vs a generic AI receptionist (Fonio-class).
 * VERIFIED / carefully UNDER TEST only — not live always-on phone or GA.
 */
export const ukMaintenanceVsGeneric = [
  "Emergency triage vs jobs: UK/999 guidance is locked in product source (never 911). Danger is designed to latch for a person; a leaky tap stays a structured job — not an invented emergency visit.",
  "Contractor dispatch language: intake is designed to capture who, what, where, and access. Rules must not invent a van, slot, or “someone is on the way.”",
  "Out-of-hours honesty: designed to collect caller details when the desk is closed. That is not a public always-on phone or commercially live receptionist.",
  "No client-money: no payment, refund, compensation, fee-waiver, or client-money execution authority — for the model or automated money movement.",
] as const;

export const industryRoles: IndustryRole[] = [
  {
    slug: "landlords",
    productName: "MaintenanceOS for landlords",
    label: "Landlords",
    card: "Landlords — UK emergency triage vs jobs; no invented vans or client-money.",
    title: "Repair reporting for landlords who can't be on the phone all night",
    sub: "If you let homes, you already know how repairs reach you. A text on a Sunday evening. A voicemail that just says \"it's leaking again\". A photo with no address. The work itself is rarely the hard part. The hard part is knowing, quickly and reliably, which report needs a person tonight and which can wait for Monday, and being able to show later what you were told and what you did.\n\nMaintenanceOS is repair intake built for that job. The AI takes the details. Fixed rules decide what happens next. A person still clears anything flagged as dangerous.",
    metaDescription: "Take tenant repair reports properly, keep anything dangerous in front of a person, and keep a record of what happened. Repair intake for UK landlords.",
    sections: [
      {
        title: "What usually goes wrong with repair reports?",
        content: [
          "Most problems with repairs start before anyone picks up a tool.",
          "- **Details go missing.** Which property, which room, since when, getting worse or not. Without them, the first visit is a fact-finding trip.",
          "- **Urgency is guessed.** A tired person at 10pm has to decide whether \"there's a funny smell near the boiler\" is a Monday job. That decision shouldn't rest on how the call happened to go.",
          "- **Promises get made that nobody can keep.** \"Someone will be round first thing\" calms a tenant down for an hour and causes a complaint the next day.",
          "- **There's no record.** When a tenant says they reported it three weeks ago, you need more than your memory and a message thread.",
          "None of these needs a bigger team. They need the same questions asked every time, clear rules for what's urgent, and a written record."
        ]
      },
      {
        title: "How does MaintenanceOS handle a repair report?",
        content: [
          "**It takes the details properly.** The assistant collects the caller's details and turns what they say into a structured repair request, rather than a loose message you have to decode later.",
          "**Rules, not the AI, decide what happens next.** Safety, the progress of the job and approvals are decided by fixed rules on our server. The AI can't override them, however the conversation goes.",
          "**Dangerous reports are held for a person.** Reports our rules flag as safety-critical can enter escalation and human review instead of the routine queue. They're latched, and only an authorised person can clear them. Our safety rules page explains how this works, and why the list of report types isn't published yet.",
          "**Emergency guidance is UK guidance.** Where there's an immediate danger to life, the assistant's guidance is 999, never 911.",
          "**Everything leaves a trail.** Consequential actions leave audit evidence alongside the job, and the system only reports something as done when there's evidence it succeeded."
        ]
      },
      {
        title: "What will it never tell your tenant?",
        content: [
          "This is the part tenants notice. The assistant must not invent:",
          "- a booking or appointment time",
          "- that a contractor has been sent",
          "- a refund, compensation or a waived fee",
          "- account information",
          "- a safety reassurance such as \"it'll be fine till Monday\"",
          "If nothing has been arranged, it won't say it has. MaintenanceOS also has no authority to move money. Quotes and invoices go through checks, but there's no payment, refund or compensation in the system at all. (No client-money execution authority.)",
          "If a tenant asks for a person, they can ask to be transferred (live transfer handling is still under testing). If something goes wrong technically, the system is built to fail safe rather than quietly pass the call somewhere unplanned. Not a live always-on phone."
        ]
      },
      {
        title: "Does it matter if I only have a few properties?",
        content: [
          "The basics matter more, not less. A larger landlord usually has a repairs desk. A smaller one has a mobile phone and a day job. Your legal duties as a landlord are the same either way, and they stay with you whatever tools you use. What a tool can do is make sure reports are captured the same way every time, dangerous ones are put in front of you or the person you choose, and there's a record.",
          "In MaintenanceOS your properties, tenants, contractors, work orders, jobs and communications sit in your own organisation's space, kept apart from other organisations' records by isolation controls in the code that are covered by tests."
        ]
      },
      {
        title: "What about Awaab's Law and the Renters' Rights Act?",
        content: [
          "The government is consulting on how Awaab's Law should apply to private rented homes in England. Nothing is decided yet, and the consultation closes on 18 December 2026. We've summarised what's proposed in our guides.",
          "We won't tell you a tool makes you compliant, because none can. What helps, whatever the final rules say, is knowing when a report arrived, what it said and what happened next. That's what MaintenanceOS is designed to record."
        ]
      },
      {
        title: "What have we tested so far?",
        content: [
          "At our 30 September 2026 product checkpoint, all 196 targeted claims-and-safety tests passed, covering explicit transfer, the \"never invent\" rules, organisation isolation, job lifecycle, decision rules and invoice rules among others. We won't publish uptime figures or reviews we haven't earned. These are targeted, automated tests run against the product code in a controlled test set-up, not on a live service. They show specific rules behaved as designed in testing, not that every rule will hold in every real situation, and voice intake is still under testing."
        ]
      },
      {
        title: "Where things stand",
        content: [
          "We're pre-launch. Voice intake is still under testing, and we're taking early-access requests from landlords who want to see how it works. In a demo we'll take you through a sample repair report, from first contact to escalation to clearance, using sample data, and we'll be clear about what's in place now and what's still being built."
        ]
      }
    ],
    faq: [
      { q: "Can the AI book a contractor or promise my tenant a time?", a: "No. The assistant must not invent bookings, appointment times or dispatches. If nothing has been arranged, it won't say it has." },
      { q: "What happens if a tenant reports something dangerous?", a: "Reports our rules flag as safety-critical can enter escalation and human review, and are latched until an authorised person clears them. Where life is in danger, the guidance is 999." },
      { q: "Can MaintenanceOS give refunds or compensation?", a: "No. There's no payment, refund, compensation or fee-waiver authority in the system." },
      { q: "Will it make me compliant with Awaab's Law?", a: "No tool can do that, and your duties stay with you. MaintenanceOS is designed to capture reports, keep dangerous ones with a person and record what happened." },
      { q: "Is it live yet?", a: "Not yet. We're pre-launch and voice intake is still under testing." }
    ]
  },
  {
    slug: "letting-agents",
    productName: "MaintenanceOS for letting agents",
    label: "Letting agents",
    card: "Letting agents — portfolio intake with 999-vs-jobs triage; rules stay in charge.",
    title: "Repair reports your landlords can trust, and your team doesn't have to chase",
    sub: "A managed portfolio means you sit between two people who both expect answers. The tenant wants to know when it'll be fixed. The landlord wants to know why it's costing what it costs. In between are contractors, keys, access, approvals and a phone that keeps ringing after the office has closed.\n\nMaintenanceOS is repair intake designed for that position. The AI takes the details. Fixed rules decide what happens next. A person still clears anything flagged as dangerous. And nothing is promised to a tenant that hasn't actually happened.",
    metaDescription: "Repair intake for letting agents: tenant reports captured properly, dangerous ones kept with a person, no invented promises, and a record you can show landlords.",
    sections: [
      {
        title: "Where does repair handling go wrong for agents?",
        content: [
          "Ask anyone who has run a repairs line: the trouble is rarely the repair itself.",
          "- **The report arrives thin.** No property reference, no description that a contractor can work from, no sense of whether it's getting worse.",
          "- **Urgency depends on who answered.** One negotiator escalates a damp patch, another leaves a hissing boiler till morning.",
          "- **Promises leak out.** \"We'll have someone there tomorrow\" is said to calm a tenant, before anyone has checked with the landlord or a contractor.",
          "- **The trail goes cold.** When a landlord asks what was reported and when, the answer is spread across inboxes, call notes and memories.",
          "Each of these costs you time, and some of them cost you landlords."
        ]
      },
      {
        title: "How does MaintenanceOS handle a tenant's report?",
        content: [
          "**Consistent capture.** The assistant collects the caller's details and turns what they report into a structured repair request, the same way every time.",
          "**Rules decide, not the AI.** Safety, the progress of a job and approvals are decided by fixed rules on our server. The AI can't override them.",
          "**Dangerous reports are held for a person.** Reports our rules flag as safety-critical can enter escalation and human review and are latched until an authorised person clears them. Our safety rules page explains how this works, and why the list of report types isn't published yet.",
          "**999, never 911.** Where there's an immediate danger to life, the assistant's guidance is 999, never 911.",
          "**Evidence, not assertion.** Consequential actions leave audit evidence alongside the job, and the system only reports something as done when there's evidence it succeeded."
        ]
      },
      {
        title: "Why does \"no invented promises\" matter so much to an agent?",
        content: [
          "Because you carry the blame for both sides. The assistant must not invent a booking or appointment time, a contractor dispatch, a refund, compensation, a waived fee, account information or a safety reassurance. If nothing has been arranged, it won't say it has. Not a live always-on phone.",
          "That protects your relationship with the tenant, who isn't told something false, and with the landlord, who isn't committed to a cost or a visit they haven't agreed. MaintenanceOS has no authority to move money at all (no client-money authority): quotes and invoices are checked, but there's no payment, refund or compensation in the system.",
          "If a tenant asks for a person, they can ask to be transferred (live transfer handling is still under testing). If something fails technically, the system is built to fail safe rather than pass the call somewhere unplanned."
        ]
      },
      {
        title: "How is our agency's data kept separate?",
        content: [
          "MaintenanceOS is built for many organisations on one system. Your agency's properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call records sit in your organisation's own space. Isolation controls are in the code and covered by tests, and requests from the phone provider are signature-checked so that fake ones are designed to be rejected.",
          "What we don't claim yet: per-landlord rule sets, landlord logins or a customer portal. In a demo we'll show you what's in place now and what's still being built."
        ]
      },
      {
        title: "What's changing for landlords, and why it reaches you",
        content: [
          "The government is consulting on how Awaab's Law should apply to private rented homes in England. The consultation notes that where agents manage repairs, the landlord \"would remain ultimately liable\" and \"may need to establish new contractual agreements with their agent\". Nothing is decided, and the consultation closes on 18 December 2026.",
          "It's a good moment to review how repair reports reach you out of hours, how quickly they're logged, and who decides what's urgent. No tool makes an agency or a landlord compliant, and we won't suggest otherwise."
        ]
      },
      {
        title: "What have we tested so far?",
        content: [
          "At our 30 September 2026 product checkpoint, all 196 targeted claims-and-safety tests passed, including explicit transfer, the \"never invent\" rules, organisation isolation, job lifecycle, decision rules and invoice rules. Local acceptance, including a full test pass and backup and restore, was evidenced on 10 September 2026. These are targeted, automated tests run against the product code in a controlled test set-up, not on a live service. They show specific rules behaved as designed in testing, not that every rule will hold in every real situation, and voice intake is still under testing."
        ]
      },
      {
        title: "Where things stand",
        content: [
          "We're pre-launch. Voice intake is still under testing, and we're taking early-access requests from agencies. In a demo we'll walk a sample tenant report through intake, escalation and clearance using sample data."
        ]
      }
    ],
    faq: [
      { q: "Can the AI commit a landlord to a repair or a cost?", a: "No. It must not invent bookings, dispatches, refunds or compensation, and the system has no authority to move money." },
      { q: "What happens when a tenant reports something dangerous out of hours?", a: "Reports our rules flag as safety-critical can enter escalation and human review and are latched until an authorised person clears them. Where life is in danger, the guidance is 999." },
      { q: "Is our data kept apart from other agencies'?", a: "Yes. Each organisation's records sit in its own space, with isolation controls in the code that are covered by tests." },
      { q: "Can landlords log in to see their repairs?", a: "Not today. A customer portal isn't available, and we won't claim one until it is." },
      { q: "Is it live yet?", a: "Not yet. We're pre-launch and voice intake is still under testing." }
    ]
  },
  {
    slug: "property-managers",
    productName: "MaintenanceOS for property managers",
    label: "Property managers",
    card: "Property managers — multi-tenant ops with 999-vs-jobs triage; no autonomous dispatch.",
    title: "One way of taking repair reports, across every building you manage",
    sub: "Managing property means managing reports from people you rarely meet: residents, leaseholders, tenants of leaseholders, concierge staff, neighbours, the occasional passer-by who spotted water coming through a ceiling. Each building has its own contractors, its own access arrangements and its own history. The risk isn't that you don't care. It's that the way a report is taken depends on who happened to take it.\n\nMaintenanceOS gives you one consistent front door for repair reports. The AI takes the details. Fixed rules decide what happens next. A person still clears anything flagged as dangerous.",
    metaDescription: "Repair reports across many buildings, captured the same way, with dangerous ones kept with a person and a record of what happened. For UK property managers.",
    sections: [
      {
        title: "What makes repair intake hard across a portfolio?",
        content: [
          "- **Many buildings, many callers.** The same leak can be reported by three flats in three different ways. Without structure, that becomes three jobs or none.",
          "- **Communal areas blur responsibility.** A report about a stairwell light, a door entry system or a roof leak needs to land with the right person for that building.",
          "- **Urgency drifts.** One team member escalates everything, another escalates nothing. Neither is a system.",
          "- **Records live in too many places.** When a resident, a client or an auditor asks what was reported and when, the answer shouldn't depend on searching inboxes."
        ]
      },
      {
        title: "How does MaintenanceOS handle a report?",
        content: [
          "**Structured from the first word.** The assistant collects the caller's details and turns what they report into a structured repair request, so the job starts with something a contractor can act on.",
          "**Rules own the decisions that matter.** Safety, the progress of a job and approvals are decided by fixed rules on our server. The AI can't override them, whichever building the call is about.",
          "**Dangerous reports stay with a person.** Reports our rules flag as safety-critical can enter escalation and human review. They're latched until an authorised person clears them. Our safety rules page explains how this works, and why the list of report types isn't published yet.",
          "**UK guidance in an emergency.** Where there's an immediate danger to life, the assistant's guidance is 999, never 911.",
          "**A record you can stand behind.** Consequential actions leave audit evidence alongside the job, and the system only reports something as done when there's evidence it succeeded."
        ]
      },
      {
        title: "What will it never promise a resident?",
        content: [
          "The assistant must not invent a booking or appointment time, a contractor dispatch, a refund, compensation, a waived fee, account information or a safety reassurance. If nothing has been arranged, it won't say it has. Not a live always-on phone.",
          "That matters more in block management than almost anywhere. A promise made to one resident is repeated to the whole building by evening. MaintenanceOS also has no authority to spend: quotes and invoices go through checks, but there's no payment, refund or compensation execution in the system. (No client-money authority).",
          "If a caller asks for a person, they can ask to be transferred (live transfer handling is still under testing), and a technical fault is built to fail safe rather than pass the call on unplanned."
        ]
      },
      {
        title: "How are records organised?",
        content: [
          "MaintenanceOS is built for many organisations on one system. Your organisation's properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call records sit in your own space, kept apart from other organisations' by isolation controls in the code that are covered by tests. Requests from the phone provider are signature-checked.",
          "There's also an internal supervisor dashboard in the product, which we use to show sample work in a demo. We don't claim a customer portal or client logins today, and we won't until they exist."
        ]
      },
      {
        title: "What about building safety and housing rules?",
        content: [
          "Your duties depend on the buildings you manage, who owns them and who lives in them, and they stay with you and your clients whatever software you use. We don't offer compliance promises.",
          "What we do publish is guidance with official sources. Each one is dated and says plainly that it isn't legal advice."
        ]
      },
      {
        title: "What have we tested so far?",
        content: [
          "At our 30 September 2026 product checkpoint, all 196 targeted claims-and-safety tests passed, covering explicit transfer, the \"never invent\" rules, organisation isolation, job lifecycle, decision rules, invoice rules and state-machine controls. Our continuous-integration and security checks have historically passed on the application code too. These are targeted, automated tests run against the product code in a controlled test set-up, not on a live service. They show specific rules behaved as designed in testing, not that every rule will hold in every real situation, and voice intake is still under testing."
        ]
      },
      {
        title: "Where things stand",
        content: [
          "We're pre-launch. Voice intake is still under testing, and we're taking early-access requests from property managers. In a demo we'll take a sample report from a block through intake, escalation and clearance, using sample data, and show you what's ready and what isn't."
        ]
      }
    ],
    faq: [
      { q: "Can it handle reports for lots of different buildings?", a: "Your properties, residents, contractors and work orders all sit in your organisation's space in MaintenanceOS, and each report becomes a structured repair request. In a demo we'll show how a portfolio would be set up." },
      { q: "Who decides whether a report is urgent?", a: "Fixed rules on our server, not the AI. Reports our rules flag as safety-critical can enter escalation and human review and are latched until an authorised person clears them." },
      { q: "Can the AI approve spending or promise a contractor?", a: "No. It must not invent bookings or dispatches, and there's no payment, refund or compensation authority in the system." },
      { q: "Do clients get a login?", a: "Not today. A customer portal isn't available." },
      { q: "Is it live yet?", a: "Not yet. We're pre-launch and voice intake is still under testing." }
    ]
  },
  {
    slug: "maintenance-companies",
    productName: "MaintenanceOS",
    label: "Maintenance companies",
    card: "MaintenanceOS — UK emergency triage vs jobs; contractor-dispatch language, no invented vans.",
    title: "Job intake for maintenance firms that won't promise an engineer you haven't sent",
    sub: "When you're the firm that does the work, the phone is both your lifeline and your biggest distraction. Calls come from landlords, letting agents, housing officers, residents and sometimes the resident's neighbour. Engineers are on jobs and can't answer. The office is stretched. And every call that's taken badly turns into a wasted visit, a missing part or an argument about what was promised.\n\nMaintenanceOS is job intake built for maintenance work, not a general-purpose call answerer. The AI takes the details. Fixed rules decide what happens next. A person still clears anything flagged as dangerous.",
    willNotClaim:
      "No contractor marketplace pitch. No “we dispatch your team automatically.” No always-on phone claim. No invented SLA percentages. No general availability.",
    metaDescription: "For maintenance firms taking repair calls from landlords, agents and residents: structured job intake, dangerous reports kept with a person, no invented dispatch.",
    sections: [
      {
        title: "What does a badly taken job cost you?",
        content: [
          "- **A wasted first visit.** The engineer arrives with the wrong parts, because \"it's broken\" was all anyone wrote down.",
          "- **A promise you didn't make.** Someone told the caller an engineer was on the way. Now you're either sending one at a loss or explaining why you're not.",
          "- **A safety call that sat in a queue.** A report that should have gone straight to a supervisor was logged as routine because it was described casually.",
          "- **A dispute with no record.** The client says they reported it last week. You need to show what was reported, when, and what you said."
        ]
      },
      {
        title: "How does MaintenanceOS take a job?",
        content: [
          "**It gathers what the engineer needs.** The assistant collects the caller's details and turns what they report into a structured repair request, so the job starts with a description someone can work from.",
          "**Rules make the decisions, not the AI.** Safety, the progress of the job and approvals are decided by fixed rules on our server. The AI can't override them.",
          "**Dangerous reports are held for a person, not left in a queue.** Reports our rules flag as safety-critical can enter escalation and human review and are latched until an authorised person clears them. Our safety rules page explains how this works, and why the list of report types isn't published yet.",
          "**UK terms: 999, never 911.** Where there's an immediate danger to life, the assistant's guidance is 999, never 911.",
          "**Done means done.** Consequential actions leave audit evidence alongside the job, and the system only reports something as done when there's evidence it succeeded. The rule is that \"we've sent an engineer\" is only said when there's evidence it happened."
        ]
      },
      {
        title: "Why \"no invented dispatch\" is the rule we care about most",
        content: [
          "For a contractor, a false promise isn't just awkward. It's a cost. The assistant must not invent a booking or appointment time, a contractor or engineer dispatch, a refund, compensation, a waived fee, account information or a safety reassurance. If nothing has been arranged, it won't say it has. Not a live always-on phone.",
          "MaintenanceOS has no authority to move money either (no client-money authority). Quotes and invoices go through checks, but there's no payment, refund, compensation or fee-waiver execution in the system. Pricing decisions stay with you.",
          "If a caller asks for a person, they can ask to be transferred (live transfer handling is still under testing). If something goes wrong technically, the system is built to fail safe, not to quietly forward the call somewhere unplanned."
        ]
      },
      {
        title: "What do your clients get out of it?",
        content: [
          "Landlords, agents and housing providers who send you work increasingly want to know how reports are handled, especially out of hours. A firm that can explain its intake rules in plain English, and show a record of each job, is easier to trust with a contract. Our published safety rules are written to be shared with clients.",
          "We don't claim that MaintenanceOS makes you or your clients compliant with anything. Their legal duties stay with them, and yours stay with you."
        ]
      },
      {
        title: "How are your records kept?",
        content: [
          "Your properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call records sit in your organisation's own space. Isolation controls in the code keep each organisation's records apart and are covered by tests. Requests from the phone provider are signature-checked.",
          "We don't claim job scheduling, engineer apps, accounting links or a customer portal. In a demo we'll show what's in place now and what's still being built."
        ]
      },
      {
        title: "What have we tested so far?",
        content: [
          "At our 30 September 2026 product checkpoint, all 196 targeted claims-and-safety tests passed, including the \"never invent\" rules, explicit transfer, job lifecycle, decision rules and invoice rules. Local acceptance, including backup and restore, was evidenced on 10 September 2026. These are targeted, automated tests run against the product code in a controlled test set-up, not on a live service. They show specific rules behaved as designed in testing, not that every rule will hold in every real situation, and voice intake is still under testing."
        ]
      },
      {
        title: "Where things stand",
        content: [
          "We're pre-launch. Voice intake is still under testing, and we're taking early-access requests from maintenance firms. In a demo we'll take a sample call through intake, escalation and clearance using sample data."
        ]
      }
    ],
    faq: [
      { q: "Will the AI tell a caller an engineer is on the way?", a: "Not unless it's true. The assistant must not invent bookings, appointment times or dispatches." },
      { q: "Can it quote or take payment?", a: "No. Quotes and invoices go through checks, but there's no payment, refund or compensation authority in the system." },
      { q: "What happens with a report that sounds dangerous?", a: "Reports our rules flag as safety-critical can enter escalation and human review and are latched until an authorised person clears them. Where life is in danger, the assistant's guidance is 999. It doesn't give the gas emergency number, so keep 0800 111 999 in your own customer information." },
      { q: "Does it connect to our job management system?", a: "We don't claim any integrations today. Ask us in a demo what's planned." },
      { q: "Is it live yet?", a: "Not yet. We're pre-launch and voice intake is still under testing." }
    ]
  },
  {
    slug: "housing-associations",
    productName: "MaintenanceOS for housing associations",
    label: "Housing associations",
    card: "Housing associations — 999-vs-jobs latch and escalation; no client-money or invented dispatch.",
    title: "Repairs reporting that keeps dangerous cases in front of a person",
    sub: "For a housing association, the repairs line is where trust with residents is won or lost. It's also where regulatory exposure starts. Since October 2025, Awaab's Law has set fixed timescales for social landlords in England to deal with emergency hazards and significant damp and mould. More hazards are due to come into scope. And when something goes wrong, the questions are always the same: when were you told, what were you told, and what did you do?\n\nMaintenanceOS is repair intake designed around those questions. The AI takes the details. Fixed rules decide what happens next. A person still clears anything flagged as dangerous. And consequential steps leave evidence.",
    metaDescription: "Repair intake for UK housing associations: reports captured consistently, safety-critical cases held for an authorised person, and an audit trail on the case.",
    sections: [
      {
        title: "Where does repair intake put residents at risk?",
        content: [
          "- **The first report isn't recognised for what it is.** A resident describes mould in a child's bedroom, or a smell near the boiler, in everyday words. If the person taking the call doesn't hear the risk, the clock starts without anyone noticing.",
          "- **Out-of-hours cover is thin.** Evenings and weekends rely on a call centre or an on-call rota with less context and less time.",
          "- **Promises outrun reality.** \"Someone will be with you tomorrow\" turns into a complaint when nobody comes.",
          "- **The record is incomplete.** Notes are brief, times are missing, and what the resident was advised isn't written down."
        ]
      },
      {
        title: "How does MaintenanceOS handle a resident's report?",
        content: [
          "**It captures the report properly.** The assistant collects the caller's details and turns what they say into a structured repair request, so the case starts with the facts.",
          "**Fixed rules decide, not the AI.** Safety, the progress of the case and approvals are decided by fixed rules on our server. The AI can't override them, however the conversation goes.",
          "**Safety-critical reports are held for a person.** Reports our rules flag as safety-critical can enter escalation and human review. They're latched, and only an authorised person can clear them. Our safety rules page explains how this works, and why the list of report types isn't published yet.",
          "**999, never 911.** Where there's an immediate danger to life, the assistant's guidance is 999, never 911.",
          "**An audit trail on the case.** Consequential actions leave audit evidence, and the system only reports something as done when there's evidence it succeeded."
        ]
      },
      {
        title: "What will it never say to a resident?",
        content: [
          "The assistant must not invent a booking or appointment time, a contractor dispatch, a refund, compensation, a waived fee, account information or a safety reassurance. If nothing has been arranged, it won't say it has. Not a live always-on phone.",
          "It has no authority to move money (no client-money authority). Quotes and invoices go through checks, but there's no payment, refund, compensation or fee-waiver execution in the system. A resident can ask to be transferred to a person (live transfer handling is still under testing), and a technical failure is built to fail safe rather than pass the call on unplanned."
        ]
      },
      {
        title: "Does it help with Awaab's Law?",
        content: [
          "We'll be straight with you: no software can meet a legal duty for you, and we won't claim MaintenanceOS makes you compliant. The duties, and the judgement calls, stay with your organisation.",
          "What the Awaab's Law timescales depend on, in practice, is knowing when a report arrived and what it said. MaintenanceOS is designed to capture reports in a structured way, keep safety-critical ones in front of an authorised person, and leave a record of what happened. Our guides set out the social housing timescales with official sources, including the second phase due on 30 November 2026, subject to Parliament's approval."
        ]
      },
      {
        title: "How is our data kept separate?",
        content: [
          "MaintenanceOS is built for many organisations on one system. Your properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call records sit in your organisation's own space. Isolation controls are in the code and covered by tests. Requests from the phone provider are signature-checked.",
          "We know housing providers ask about certifications, penetration testing and single sign-on. We don't hold certifications such as ISO 27001 or SOC 2, and items such as single sign-on, multi-factor authentication, penetration testing, monitoring and legal, privacy and telecoms review are still planned before production. We'd rather tell you that now than in procurement."
        ]
      },
      {
        title: "What have we tested so far?",
        content: [
          "At our 30 September 2026 product checkpoint, all 196 targeted claims-and-safety tests passed, covering explicit transfer, the \"never invent\" rules, organisation isolation, case lifecycle, decision rules and invoice rules. Local acceptance, including a full test pass and backup and restore, was evidenced on 10 September 2026. These are targeted, automated tests run against the product code in a controlled test set-up, not on a live service. They show specific rules behaved as designed in testing, not that every rule will hold in every real situation, and voice intake is still under testing."
        ]
      },
      {
        title: "Where things stand",
        content: [
          "We're pre-launch. Voice intake is still under testing, and we're taking early-access requests from housing providers. In a demo we'll take a sample report through intake, escalation and clearance, using sample data."
        ]
      }
    ],
    faq: [
      { q: "Does MaintenanceOS make us compliant with Awaab's Law?", a: "No. No software can. Your duties stay with you. MaintenanceOS is designed to capture reports, keep safety-critical ones with an authorised person and record what happened." },
      { q: "What does it treat as safety-critical?", a: "We haven't published the list of report types yet, because our product team hasn't signed it off. What we can say now: reports our rules flag as safety-critical can enter escalation and human review, and only an authorised person can clear the latch." },
      { q: "Can the AI override the safety rules?", a: "No. Safety is decided by fixed rules on our server, and the AI can't override them." },
      { q: "Do you have ISO 27001 or SOC 2?", a: "No. We don't hold certifications, and we don't claim them." },
      { q: "Is it live yet?", a: "Not yet. We're pre-launch and voice intake is still under testing." }
    ]
  },
  {
    slug: "facilities-management",
    productName: "MaintenanceOS for facilities teams",
    label: "Facilities management",
    card: "Facilities management — 999-vs-jobs site triage; no autonomous dispatch or client-money.",
    title: "Facilities management — site maintenance triage with clearance and audit in the loop.",
    sub: "For UK facilities management teams coordinating sites, contractors, and urgent reports — AI for capture, rules and people for consequential steps. Pre-launch product line under Chapelgate. Not a live always-on phone.",
    job: [
      "Mixed urgent and routine reports across sites, including out-of-hours.",
      "Need for consistent classification before a contractor moves — 999 is not a work order.",
      "Evidence of what was approved versus what a model suggested.",
      "Avoiding chatbot-style “we’ve fixed it” or “van is on the way” language.",
    ],
    fits: [
      "Multi-tenant properties, contractors, work orders, jobs, communications.",
      "Controlled emergency triage vs jobs via fixed server rules. UK/999 guidance in product source.",
      "Audit events / action evidence as designed trust capability. Intake is in preview — not a public always-on line.",
      "Human oversight for transfer and clearance; no autonomous dispatch story and no client-money authority.",
    ],
    safety: "Money prohibitions apply — no payment, refund, compensation, or client-money execution. See Security.",
    willNotClaim:
      "No FM enterprise logos. No uptime or site-count vanity metrics. No “AI runs your FM operation.” No live always-on phone.",
    metaDescription:
      "Facilities management — 999-vs-jobs site triage with human clearance. No client-money. Pre-launch.",
  },
  {
    slug: "councils",
    productName: "MaintenanceOS for councils",
    label: "Councils",
    card: "Councils — controlled 999-vs-jobs intake; no invented dispatch or client-money.",
    title: "Repairs reporting for councils that need to show their working",
    sub: "Council repairs teams answer to more people than most: tenants, councillors, the Housing Ombudsman, the Regulator of Social Housing, auditors and the local press. Every one of them eventually asks the same thing. What was reported, when, and what did the council do about it?\n\nMaintenanceOS is repair intake designed so that question has an answer. The AI takes the details. Fixed rules decide what happens next. A person still clears anything flagged as dangerous. And consequential steps leave evidence.",
    metaDescription: "Repair intake for council housing and public-sector maintenance teams: consistent capture, safety-critical cases held for an authorised officer, and an audit trail.",
    sections: [
      {
        title: "Where do council repairs lines come under pressure?",
        content: [
          "- **Volume and variety.** The same contact centre may take repairs, anti-social behaviour, estate issues and general enquiries, often from people who are upset or worried.",
          "- **Statutory clocks.** Council landlords in England have prescribed periods for some qualifying repairs under the secure tenants' Right to Repair scheme, and Awaab's Law sets fixed timescales for emergency hazards and significant damp and mould in social housing. Both depend on knowing when the council was told.",
          "- **Out-of-hours handover.** Evening and weekend calls are often taken by a different team or a contracted service, with less context.",
          "- **Records that don't join up.** Call notes, job tickets and contractor updates live in different places, which makes complaints and reviews slower and harder."
        ]
      },
      {
        title: "How does MaintenanceOS handle a report?",
        content: [
          "**Structured capture.** The assistant collects the caller's details and turns what they report into a structured repair request.",
          "**Fixed rules, not AI judgement.** Safety, the progress of a job and approvals are decided by fixed rules on our server. The AI can't override them. For a public body, that means the logic can be written down, reviewed and explained.",
          "**Safety-critical cases held for an officer.** Reports our rules flag as safety-critical can enter escalation and human review. They're latched until an authorised person clears them. Our safety rules page explains how this works, and why the list of report types isn't published yet.",
          "**999, never 911.** Where there's an immediate danger to life, the assistant's guidance is 999, never 911.",
          "**Evidence on the record.** Consequential actions leave audit evidence, and the system only reports something as done when there's evidence it succeeded."
        ]
      },
      {
        title: "What will the AI never say to a tenant?",
        content: [
          "The assistant must not invent a booking or appointment time, a contractor dispatch, a refund, compensation, a waived fee, account information or a safety reassurance. If nothing has been arranged, it won't say it has. Not a live always-on phone.",
          "There's no payment, refund, compensation or fee-waiver authority in the system; quotes and invoices go through checks only. (No client-money authority). A caller can ask to be transferred to a person (live transfer handling is still under testing), and a technical failure is built to fail safe."
        ]
      },
      {
        title: "Will it help us meet the Right to Repair or Awaab's Law timescales?",
        content: [
          "No software meets a statutory duty for you, and we won't claim that MaintenanceOS makes a council compliant. Your duties and your decisions stay with the council.",
          "What the timescales depend on is a reliable record of when a report arrived, what it said and what happened next. MaintenanceOS is designed to capture that."
        ]
      },
      {
        title: "What should procurement know now?",
        content: [
          "We'd rather be plain about this than discover it at tender stage.",
          "- **Data separation.** MaintenanceOS is built for many organisations on one system. Your properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call records sit in your organisation's own space, with isolation controls in the code covered by tests.",
          "- **Provider requests.** Requests from the phone provider are signature-checked.",
          "- **Testing.** At our 30 September 2026 product checkpoint, all 196 targeted claims-and-safety tests passed. These are automated tests run in a controlled test set-up, not on a live service, and voice intake is still under testing. Local acceptance (run on our own machines), including backup and restore, was evidenced on 10 September 2026. Our continuous-integration and security checks have historically passed on the application code.",
          "- **Not yet in place.** We hold no certifications such as ISO 27001 or SOC 2. Single sign-on, multi-factor authentication, penetration testing, monitoring and failover, and legal, privacy and telecoms review are planned before production. There's no customer portal yet.",
          "- **Status.** We're pre-launch. There's no production service to procure today."
        ]
      },
      {
        title: "Where things stand",
        content: [
          "Voice intake is still under testing, and we're taking early-access requests from councils that want to understand the approach early. In a demo we'll take a sample tenant report through intake, escalation and officer clearance, using sample data, and share the rules in writing."
        ]
      }
    ],
    faq: [
      { q: "Can the AI decide a repair isn't urgent?", a: "No. Safety is decided by fixed rules on our server, which the AI can't override. Reports our rules flag as safety-critical can enter escalation and human review." },
      { q: "Who can clear a safety-critical case?", a: "Only an authorised person. The latch can't be cleared by the AI." },
      { q: "Do you hold ISO 27001 or SOC 2?", a: "No, and we don't claim to." },
      { q: "Is MaintenanceOS available on public-sector frameworks?", a: "Not today. We're pre-launch." },
      { q: "Can we share the safety rules with members or auditors?", a: "Yes. The rules our repair intake follows are published in plain English on our safety rules page, so anyone can read how a report is handled before it's trusted with tenants." },
      { q: "Does it replace our housing management system?", a: "No, and we don't claim any integrations today. In a demo we'll show what MaintenanceOS records and what's still being built." },
      { q: "Is it live yet?", a: "Not yet. Voice intake is still under testing." }
    ]
  },
  {
    slug: "holiday-lets",
    productName: "MaintenanceOS for holiday lets",
    label: "Holiday lets",
    card: "Holiday lets — out-of-hours guest reports structured; 999 vs jobs, no invented engineer.",
    title: "Holiday lets — guest maintenance calls, structured — without autonomous dispatch.",
    sub: "For UK holiday-let operators who get out-of-hours guest reports and need clear capture, 999 separated from jobs, and human handover — not a model inventing engineer visits or a live always-on guest line. Pre-launch product line under Chapelgate.",
    job: [
      "Guests calling about boilers, access, leaks — often outside office hours.",
      "Risk of anyone promising a contractor visit or compensation on the spot.",
      "Owners/managers need structured notes tied to the property — 999 if there is danger, a job if it is maintenance.",
      "Want UK-appropriate emergency guidance if a guest describes danger, without a generic 24/7 receptionist claim.",
    ],
    fits: [
      "Out-of-hours honesty: intake designed to collect caller details and classify issues (voice in commissioning preview — not a public always-on line).",
      "Emergency triage vs jobs: rules own safety latch, escalations, approvals; AI must not invent dispatches, bookings, refunds, or compensation.",
      "Multi-tenant properties and communications model supports property-scoped ops (in preview for release).",
      "Explicit-request human transfer when a person must decide. No client-money authority.",
    ],
    safety: "No payment, refund, compensation, or client-money execution authority. See Security.",
    willNotClaim:
      "No OTA partnership badges. No occupancy or booking-channel integrations as live features. No “24/7 live guest line” or always-on phone claim.",
    metaDescription:
      "Holiday lets — out-of-hours guest maintenance structured; 999 vs jobs, no invented dispatch.",
  }
];

export function getIndustryRole(slug: string): IndustryRole | undefined {
  return industryRoles.find((r) => r.slug === slug);
}
