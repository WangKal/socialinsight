import { Home, LayoutDashboard, BarChart3, Bell, MessageSquare, Shield, Gift,Settings,FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/services/socialEcho";
import { useEffect, useState } from "react";

type PageType =
  | "home"
  | "analytics"
  | "dashboard"
  | "notifications"
  | "messaging"
  | "admin";

export function PageSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
const [showPromoMenu, setShowPromoMenu] = useState(false);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {


    (async () => {
      try {
        const profile = await getUserProfile(user?.id);
        const userRole = profile?.role || "";

        setRole(userRole);

        //  Protect admin route
        const isAdminRoute = location.pathname === "/admin";
        const isAdminUser =
          userRole === "super_admin" || userRole === "admin";

        if (isAdminRoute && !isAdminUser) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, location.pathname, navigate]);

  if (loading) return null;

  const pages = [
    { id: "home" as const, label: "Home", icon: Home, path: "/" },
  
    // Only include Admin page if allowed
    ...(role === "super_admin" || role === "admin"
      ? [
        { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { id: "analyses" as const, label: "Analyses", icon: FileText, path: "/analytics-list/personal" },
   /* { id: "analytics" as const, label: "Analytics", icon: BarChart3, path: "/analytics" },*/
   /* { id: "promos" as const, label: "Promos", icon: Gift, hasSubmenu: true },*/
    { id: "notifications" as const, label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "messaging" as const, label: "Messages", icon: MessageSquare, path: "/messages" },

          {
            id: "admin" as const,
            label: "Admin",
            icon: Shield,
            path: "/admin",
          },
        ]
      : []),
  ];

  const currentPage =
    pages.find((p) => p.path === location.pathname)?.id || "home";

    const handlePromoClick = (pageId: "promos") => {
    if (pageId === "promos") {
      setShowPromoMenu(!showPromoMenu);
    }
  };

  return (
    <>
      {/* Promo Submenu */}
      {showPromoMenu && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-40 min-w-[200px]">
          <button
            onClick={() => {
              navigate("/promos")
              setShowPromoMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-violet-50 text-left transition-colors"
          >
            <Gift className="w-4 h-4 text-violet-600" />
            <span className="text-gray-900">Public Promos</span>
          </button>
          <button
            onClick={() => {
              navigate("/admin-promos")
             
              setShowPromoMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-violet-50 text-left transition-colors"
          >
            <Settings className="w-4 h-4 text-violet-600" />
            <span className="text-gray-900">Admin Promos</span>
          </button>
        </div>
      )}

      {/* Backdrop */}
      {showPromoMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowPromoMenu(false)}
        />
      )}

    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex gap-1 z-50">
      {pages.map((page) => {
        const Icon = page.icon;
        const active = currentPage === page.id;

        return (
          <button
            key={page.id}
            onClick={() =>{
              if (page.hasSubmenu) {
                  handlePromoClick(page.id);
                } else {
                  navigate(page.path);
                  setShowPromoMenu(false);
                }


             }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              active
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title={page.label}
          >
            <Icon className="w-4 h-4" />
            {active && (
              <span className="text-sm hidden sm:inline">
                {page.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
    </>
  );
}