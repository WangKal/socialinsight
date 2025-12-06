import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, CreditCard } from "lucide-react";
import {useAuth} from "@/hooks/use-auth";
import {useToast } from "@/hooks/use-toast";
import {getUserProfile, updateUserProfile } from "@/services/socialEcho"


export default function Settings() {
  const { user,changePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } =useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);

      const profile = await getUserProfile(user.id);

      setFullName(profile?.full_name || user.user_metadata.full_name || "");
      setPhone(profile?.phone_number || "");
      setCompany(profile?.company || "");

      setLoading(false);
    })();
  }, [user]);

  const saveChanges = async () => {
    try {
      setSaving(true);

      await updateUserProfile(user.id, {
        full_name: fullName,
        phone_number: phone,
        company: company,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };
const handleResetPassword = async () => {
  // Validate fields
  if (!currentPassword || !password || !confirm) {
    return toast({
      title: "Password change",
      description: "Please fill in all fields.",
      variant: "destructive",
    });
  }

  if (password !== confirm) {
    return toast({
      title: "Password change",
      description: "New password do not match Confirm password.",
      variant: "destructive",
    });
  }

  if (password.length < 6) {
    return toast({
      title: "Password change",
      description: "Password must be at least 6 characters.",
      variant: "destructive",
    });
  }

  setLoading(true);

  // Attempt change
  const result = await changePassword(user.email, currentPassword, password);

  setLoading(false);

  if (result.error) {
    return toast({
      title: "Password change",
      description: result.error.message || "Old password is incorrect.",
      variant: "destructive",
    });
  }

  // Success
  toast({
    title: "Password change",
    description: "Password changed successfully.",
    variant: "constructive",
  });
};

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
         {/** <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>**/}
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
         {/** <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>*/}
        </TabsList>

    <TabsContent value="profile">
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Profile Information
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254700000000"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-2"
            />
          </div>

          <Button className="mt-4" onClick={saveChanges} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </TabsContent>

       {/** <TabsContent value="notifications">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Notification Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates about your analyses</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Analysis Complete</p>
                  <p className="text-sm text-muted-foreground">Notify when an analysis finishes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Campaign Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about campaign updates</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>
**/}
        <TabsContent value="security">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="current">Current Password</Label>
                    <Input id="current" type="password" className="mt-2"
                    value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" type="password" className="mt-2"
                    type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input id="confirm" type="password" className="mt-2"   type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
                  </div>
                  <Button
                     onClick={handleResetPassword}
              disabled={loading}
                  >Update Password</Button>
                </div>
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
{/*
        <TabsContent value="billing">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Billing Information</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Current Plan</p>
                  <p className="text-sm text-muted-foreground">Pro Plan - $49/month</p>
                </div>
                <Button variant="outline">Change Plan</Button>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-4">Payment Method</h3>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                    </div>
                  </div>
                  <Button variant="ghost">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>*/}
      </Tabs>
    </div>
  );
}
