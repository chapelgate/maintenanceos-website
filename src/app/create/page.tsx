<path>/root/jobs-work/tasks/build-mw-20261025/work/mw-99/src/app/create/page.tsx</path>
<type>file</type>
<content>
1: import { EnquiryUnavailable } from "@/components/EnquiryUnavailable";
2: import {
3:   CalendarConnectSection,
4:   CreateJourneySection,
5: } from "@/components/create-funnel-islands";
6: import { ChatWidget } from "@/components/ChatWidget";
7: import { CreateIngestPrivacyNote } from "@/components/CreateIngestPrivacyNote";
8: import { FunnelPathStrip } from "@/components/FunnelPathStrip";
9: import { JsonLd } from "@/components/JsonLd";
10: import { PageHero } from "@/components/PageHero";
11: import { fullFunnelPageJsonLd } from "@/lib/json-ld";
12: import { funnelPageMetadata } from "@/lib/page-meta";
13: import { siteConfig } from "@/config/site";
14: 
15: export const metadata = funnelPageMetadata("create");
16: 
17: const steps = [
18:   {
19:     title: "Share your website",
20:     body: "Enter your public site URL and email so we can prepare a repair-intake preview you can test in the browser.",
21:   },
22:   {
23:     title: "Check the URL",
24: 
25:     body: "We read a small, bounded set of public pages and extract business facts for you to review. Missing details stay empty rather than being invented.",
26: 
27:   },
28:   {
29:     title: "Review the draft",
30:     body: "You edit business name, greeting, hours, services, and FAQs before anything is stored. The business name may start from the website-address hint; missing fields are not invented.",
31:   },
32:   {
33:     title: "Build the receptionist",
34:     body: "We turn the reviewed details into a knowledge pack and controlled receptionist configuration. You can edit it, and missing information stays missing.",
35:   },
36:   {
37:     title: "Try your receptionist",
38:     body: "Start the interactive receptionist demo and ask your own caller questions against the configuration you just reviewed.",
39:   },
40:   {
41:     title: "Save your setup (optional)",
42:     body: "Online enquiries are temporarily unavailable. Please use the email link above. The browser preview does not store the setup.",
43:   },
44: ] as const;
45: 
46: export default function CreateReceptionistPage() {
47:   return (
48:     <>
49:       <JsonLd data={fullFunnelPageJsonLd("create")} />
50:       <PageHero
51: 
52:         eyebrow="Repair intake · Preview"
53:         title="Turn your business website into a repair-intake preview"
54:         lede="Paste your site URL so MaintenanceOS can read public facts for a repair-intake preview, review them, then try a browser voice call. Online enquiries are temporarily unavailable, so the preview is not stored. It does not change your live telephone service, book viewings, or write into a CRM."
55: 
56:       />
57:       {siteConfig.demoPhoneNumber && (
58:         <div className="mx-auto max-w-3xl px-4 pb-6">
59:           <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm">
60:             <p className="font-medium text-ink">
61:               Preview demo number (not production):
62:             </p>
63:             <p className="mt-1">
64:               <a
65:                 href={`tel:${siteConfig.demoPhoneNumber}`}
66:                 className="text-accent underline-offset-2 hover:no-underline font-medium"
67:               >
68:                 {siteConfig.demoPhoneNumber}
69:               </a>
70:               {" — when enabled, call for an AI greeting and basic intake preview. Not a production answering service and not a live always-on phone."}
71:             </p>
72:           </div>
73:         </div>
74:       )}
75:       <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
76:         <FunnelPathStrip linked />
77:         <section aria-labelledby="create-form-heading">
78:           <h2
79:             id="create-form-heading"
80:             className="text-xl font-semibold text-ink"
81:           >
82:             Start with your website URL
83:           </h2>
84:           <p className="mt-2 text-sm text-muted">
85:             Next: read the public website, review the extracted facts, configure
86:             the receptionist, then start a browser voice call. The preview stays
87:             in this browser.
88:           </p>
89:           <div className="mt-6">
90:             <EnquiryUnavailable />
91:           </div>
92:           <div className="mt-6">
93:             <CreateJourneySection />
94:           </div>
95:           <CreateIngestPrivacyNote />
96:         </section>
97: 
98:         <CalendarConnectSection />
99: 
100:         <section aria-labelledby="create-steps-heading">
101:           <h2
102:             id="create-steps-heading"
103:             className="text-xl font-semibold text-ink"
104:           >
105:             How the preview funnel is designed to work
106:           </h2>
107:           <ol className="mt-4 list-decimal space-y-4 pl-5 text-muted">
108:             {steps.map((step) => (
109:               <li key={step.title}>
110:                 <span className="font-medium text-ink">{step.title}.</span>{" "}
111:                 {step.body}
112:               </li>
113:             ))}
114:           </ol>
115:         </section>
116: 
117:         <section
118:           className="mos-glass p-5 text-sm text-muted"
119:           aria-labelledby="create-limits-heading"
120:         >
121:           <h2 id="create-limits-heading" className="text-base font-semibold text-ink">
122:             Honest limits
123:           </h2>
124:           <ul className="mt-3 list-disc space-y-2 pl-5">
125:             <li>
126:               Website learning is read-only, limited to a small set of public
127:               HTTPS pages, honours robots.txt, and blocks private or internal
128:               network targets.
129:             </li>
130:             <li>
131:               Extracted facts are shown for review. If opening hours, services
132:               or other details are not found, they stay missing rather than being
133:               invented.
134:             </li>
135:             <li>
136:               The voice call runs in your browser using the reviewed knowledge
137:               pack. It does not assign or dial a public telephone number.
138:             </li>
139:             <li>
140:               The live telephone service remains isolated and is not changed by
141:               anything on this page.
142:             </li>
143:           </ul>
144:           <p className="mt-3">
145:             Prefer a human briefing instead?{" "}
146:             <a
147:               href="/demo/#demo"
148:               className="font-medium text-accent underline-offset-4 hover:underline"
149:             >
150:               Request early access
151:             </a>
152:             .
153:           </p>
154:           <p className="mt-3">
155:             See our{" "}
156:             <a
157:               href="/trust/"
158:               className="font-medium text-accent underline-offset-4 hover:underline"
159:             >
160:               Trust & verification
161:             </a>
162:             {" "}
163:             page for legal entity, DPIA status, recording disclosure, and
164:             certification facts.
165:           </p>
166:         </section>
167:       </div>
168:       <ChatWidget pageContext="create" title="Questions about the preview? Chat is not connected." />
169:     </>
170:   );
171: }

(End of file - total 171 lines)
</content>