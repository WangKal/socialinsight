import { useState } from "react";
import fs from "fs";
import path from "path";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Download, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export  function GuideDialog({ open, setOpen }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState(null); // "extension" | "link"
  const [step, setStep] = useState(1);
    const { user } = useAuth();
  const reset = () => {
    setMode(null);
    setStep(1);
  };

  const closeDialog = () => {
    reset();
    setOpen(false);
  };


const downloadExtensionZip = async () => {
  try {
    setDownloading(true);
    setProgress(0);

    const response = await fetch(
      "https://socialinsightbackend.onrender.com/api/insights/download/extension/"
    );

    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();

    const url = URL.createObjectURL(
      new Blob([blob], { type: "application/zip" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "socialinsight-extension.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    setStep(2);
  } catch (err) {
    console.error(err);
    alert("Failed to download extension");
  } finally {
    setDownloading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl max-h-[80vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Capture Post for Analysis</DialogTitle>
        </DialogHeader>

        {/* Step 1 – choose capture method */}
        {!mode && (
          <div className="mt-6 grid gap-4">
            <p className="text-gray-600 text-lg">Choose how you want to capture the post data:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-28 rounded-2xl flex flex-col gap-2"
                onClick={() => setMode("extension")}
              >
                <LinkIcon className="w-6 h-6" />
                <span className="font-medium">Use Chrome Extension</span>
              </Button>

              <Button
                variant="outline"
                className="h-28 rounded-2xl flex flex-col gap-2"
                
              >
                <LinkIcon className="w-6 h-6" />
                <span className="font-medium">Paste Post Link</span>
                <span className="font-large">Coming soon</span>
              </Button>
            </div>
          </div>
        )}

        {/* ---------------------- EXTENSION MODE ----------------------- */}
        {mode === "extension" && (
          <div className="mt-4">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 1: Download the Chrome Extension</h2>
                <p className="text-gray-600">Click the button below to download the ZIP file for the extension.</p>

                      <Button
                          className="rounded-xl"
                          onClick={downloadExtensionZip}
                          disabled={downloading}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          {downloading ? "Downloading..." : "Download Extension ZIP"}
                        </Button>
{downloading && (
  <div className="w-full mt-3">
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="text-sm text-gray-600 mt-1">{progress}%</p>
  </div>
)}



                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-4 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 2: Load the Extension</h2>
                <ul className=" mb-8 list-disc pl-5 text-gray-600 space-y-1">
                  <li>Open <strong>chrome://extensions</strong></li>
                  <li>Enable <strong>Developer Mode</strong></li>
              <li>Click <strong>Load Unpacked</strong> and open the extracted folder. Make sure to select the <strong>SocialInsight</strong> folder inside it (<strong>Important</strong>), not the outer folder.</li>

                </ul>

                {/* Image Placeholder */}
                <div className="w-full bg-gray-200 rounded-xl flex items-center justify-center p-4">
  <img
    className="max-w-full max-h-80 object-contain"
    src="/Screenshot1.png"
    alt="Screenshot 1"
  />
</div>


                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="rounded-xl">
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 3: Capture Posts Automatically or Manually</h2>
                <p className="text-gray-600">
                  Visit the social media post you want to analyze, open the extension, and click
                  <strong> Analyze manually(For Manual capture i.e You have to scroll on the post)</strong>.
                  or
                   <strong> Analyze Automatically (A window is opened for that post, analysis is done then closed automatically)</strong>
                </p>
                <p className="text-gray-600">Once the analysis is done it will be available both within the extension and on this site(For a more comprehensive view)
</p>
                {/* Image Placeholder */}
<div className="w-full bg-gray-200 rounded-xl flex flex-col md:flex-row items-center justify-center gap-4 p-4">
  <img className="max-w-full max-h-80 object-contain" src="/Screenshot2.png" alt="Screenshot 2" />
  <img className="max-w-full max-h-80 object-contain" src="/Screenshot3.png" alt="Screenshot 3" />
</div>


                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={closeDialog} className="rounded-xl">
                    Finish
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------- LINK MODE ----------------------- */}
        {mode === "link" && (
          <div className="mt-4">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 1: Paste the Post Link</h2>
                <p className="text-gray-600">Copy the link of the public post and paste it in the field below.</p>

                <input
                  type="text"
                  placeholder="https://example.com/post/..."
                  className="w-full p-3 border rounded-xl"
                />

                {/* Image Placeholder */}
                <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                  Add Screenshot Here
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-4 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 2: We Fetch the Content</h2>
                <p className="text-gray-600">Our system will fetch the post information and prepare it for analysis.</p>

                {/* Image Placeholder */}
                <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                  Add Screenshot Here
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={()=>{ closeDialog; user?navigate("/analytics"):navigate("/auth")}} className="rounded-xl">
                    Finish
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
