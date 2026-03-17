import{useState} from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DailyAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export function DailyAnalysisDialog({ isOpen, onClose, onSubmit }: DailyAnalysisDialogProps) {
  const [url, setUrl] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Daily Analysis</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">X Account URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="https://x.com/username"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => { onSubmit(url); setUrl(""); }}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}