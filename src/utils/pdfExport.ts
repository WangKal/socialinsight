import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  violet: "#7c3aed",
  violetLight: "#ede9fe",
  indigo: "#4f46e5",
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate300: "#cbd5e1",
  slate100: "#f1f5f9",
  white: "#ffffff",
  emerald: "#059669",
  emeraldLight: "#d1fae5",
  amber: "#d97706",
  amberLight: "#fef3c7",
  rose: "#e11d48",
  roseLight: "#ffe4e6",
  black: "#000000",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentColor(score: number) {
  if (score >= 0) return C.emerald;
  if (score >= -0.4) return C.amber;
  return C.rose;
}

function sentimentLabel(score: number) {
  if (score >= 0.3) return "Positive";
  if (score >= -0.3) return "Neutral";
  if (score >= -0.6) return "Mixed";
  return "Negative";
}

/** Create an off-screen container, call builder, capture + PDF, clean up. */
async function renderToPDF(
  buildHTML: (container: HTMLDivElement) => void,
  filename: string
) {
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    position: fixed;
    top: 0; left: -9999px;
    width: 794px;
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: ${C.slate900};
    z-index: -1;
  `;
  document.body.appendChild(wrap);
  buildHTML(wrap);

  await new Promise((r) => setTimeout(r, 80)); // let fonts settle

  const canvas = await html2canvas(wrap, {
    scale: 2,
    useCORS: true,
    backgroundColor: C.white,
    width: 794,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 794,
  });

  document.body.removeChild(wrap);

  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgData = canvas.toDataURL("image/png");
  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = pageW / imgW;
  const scaledH = imgH * ratio;

  let y = 0;
  let remaining = scaledH;
  let page = 0;

  while (remaining > 0) {
    if (page > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -y, pageW, scaledH);
    y += pageH;
    remaining -= pageH;
    page++;
  }

  pdf.save(filename);
}

// ─── Shared layout pieces ─────────────────────────────────────────────────────

function pageHeader(title: string, subtitle: string, keywords: string[]): string {
  return `
    <div style="background: linear-gradient(135deg, ${C.slate900} 0%, ${C.violet} 100%); padding: 36px 40px 28px; border-radius: 0 0 20px 20px; margin-bottom: 28px;">
      <div style="font-size: 10px; color: rgba(255,255,255,0.45); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;">SocialInsight Campaign Export</div>
      <div style="font-size: 22px; color: #fff; margin-bottom: 6px;">${title}</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 16px;">${subtitle}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${keywords.map((k) => `<span style="padding: 4px 12px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 999px; font-size: 11px; color: #fff;">${k}</span>`).join("")}
      </div>
    </div>
  `;
}

function sectionTitle(icon: string, text: string, color = C.violet): string {
  return `<div style="display: flex; align-items: center; gap: 8px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid ${color}20;">
    <span style="font-size: 16px;">${icon}</span>
    <span style="font-size: 14px; font-weight: 600; color: ${C.slate900}; letter-spacing: 0.3px;">${text}</span>
  </div>`;
}

function card(content: string, style = ""): string {
  return `<div style="background: ${C.white}; border: 1px solid ${C.slate300}; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; ${style}">${content}</div>`;
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="display: inline-block; padding: 3px 10px; background: ${bg}; color: ${color}; border-radius: 999px; font-size: 10px; font-weight: 600; margin-right: 6px;">${text}</span>`;
}

function sentimentBar(score: number): string {
  const pct = Math.round(((score + 1) / 2) * 100);
  const col = sentimentColor(score);
  return `
    <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
      <div style="flex: 1; height: 6px; background: ${C.slate100}; border-radius: 999px; overflow: hidden;">
        <div style="width: ${pct}%; height: 100%; background: ${col}; border-radius: 999px;"></div>
      </div>
      <span style="font-size: 11px; color: ${col}; font-weight: 600; white-space: nowrap;">${score.toFixed(2)} · ${sentimentLabel(score)}</span>
    </div>
  `;
}

function footer(page: string): string {
  return `<div style="margin-top: 40px; padding-top: 12px; border-top: 1px solid ${C.slate300}; display: flex; justify-content: space-between; font-size: 10px; color: ${C.slate500};">
    <span>SocialInsight · Keyword Campaign Report</span>
    <span>Generated ${new Date().toLocaleString()}</span>
  </div>`;
}

// ─── Topics PDF ───────────────────────────────────────────────────────────────

interface TopicCluster {
  topic: string;
  frequency: number;
  replyable: boolean;
  average_sentiment: number;
  reply_suggestions: { ai_reply: string; mention_list: string };
}

interface CampaignMeta {
  keywords: string[];
  platforms: string[];
  start_date: string;
  end_date: string;
}

export async function downloadTopicsPDF(clusters: TopicCluster[], meta: CampaignMeta) {
  await renderToPDF((container) => {
    const platformStr = meta.platforms.join(", ").toUpperCase();
    const dateStr = `${new Date(meta.start_date).toLocaleDateString()} – ${new Date(meta.end_date).toLocaleDateString()}`;

    let html = pageHeader(
      "Topic Clusters",
      `${platformStr} · ${dateStr}`,
      meta.keywords
    );

    html += `<div style="padding: 0 40px;">`;
    html += sectionTitle("🎯", `${clusters.length} Topic${clusters.length !== 1 ? "s" : ""} Identified`);

    clusters.forEach((c, i) => {
      const bg = c.average_sentiment >= 0 ? C.emeraldLight : c.average_sentiment >= -0.4 ? C.amberLight : C.roseLight;
      const borderColor = c.average_sentiment >= 0 ? C.emerald : c.average_sentiment >= -0.4 ? C.amber : C.rose;

      let inner = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px;">
          <div style="font-weight: 600; font-size: 13px; color: ${C.slate900}; flex: 1; line-height: 1.4;">${c.topic}</div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
            ${badge(`${c.frequency} posts`, C.slate100, C.slate700)}
            ${c.replyable ? badge("Replyable", C.violetLight, C.violet) : ""}
          </div>
        </div>
        ${sentimentBar(c.average_sentiment)}
      `;

      if (c.reply_suggestions?.ai_reply) {
        inner += `
          <div style="margin-top: 14px; padding: 12px 14px; background: ${C.white}; border: 1px solid ${C.slate300}; border-radius: 10px;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: ${C.slate500}; margin-bottom: 6px;">AI Reply Suggestion</div>
            <div style="font-size: 12px; color: ${C.slate700}; line-height: 1.6;">${c.reply_suggestions.ai_reply}</div>
          </div>
        `;

        if (c.reply_suggestions.mention_list) {
          const handles = c.reply_suggestions.mention_list.split(" ").filter(Boolean);
          inner += `
            <div style="margin-top: 10px;">
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: ${C.slate500}; margin-bottom: 6px;">Mention List</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${handles.map((h) => `<span style="padding: 3px 10px; background: ${C.violetLight}; color: ${C.violet}; border-radius: 999px; font-size: 11px; font-weight: 500;">@${h}</span>`).join("")}
              </div>
            </div>
          `;
        }
      }

      html += `
        <div style="background: ${bg}; border: 1.5px solid ${borderColor}40; border-radius: 14px; padding: 18px 20px; margin-bottom: 16px;">
          <div style="font-size: 10px; color: ${C.slate500}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Cluster ${i + 1}</div>
          ${inner}
        </div>
      `;
    });

    html += footer("");
    html += `</div>`;
    container.innerHTML = html;
  }, `campaign-topics-${Date.now()}.pdf`);
}

// ─── Intelligence PDF ─────────────────────────────────────────────────────────

interface IntelligenceData {
  consensus_signal: string;
  friction_dissent: { type: string; summary: string; explanation: string };
  detected_patterns: string[];
  overall_sentiment: { emotional_split: string; agreement_on_fact: string };
  linguistic_signals: Array<{ phrase: string; literal_meaning: string; social_meaning: string }>;
  recommended_actions: Array<{ owner: string; action: string; timeline: string }>;
  engagement_integrity: { classification: string; language_signal: string; reasoning_density: string };
  executive_implication: { monitor_next: string; risk_or_opportunity: string; decision_makers_should_understand: string };
  key_hypotheses: Array<{ hypothesis: string; driver_title: string; evidence_excerpt: string }>;
}

export async function downloadIntelligencePDF(data: IntelligenceData, meta: CampaignMeta) {
  await renderToPDF((container) => {
    const dateStr = `${new Date(meta.start_date).toLocaleDateString()} – ${new Date(meta.end_date).toLocaleDateString()}`;
    let html = pageHeader("Strategic Intelligence Report", dateStr, meta.keywords);
    html += `<div style="padding: 0 40px;">`;

    // Consensus signal
    html += sectionTitle("⚡", "Consensus Signal");
    html += `<div style="background: ${C.violetLight}; border-left: 4px solid ${C.violet}; border-radius: 0 10px 10px 0; padding: 14px 18px; font-size: 12px; color: ${C.slate700}; line-height: 1.7;">${data.consensus_signal}</div>`;

    // Patterns
    html += sectionTitle("🔷", "Detected Patterns");
    html += `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px;">
      ${data.detected_patterns.map((p) => badge(p.replace(/[\[\]]/g, ""), C.violetLight, C.violet)).join("")}
    </div>`;

    // Sentiment
    html += sectionTitle("📊", "Overall Sentiment");
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      ${card(`<div style="font-size: 10px; color: ${C.slate500}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Emotional Split</div><div style="font-size: 12px; color: ${C.slate700};">${data.overall_sentiment.emotional_split}</div>`)}
      ${card(`<div style="font-size: 10px; color: ${C.slate500}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Agreement on Fact</div><div style="font-size: 12px; color: ${C.slate700};">${data.overall_sentiment.agreement_on_fact}</div>`)}
    </div>`;

    // Engagement integrity
    html += sectionTitle("🛡️", "Engagement Integrity");
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
      ${["Classification", "Language Signal", "Reasoning Density"].map((label, i) => {
        const val = [data.engagement_integrity.classification, data.engagement_integrity.language_signal, data.engagement_integrity.reasoning_density][i];
        return card(`<div style="font-size: 10px; color: ${C.slate500}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">${label}</div><div style="font-size: 12px; color: ${C.slate700};">${val}</div>`);
      }).join("")}
    </div>`;

    // Friction
    html += sectionTitle("⚠️", "Friction & Dissent");
    html += `<div style="background: ${C.amberLight}; border: 1.5px solid ${C.amber}40; border-radius: 12px; padding: 16px 20px;">
      ${badge(data.friction_dissent.type, C.amberLight, C.amber)}
      <div style="margin-top: 10px; font-size: 12px; color: ${C.slate700}; margin-bottom: 6px;">${data.friction_dissent.summary}</div>
      <div style="font-size: 11px; color: ${C.slate500};">${data.friction_dissent.explanation}</div>
    </div>`;

    // Key Hypotheses
    html += sectionTitle("💡", "Key Hypotheses");
    data.key_hypotheses.forEach((h, i) => {
      html += card(`
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; border-radius: 999px; background: ${C.violetLight}; color: ${C.violet}; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${i + 1}</div>
          <div style="flex: 1;">
            <div style="font-size: 10px; color: ${C.violet}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${h.driver_title}</div>
            <div style="font-size: 12px; color: ${C.slate900}; font-weight: 500; margin-bottom: 8px;">${h.hypothesis}</div>
            <div style="font-size: 11px; color: ${C.slate500}; background: ${C.slate100}; border-radius: 8px; padding: 8px 12px; font-style: italic;">"${h.evidence_excerpt}"</div>
          </div>
        </div>
      `);
    });

    // Linguistic signals
    html += sectionTitle("📖", "Linguistic Signals");
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      ${data.linguistic_signals.map((ls) => card(`
        <div style="font-size: 12px; font-weight: 600; color: ${C.slate900}; margin-bottom: 4px;">"${ls.phrase}"</div>
        <div style="font-size: 11px; color: ${C.slate500}; margin-bottom: 6px;">Literal: ${ls.literal_meaning}</div>
        <div style="font-size: 11px; color: ${C.slate700}; line-height: 1.5;">${ls.social_meaning}</div>
      `)).join("")}
    </div>`;

    // Recommended actions
    html += sectionTitle("🎯", "Recommended Actions");
    const timelineColors: Record<string, string> = {
      "Short‑term (0‑3 months)": C.emerald,
      "Short-term (0-3 months)": C.emerald,
      "Medium‑term (3‑6 months)": C.amber,
      "Medium-term (3-6 months)": C.amber,
      "Long‑term (6‑12 months)": C.violet,
      "Ongoing": C.indigo,
    };
    const groups: Record<string, typeof data.recommended_actions> = {};
    data.recommended_actions.forEach((a) => { (groups[a.timeline] = groups[a.timeline] || []).push(a); });
    Object.entries(groups).forEach(([tl, items]) => {
      const col = Object.entries(timelineColors).find(([k]) => tl.includes(k.replace("‑", "-").split("(")[0].trim()))?.[1] ?? C.slate500;
      html += `<div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 999px; background: ${col};"></div>
          <span style="font-size: 11px; color: ${C.slate500}; text-transform: uppercase; letter-spacing: 1px;">${tl}</span>
        </div>
        <div style="padding-left: 18px; border-left: 2px solid ${col}30;">
          ${items.map((a) => card(`
            <div style="font-size: 10px; color: ${col}; margin-bottom: 4px;">${a.owner}</div>
            <div style="font-size: 12px; color: ${C.slate700};">${a.action}</div>
          `)).join("")}
        </div>
      </div>`;
    });

    // Executive Implication
    html += sectionTitle("⚡", "Executive Implication");
    html += `<div style="background: ${C.slate900}; border-radius: 16px; padding: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
      ${[
        ["Monitor Next", data.executive_implication.monitor_next],
        ["Risk / Opportunity", data.executive_implication.risk_or_opportunity],
        ["Decision Makers", data.executive_implication.decision_makers_should_understand],
      ].map(([label, val]) => `
        <div>
          <div style="font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">${label}</div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.6;">${val}</div>
        </div>
      `).join("")}
    </div>`;

    html += footer("");
    html += `</div>`;
    container.innerHTML = html;
  }, `campaign-intelligence-${Date.now()}.pdf`);
}

// ─── Article PDF ──────────────────────────────────────────────────────────────

export async function downloadArticlePDF(articleMarkdown: string, meta: CampaignMeta) {
  await renderToPDF((container) => {
    const dateStr = `${new Date(meta.start_date).toLocaleDateString()} – ${new Date(meta.end_date).toLocaleDateString()}`;
    let html = pageHeader("Campaign Article", dateStr, meta.keywords);
    html += `<div style="padding: 0 40px;">`;

    // Parse simplified markdown
    const lines = articleMarkdown.split("\n");
    let inList = false;
    const bodyLines = lines.map((line) => {
      if (line.startsWith("# ")) {
        inList = false;
        return `<h1 style="font-size: 20px; font-weight: 700; color: ${C.slate900}; margin: 24px 0 10px; line-height: 1.3;">${line.replace("# ", "")}</h1>`;
      }
      if (line.startsWith("## ")) {
        inList = false;
        return `<h2 style="font-size: 15px; font-weight: 600; color: ${C.violet}; margin: 20px 0 8px; padding-bottom: 6px; border-bottom: 2px solid ${C.violetLight};">${line.replace("## ", "")}</h2>`;
      }
      if (line.startsWith("### ")) {
        inList = false;
        return `<h3 style="font-size: 13px; font-weight: 600; color: ${C.slate700}; margin: 14px 0 6px;">${line.replace("### ", "")}</h3>`;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const text = line.replace(/^[-*] /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return `<div style="display: flex; gap: 8px; margin-bottom: 4px; padding-left: 8px;"><span style="color: ${C.violet}; flex-shrink: 0;">•</span><span style="font-size: 12px; color: ${C.slate700}; line-height: 1.6;">${text}</span></div>`;
      }
      if (line.trim() === "---") return `<hr style="border: none; border-top: 1px solid ${C.slate300}; margin: 20px 0;" />`;
      if (line.trim() === "") return `<div style="height: 8px;"></div>`;
      if (line.startsWith("|")) return ""; // skip table rows
      const parsed = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
      return `<p style="font-size: 12px; color: ${C.slate700}; line-height: 1.8; margin-bottom: 6px;">${parsed}</p>`;
    });

    html += bodyLines.join("");
    html += footer("");
    html += `</div>`;
    container.innerHTML = html;
  }, `campaign-article-${Date.now()}.pdf`);
}
