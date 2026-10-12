# Specification: Legal Pages for Chapelgate Limited

## Objective
Complete the privacy, cookies, and terms pages with Chapelgate Limited's public details as specified in the issue.

## Acceptance Criteria
- Fill in the draft `/privacy`, `/cookies` and `/terms` pages using public facts only. Don't invent anything.
- Controller: **Chapelgate Limited**, company number **12340004** (England & Wales, private limited company, incorporated 29 Nov 2019). Registered office: C/O Wainwrights Accountants, Faversham House, Wirral International Business Park, Old Hall Road, Bromborough, Wirral, CH62 3NX. Director: Andrew John Cartwright. Source: Companies House.
- Contact for data requests: andy@chapelgatehome.uk.
- Rules:
  - Follow UK GDPR / Data Protection Act 2018 and PECR as applied to a pre-launch marketing site. Name the lawful bases: legitimate interests for enquiry emails and for a website URL submitted on `/create`.
  - Name DigitalOcean as host and processor, with transfers covered by the UK IDTA / UK Addendum. List rights, give a 12-month default retention for enquiry mail, and include a right to complain to the ICO.
  - Terms: the law of England and Wales, liability capped at £100 for the free preview, and no service warranty pre-launch.
  - Leave ONE marker `[ICO REG NO]` where the ICO registration number goes. Andrew is handling that (register #10).
  - Don't change any other page. Keep the existing tests passing, and add a test that the company number appears on all three pages.
- Author: chapelgate
- Created At: 2026-10-12T12:29:43Z

## Sources
- Companies House: Chapelgate Limited (company number 12340004)
- ICO guidance: For the ICO registration number placeholder and rights information.