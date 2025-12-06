import { useEffect, useState } from "react";
import { supabase } from "@/intergrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/use-auth';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);

  // ----------------------------
  // Detect Supabase password reset token
  // ----------------------------
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));

    const accessToken = params.get("access_token");

    if (accessToken) {
      setTokenExists(true);
      setOpen(true); // auto open dialog
    } else {
      setTokenExists(false);
    }
  }, []);

  // ----------------------------
  // Reset password
  // ----------------------------
  const handleResetPassword = async () => {
    if (!password || !confirm) return alert("Enter both fields");
    if (password !== confirm) return alert("Passwords do not match");
    if (password.length < 6)
      return alert("Password must be at least 6 characters");

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Redirect to login page
    navigate("/auth?reset=success");
  };

  return (
    <>
      {/* Empty screen behind the dialog */}
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        {!tokenExists && (
          <p className="text-center text-muted-foreground">
            Invalid or missing reset token.
          </p>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
