const RESEND_BASE = "https://api.resend.com";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendEmailResult {
  id: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const from = opts.from || process.env.RESEND_FROM_EMAIL || "Chatty AI <brief@chattyai.com>";

  const res = await fetch(`${RESEND_BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return res.json();
}

export function formatBriefEmail(brief: {
  headline: string;
  actions: Array<{ priority: string; action: string; why: string; expected_impact: string }>;
  risk_flag?: { active: boolean; message: string | null };
  opportunity?: { message: string; potential_value: string };
  metric_of_the_day?: { name: string; value: string; trend: string; context: string };
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chattyai-production.up.railway.app";
  const priorityColor = brief.actions?.[0]?.priority === "high" ? "#ef4444" :
    brief.actions?.[0]?.priority === "low" ? "#22c55e" : "#f59e0b";

  const actionsHtml = (brief.actions || [])
    .map((a, i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">
          <span style="color:${a.priority === 'high' ? '#ef4444' : a.priority === 'low' ? '#22c55e' : '#f59e0b'};font-weight:700;">${i + 1}.</span>
          <strong style="color:#f1f5f9;">${a.action}</strong>
          <br><span style="color:#94a3b8;font-size:13px;">${a.why}</span>
          <br><span style="color:#10b981;font-size:12px;">${a.expected_impact}</span>
        </td>
      </tr>
    `)
    .join("");

  let extraHtml = "";
  if (brief.risk_flag?.active) {
    extraHtml += `
      <div style="margin-top:16px;padding:12px 16px;background:#1e1b2e;border-left:3px solid #f59e0b;border-radius:4px;">
        <strong style="color:#f59e0b;">Risk Flag</strong>
        <p style="color:#94a3b8;margin:4px 0 0;">${brief.risk_flag.message}</p>
      </div>
    `;
  }
  if (brief.opportunity?.message) {
    extraHtml += `
      <div style="margin-top:12px;padding:12px 16px;background:#0c1a0e;border-left:3px solid #10b981;border-radius:4px;">
        <strong style="color:#10b981;">Opportunity</strong>
        <p style="color:#94a3b8;margin:4px 0 0;">${brief.opportunity.message} — ${brief.opportunity.potential_value}</p>
      </div>
    `;
  }
  if (brief.metric_of_the_day) {
    const m = brief.metric_of_the_day;
    const arrow = m.trend === "up" ? "&#9650;" : m.trend === "down" ? "&#9660;" : "&#8212;";
    extraHtml += `
      <div style="margin-top:12px;padding:12px 16px;background:#0f172a;border-left:3px solid #3b82f6;border-radius:4px;">
        <strong style="color:#3b82f6;">Metric of the Day: ${m.name}</strong>
        <p style="color:#f1f5f9;margin:4px 0 0;font-size:20px;font-weight:700;">${m.value} ${arrow}</p>
        <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">${m.context}</p>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="color:#10b981;font-size:18px;font-weight:700;">Chatty AI</span>
      <span style="color:#475569;font-size:14px;margin-left:8px;">Daily Brief</span>
    </div>
    <div style="background:#111827;border-radius:12px;padding:24px;border:1px solid #1e293b;">
      <div style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${priorityColor};margin-right:8px;"></div>
      <h1 style="color:#f1f5f9;font-size:18px;margin:0 0 16px;display:inline;">${brief.headline}</h1>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${actionsHtml}
      </table>
      ${extraHtml}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${appUrl}/dashboard/brief" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;font-weight:600;text-decoration:none;border-radius:8px;font-size:14px;">
        Open Mission Control
      </a>
    </div>
    <p style="text-align:center;color:#475569;font-size:12px;margin-top:24px;">
      Chatty AI &mdash; Your AI Operating System
    </p>
  </div>
</body>
</html>
  `.trim();
}
