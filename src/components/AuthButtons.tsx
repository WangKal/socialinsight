import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AuthButtons() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      {user ? (
        <>
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="hidden sm:inline-flex"
          >
            Sign Out
            <LogOut className="w-4 h-4 ml-2" />
          </Button>

          {/* Get Started / Analytics */}
          <Link to="/analytics">
            <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              Start Analyzing
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </>
      ) : (
        <>
          {/* Sign In */}
          <Link to="/auth">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>

          {/* Get Started */}
          <Link to="/auth">
            <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
