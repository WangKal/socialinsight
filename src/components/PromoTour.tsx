import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import {
  Gift,
  Trophy,
  Shuffle,
  BarChart2,
  ShieldAlert,
  ChevronRight,
  Globe2,
  Clock3,
} from "lucide-react";
import { useState } from "react";

export function PromoTour() {
  const [activePromoTour, setActivePromoTour] = useState(0);

  const promoTourSteps = [
    {
      icon: Gift,
      title: "Create Promo",
      description:
        "Create your promo, choose the competition type, add the prize, timing, winner count, and other details inside the form.",
      color: "from-violet-500 to-purple-600",
      image:
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80",
    },
    {
      icon: Globe2,
      title: "Add Social Media Source",
      description:
        "After creating the promo, add the social media site or post where the promo is happening so entries can be tracked correctly.",
      color: "from-blue-500 to-cyan-600",
      image:
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    },
    {
      icon: Clock3,
      title: "Runs Automatically",
      description:
        "Once scheduled or active, the promo runs automatically. After the end time is reached, winner selection is done automatically based on your configured rules.",
      color: "from-emerald-500 to-teal-600",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    },
    {
      icon: Trophy,
      title: "Automatic Winner Selection",
      description:
        "Winners are selected automatically after the promo closes using the competition method you chose, such as random, first N, every Nth, or correct answer.",
      color: "from-amber-500 to-orange-600",
      image:
        "https://images.unsplash.com/photo-1579888944880-d98341245702?w=800&q=80",
    },
    {
      icon: ShieldAlert,
      title: "Promo Disclaimer",
      description:
        "Promos must follow platform rules and applicable laws. We provide the tools to run and manage promos, but responsibility for participant conduct, misuse, abuse, fraud, or any ill behaviour remains with the promo organizer.",
      color: "from-rose-500 to-red-600",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-5">
        <div className="text-center space-y-3">
          <Badge className="px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/20">
            <Gift className="w-4 h-4 mr-2" />
            Promo Setup Guide
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            How Promo Management Works
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            A quick guide to creating promos, attaching the source, running them automatically, and selecting winners.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 items-start">
          {/* Left side */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {promoTourSteps.map((step, index) => (
              <motion.button
                type="button"
                key={index}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setActivePromoTour(index)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activePromoTour === index
                    ? "border-violet-400 bg-violet-50 shadow-md"
                    : "border-border/60 bg-background hover:border-violet-200 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform ${
                      activePromoTour === index ? "scale-105" : ""
                    }`}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">
                        {step.title}
                      </h3>
                      {activePromoTour === index && (
                        <Badge className="bg-violet-600 text-white text-[10px]">
                          Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 text-violet-500 transition-transform flex-shrink-0 ${
                      activePromoTour === index ? "translate-x-1" : ""
                    }`}
                  />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right side */}
          <motion.div
            key={activePromoTour}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border shadow-xl bg-black">
              <img
                src={promoTourSteps[activePromoTour].image}
                alt={promoTourSteps[activePromoTour].title}
                className="w-full h-[280px] sm:h-[320px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <Badge
                  className={`mb-3 bg-gradient-to-r ${promoTourSteps[activePromoTour].color} text-white border-0`}
                >
                  Step {activePromoTour + 1} of {promoTourSteps.length}
                </Badge>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {promoTourSteps[activePromoTour].title}
                </h3>

                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  {promoTourSteps[activePromoTour].description}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center mt-4">
              {promoTourSteps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActivePromoTour(index)}
                  className={`h-2 rounded-full transition-all ${
                    activePromoTour === index
                      ? "w-8 bg-violet-600"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}