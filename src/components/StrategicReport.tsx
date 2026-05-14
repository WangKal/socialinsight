import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  MessageSquare,
  Eye,
  Lightbulb,
  Users,
  Target,
  AlertCircle,
  Quote,
  Download,
  Loader2,
} from "lucide-react";

export interface StrategicReport {
  consensus_signal?: string;
  engagement_integrity?: {
    classification?: string;
    reasoning_density?: string;
    language_signal?: string;
  };
  why_hypotheses?: Array<{
    driver_title?: string;
    pattern_label?: string;
    hypothesis?: string;
    evidence_excerpt?: string;
  }>;
  friction_dissent?: {
    summary?: string;
    friction_type?: string;
    explanation?: string;
  };
  linguistic_signal?: Array<{
    phrase?: string;
    literal_meaning?: string;
    social_meaning?: string;
  }>;
  executive_implication?: {
    decision_makers_should_understand?: string;
    risk_or_opportunity?: string;
    monitor_next?: string;
  };
  markdown_report?: string;
}

interface StrategicReportProps {
  strategicReport?: StrategicReport | null;
  title?: string;
}

export function StrategicReport({
  strategicReport,
  title = "Discourse Intelligence Report",
}: StrategicReportProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      setDownloading(true);

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("socialinsight-strategic-report.pdf");
    } catch (error) {
      console.error("PDF download failed:", error);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (!strategicReport) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Strategic Report Available
            </h3>
            <p className="text-slate-500">
              Strategic discourse intelligence will appear here once analysis is complete.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getClassificationColor = (classification?: string) => {
    if (!classification) return "bg-slate-100 text-slate-700 border-slate-300";

    const lower = classification.toLowerCase();

    if (lower.includes("organic")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }

    if (lower.includes("template-heavy")) {
      return "bg-red-100 text-red-800 border-red-300";
    }

    if (lower.includes("mixed")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }

    if (lower.includes("low-information")) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }

    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const getPatternColor = (pattern?: string) => {
    if (!pattern) return "bg-slate-100 text-slate-700 border-slate-300";

    const lower = pattern.toLowerCase();

    if (lower.includes("trust") || lower.includes("deficit")) {
      return "bg-red-100 text-red-800 border-red-300";
    }

    if (lower.includes("economic") || lower.includes("pressure")) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }

    if (lower.includes("cultural") || lower.includes("resistance")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }

    if (lower.includes("support") || lower.includes("aspirational")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }

    if (lower.includes("historical") || lower.includes("comparison")) {
      return "bg-purple-100 text-purple-800 border-purple-300";
    }

    if (lower.includes("performance") || lower.includes("critique")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }

    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const getFrictionColor = (frictionType?: string) => {
    if (!frictionType) return "bg-slate-100 text-slate-700 border-slate-300";

    const lower = frictionType.toLowerCase();

    if (lower.includes("memory")) {
      return "bg-purple-100 text-purple-800 border-purple-300";
    }

    if (lower.includes("evidence")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }

    if (lower.includes("emotion")) {
      return "bg-red-100 text-red-800 border-red-300";
    }

    if (lower.includes("mixed")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }

    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={downloadPDF}
          disabled={downloading}
          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      </div>

      <div
        ref={reportRef}
        className="w-full space-y-6 bg-gradient-to-b from-slate-50 to-white p-4 md:p-6 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            STRATEGIC INTELLIGENCE REPORT
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {title}
          </h1>

          <p className="text-slate-600">
            Evidence-based interpretation of observed discourse patterns
          </p>
        </div>

        {strategicReport.consensus_signal && (
          <Card className="border-2 border-slate-900 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  Consensus Signal
                </h2>
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-medium">
                {strategicReport.consensus_signal}
              </p>
            </CardContent>
          </Card>
        )}

        {strategicReport.engagement_integrity && (
          <Card className="border border-slate-300 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-700" />
                <CardTitle className="text-slate-900 uppercase tracking-wide text-sm">
                  Engagement Integrity Analysis
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {strategicReport.engagement_integrity.classification && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Classification
                    </p>
                    <Badge
                      className={`${getClassificationColor(
                        strategicReport.engagement_integrity.classification
                      )} border px-3 py-1.5 text-sm font-semibold`}
                    >
                      {strategicReport.engagement_integrity.classification}
                    </Badge>
                  </div>
                )}

                {strategicReport.engagement_integrity.reasoning_density && (
                  <div className="space-y-2 md:col-span-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Reasoning Density
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {strategicReport.engagement_integrity.reasoning_density}
                    </p>
                  </div>
                )}

                {strategicReport.engagement_integrity.language_signal && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Language Signal
                    </p>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 text-sm">
                      {strategicReport.engagement_integrity.language_signal}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!!strategicReport.why_hypotheses?.length && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                Why Hypotheses
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {strategicReport.why_hypotheses.map((hypothesis, index) => (
                <Card
                  key={`${hypothesis.driver_title || "driver"}-${index}`}
                  className="border border-slate-300 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-white pb-4">
                    <div className="space-y-2">
                      <CardTitle className="text-base font-bold text-slate-900">
                        {hypothesis.driver_title || `Driver ${index + 1}`}
                      </CardTitle>

                      {hypothesis.pattern_label && (
                        <Badge
                          className={`${getPatternColor(
                            hypothesis.pattern_label
                          )} border px-3 py-1 text-xs font-semibold`}
                        >
                          {hypothesis.pattern_label}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {hypothesis.hypothesis && (
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {hypothesis.hypothesis}
                      </p>
                    )}

                    {hypothesis.evidence_excerpt && (
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
                        <div className="flex gap-2">
                          <Quote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            “{hypothesis.evidence_excerpt}”
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {strategicReport.friction_dissent && (
          <Card className="border-2 border-orange-300 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-700" />
                <CardTitle className="text-orange-900 uppercase tracking-wide text-sm font-bold">
                  Friction & Dissent Analysis
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {strategicReport.friction_dissent.friction_type && (
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Friction Type:
                  </p>
                  <Badge
                    className={`${getFrictionColor(
                      strategicReport.friction_dissent.friction_type
                    )} border px-4 py-1.5 text-sm font-bold`}
                  >
                    {strategicReport.friction_dissent.friction_type}
                  </Badge>
                </div>
              )}

              {strategicReport.friction_dissent.summary && (
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <p className="text-base text-slate-800 font-medium mb-2">
                    Summary
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {strategicReport.friction_dissent.summary}
                  </p>
                </div>
              )}

              {strategicReport.friction_dissent.explanation && (
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <p className="text-base text-slate-800 font-medium mb-2">
                    Explanation
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {strategicReport.friction_dissent.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!!strategicReport.linguistic_signal?.length && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                Linguistic Signal
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategicReport.linguistic_signal.map((signal, index) => (
                <Card
                  key={`${signal.phrase || "phrase"}-${index}`}
                  className="border border-slate-300 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50 pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-purple-600" />
                      {signal.phrase || "Phrase"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {signal.literal_meaning && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Literal Meaning
                        </p>
                        <p className="text-sm text-slate-700">
                          {signal.literal_meaning}
                        </p>
                      </div>
                    )}

                    {signal.social_meaning && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
                          Social Meaning
                        </p>
                        <p className="text-sm text-slate-800 font-medium">
                          {signal.social_meaning}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {strategicReport.executive_implication && (
          <Card className="border-2 border-slate-900 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  Executive Implication
                </h2>
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {strategicReport.executive_implication
                  .decision_makers_should_understand && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-700" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Understand
                      </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {
                          strategicReport.executive_implication
                            .decision_makers_should_understand
                        }
                      </p>
                    </div>
                  </div>
                )}

                {strategicReport.executive_implication.risk_or_opportunity && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Risk / Opportunity
                      </p>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {strategicReport.executive_implication.risk_or_opportunity}
                      </p>
                    </div>
                  </div>
                )}

                {strategicReport.executive_implication.monitor_next && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Monitor Next
                      </p>
                    </div>

                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {strategicReport.executive_implication.monitor_next}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-8 pb-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            End of Strategic Discourse Intelligence Report
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Evidence-based interpretation of observed discourse patterns
          </p>
        </div>
      </div>
    </div>
  );
}