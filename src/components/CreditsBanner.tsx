import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { getCredits } from "@/services/socialEcho";

export function CreditsBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  // Fetch credits only if user exists
  const fetchCredits = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: creditsData, error } = await getCredits(user.id);
      if (error) throw error;
      setCredits(creditsData?.remaining_credits ?? 0);
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchCredits();
  }, [user?.id]);

  if (!visible) return null; // dismissed

  // Determine if banner should show
  const showForUser = user ? (credits !== null && credits < 10) : true;
  if (!showForUser) return null;

  const handleButtonClick = () => {
    if (user?.id) navigate("/payments");
    else navigate("/auth"); // sign in / sign up page
  };

  const buttonText = user ? "Get Credits" : "Sign In / Sign Up for Free Credits";

  const bannerText = user
    ? `Your remaining credits are low: ${credits}`
    : "Sign in or sign up to get free credits!";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-300 text-yellow-800 px-6 py-4 shadow-md flex justify-between items-center">
      <div className="flex-1">
        <p className="font-medium">{bannerText}</p>
        {user && <p className="text-sm text-yellow-900">Click on the Get CreditS button to add more .</p>}
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
          onClick={handleButtonClick}
        >
          {buttonText}
        </Button>

        {/* Close X button */}
        <button
          onClick={() => setVisible(false)}
          className="ml-2 text-yellow-900 hover:text-yellow-700 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}