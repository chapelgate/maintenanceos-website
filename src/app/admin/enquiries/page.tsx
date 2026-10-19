import fs from "node:fs";
import path from "node:path";

interface LeadRecord {
  received_at: string;
  lead_type: string;
  email: string;
  name?: string;
  organisation?: string;
  role?: string;
  message?: string;
  source?: string;
  public_launch?: boolean;
  sends_email: boolean;
  discarded?: boolean;
  reason?: string;
}

function readLeads(dataFile: string): LeadRecord[] {
  if (!fs.existsSync(dataFile)) {
    return [];
  }
  const content = fs.readFileSync(dataFile, "utf8").trim();
  if (!content) {
    return [];
  }
  return content.split("\n").map((line) => JSON.parse(line));
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "&#039;");
}

function generateCsv(leads: LeadRecord[]): string {
  const headers = [
    "received_at",
    "lead_type",
    "email",
    "name",
    "organisation",
    "role",
    "message",
    "source",
    "public_launch",
    "sends_email",
  ];
  const rows = leads.map((lead) =>
    headers.map((h) => {
      const value = lead[h as keyof LeadRecord] ?? "";
      if (typeof value === "string") {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return String(value);
    }).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

const CSS = `
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
  .container { max-width: 1200px; margin: 0 auto; }
  h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 16px; }
  .actions { display: flex; gap: 12px; margin-bottom: 24px; }
  .btn { padding: 10px 16px; border-radius: 6px; font-weight: 600; font-size: 0.875rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary { background: #1d4ed8; color: white; border: none; }
  .btn-primary:hover { background: #1e40af; }
  .btn-secondary { background: white; color: #1d4ed8; border: 1px solid #1d4ed8; }
  .btn-secondary:hover { background: #eff6ff; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; }
  th { background: #f8fafc; font-weight: 600; color: #475569; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
  .badge-early_demo { background: #dbeafe; color: #1e40af; }
  .badge-launch_list { background: #fef3c7; color: #92400e; }
  .badge-contact { background: #dcfce7; color: #166534; }
  .badge-create_receptionist { background: #fce7f3; color: #9d174d; }
  .message-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .empty { text-align: center; padding: 48px; color: #64748b; }
  @media (max-width: 768px) { table { font-size: 0.8125rem; } th, td { padding: 8px 12px; } }
`;

const dataFile = path.resolve(process.cwd(), ".data/form-stub-leads.jsonl");
const leads = readLeads(dataFile).filter((l) => !l.discarded).sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());

const csvContent = generateCsv(leads);

export const metadata = {
  title: "Enquiry Dashboard",
  description: "View and export enquiry submissions.",
  robots: "noindex, nofollow",
};

export default function EnquiriesDashboardPage() {
  return (
    <html lang="en-GB">
      <head>
        <title>Enquiry Dashboard \u2013 WorkSmartOS</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <div className="container">
          <h1>Enquiry Dashboard</h1>
          <div className="actions">
            <a href="/admin/enquiries?export=csv" className="btn btn-primary">Export CSV</a>
            <a href="/" className="btn btn-secondary">\u2190 Back to site</a>
          </div>
          {leads.length === 0 ? (
            <div className="empty">No enquiries recorded yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Organisation</th>
                  <th>Role</th>
                  <th>Message</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr key={lead.received_at + "-" + idx}>
                    <td>{formatDate(lead.received_at)}</td>
                    <td><span className={"badge badge-" + lead.lead_type}>{lead.lead_type.replace("_", " ")}</span></td>
                    <td>{escapeHtml(lead.email)}</td>
                    <td>{lead.name ? escapeHtml(lead.name) : "\u2014"}</td>
                    <td>{lead.organisation ? escapeHtml(lead.organisation) : "\u2014"}</td>
                    <td>{lead.role ? escapeHtml(lead.role) : "\u2014"}</td>
                    <td className="message-cell">{lead.message ? escapeHtml(lead.message) : "\u2014"}</td>
                    <td>{lead.source ? escapeHtml(lead.source) : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </body>
    </html>
  );
}

export function GET() {
  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="enquiries-' + new Date().toISOString().split("T")[0] + '.csv"',
    },
  });
}