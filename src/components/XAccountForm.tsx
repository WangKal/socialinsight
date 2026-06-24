import { useEffect, useMemo, useState } from "react";
import { supabase } from '@/intergrations/supabase/client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { saveXAccount } from "@/services/socialEcho";

interface XAccountFormProps {
  user: any;
  tenantId?: string | null;
  onSaved?: () => void;
}

export function XAccountForm({
  user,
  tenantId = null,
  onSaved,
}: XAccountFormProps) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cookies, setCookies] = useState("");

  const [status, setStatus] =
    useState<string>("inactive");

  const [lastUsed, setLastUsed] =
    useState<string | null>(null);

  const [lastLogin, setLastLogin] =
    useState<string | null>(null);

  const [errorCount, setErrorCount] =
    useState<number>(0);

  const hasAuthToken = useMemo(
    () => cookies.includes("auth_token="),
    [cookies]
  );

  const hasCt0 = useMemo(
    () => cookies.includes("ct0="),
    [cookies]
  );

  const credentialsValid =
    hasAuthToken && hasCt0;

  useEffect(() => {
    if (!user?.id) return;

    loadAccount();
  }, [user?.id]);

  async function loadAccount() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("x_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setStatus("inactive");
        return;
      }

      setCookies(data.cookies || "");

      setLastUsed(
        data.last_used_at || null
      );

      setLastLogin(
        data.last_login_at || null
      );

      setErrorCount(
        data.error_count || 0
      );

      setStatus(
        data.status || "inactive"
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!credentialsValid) {
        toast({
          title: "Invalid Credentials",
          description:
            "Both auth_token and ct0 are required.",
          variant: "destructive",
        });

        return;
      }

      setSaving(true);

      await saveXAccount({
        userId: user.id,
        tenantId,
        email: user.email,
        cookies,
      });

      setStatus("active");

      toast({
        title: "Success",
        description:
          "X account credentials saved successfully.",
      });

      onSaved?.();

      await loadAccount();
    } catch (err: any) {
      console.error(err);

      toast({
        title: "Error",
        description:
          err.message ||
          "Failed to save X account.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            X Account Configuration
          </span>

          {status === "active" ? (
            <Badge className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <Label>
              Email / Username
            </Label>

            <Input
              value={user?.email || ""}
              disabled
              className="mt-2"
            />
          </div>

          <div>
            <Label>Status</Label>

            <Input
              value={status}
              disabled
              className="mt-2"
            />
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <Label>Last Login</Label>

            <Input
              disabled
              value={
                lastLogin
                  ? new Date(
                      lastLogin
                    ).toLocaleString()
                  : "-"
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label>Last Used</Label>

            <Input
              disabled
              value={
                lastUsed
                  ? new Date(
                      lastUsed
                    ).toLocaleString()
                  : "-"
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label>Error Count</Label>

            <Input
              disabled
              value={String(errorCount)}
              className="mt-2"
            />
          </div>

        </div>

        <div>

          <Label>
            X Authentication Credentials
          </Label>

          <Textarea
            value={cookies}
            onChange={(e) =>
              setCookies(
                e.target.value
              )
            }
            rows={10}
            className="mt-2 font-mono"
            placeholder={`auth_token=376f35daa5748; ct0=5ab0b2790f2b60dab94951d5058467a5662ded811bd776ac69fcf123a25fb39f5b3a;`}
          />

          <div className="mt-4 space-y-2">

            <div className="flex items-center gap-2">
              {hasAuthToken ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}

              <span className="text-sm">
                auth_token detected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasCt0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}

              <span className="text-sm">
                ct0 detected
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Paste the X authentication
              string containing both
              auth_token and ct0.
              These credentials are used
              by twscrape when running
              campaign analysis jobs.
            </p>

          </div>

        </div>

        <div className="flex justify-end">

          <Button
            onClick={handleSave}
            disabled={
              saving ||
              !credentialsValid
            }
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save X Account
              </>
            )}
          </Button>

        </div>

      </CardContent>
    </Card>
  );
}