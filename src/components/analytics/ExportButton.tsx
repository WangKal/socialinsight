import { motion } from "motion/react";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface ExportButtonProps {
  onExport?: () => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate PDF generation
    // In a real app, you'd use a library like jsPDF or react-pdf
    setTimeout(() => {
      // Create a simple download
      const element = document.createElement("a");
      const text = "Social Post Analytics Report\n\nThis is a placeholder for the PDF export.";
      const file = new Blob([text], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `analytics-report-${new Date().getTime()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setIsExporting(false);
      
      if (onExport) {
        onExport();
      }
    }, 2000);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}

      {isExporting && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        />
      )}
    </Button>
  );
}
