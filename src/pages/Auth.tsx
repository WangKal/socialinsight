import { useState,useEffect } from "react";
import { Link ,useNavigate} from "react-router-dom";

import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';

type AuthMode = "signin" | "signup" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user,forgotPassword } = useAuth();
  const navigate = useNavigate();


  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleFlip = (newMode: AuthMode) => {
    setIsFlipping(true);
    setTimeout(() => {
      setMode(newMode);
      setFormData({ company:"", name: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => setIsFlipping(false), 50);
    }, 300);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // -----------------------------
    // 🔹 SIGN IN
    // -----------------------------
    if (mode === "signin") {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to your account.",
        });
      }
    }

    // -----------------------------
    // 🔹 SIGN UP
    // -----------------------------
    else if (mode === "signup") {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.company
      );

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account Exists",
            description:
              "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Check Your Email",
          description:
            "We’ve sent you a confirmation link. Please check your inbox (or spam folder) to activate your account.",
        });
      }
    }

    // -----------------------------
    // 🔹 FORGOT PASSWORD
    // -----------------------------
    else if (mode === "forgot") {
      // If you have a real endpoint, replace this:
      const { error } = await forgotPassword(formData.email)
if(error){
toast({
            title: "Reset Password Error",
            description: error.message,
            variant: "destructive",
          });
}
else{
  toast({
        title: "Email Sent",
        description: "Check your email for reset instructions.",
      });
}
      
    }
  } catch (err) {
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Flipcard Container */}
        <div className="relative" style={{ perspective: "1000px" }}>
          <div
            className={`relative transition-transform duration-500 ${
              isFlipping ? "scale-95 opacity-80" : "scale-100 opacity-100"
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
            }}
          >
            <div className="bg-card border border-border rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {mode === "forgot" ? (
                    <Mail className="w-8 h-8 text-primary" />
                  ) : mode === "signup" ? (
                    <User className="w-8 h-8 text-primary" />
                  ) : (
                    <Lock className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {mode === "forgot"
                    ? "Reset Password"
                    : mode === "signup"
                    ? "Create Account"
                    : "Welcome Back"}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {mode === "forgot"
                    ? "Enter your email to receive reset instructions"
                    : mode === "signup"
                    ? "Sign up to get started with analytics"
                    : "Sign in to access your dashboard"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Company</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="My Company or Personal"
                        className="pl-10"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
<div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  </>                  
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === "signin" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleFlip("forgot")}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {mode === "forgot"
                        ? "Sending..."
                        : mode === "signup"
                        ? "Creating account..."
                        : "Signing in..."}
                    </span>
                  ) : mode === "forgot" ? (
                    "Send Reset Link"
                  ) : mode === "signup" ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center text-sm">
                {mode === "signin" ? (
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleFlip("signup")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleFlip("signin")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
