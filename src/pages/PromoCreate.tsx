import { motion } from "motion/react";
import { ArrowLeft, Gift } from "lucide-react";
import { Button } from "../components/ui/button";
import { PromoForm, PromoFormData } from "../components/promo/PromoForm";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPromo } from "@/services/socialEcho";



export default function PromoCreate() {

  const navigate = useNavigate();
const queryClient = useQueryClient();


  const createPromoMutation = useMutation({
    mutationFn: createPromo, // now calls the service function
    onSuccess: () => {
      queryClient.invalidateQueries(["promos"]);
      navigate("/admin-promos");
    },
    onError: (err: any) => {
      console.error("Failed to create promo:", err);
      alert(err.message || "Failed to create promo");
    },
  });



const handleSubmit = (data: PromoFormData) => {
  createPromoMutation.mutate(data);
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/admin-promos")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Promos
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create New Promo
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Set up your giveaway rules and start engaging with your community
          </p>
        </motion.div>

        {/* Form */}
        <PromoForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin-promos")}
        />
      </div>
    </div>
  );
}
