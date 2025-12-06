import { BarChart3, TrendingUp, Users, ExternalLink } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Extension Popup Container */}
      <div className="extension-popup bg-card rounded-lg shadow-lg overflow-hidden w-full max-w-[360px]">
        {/* Header */}
        <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
          <BarChart3 className="w-5 h-5" />
          <h1 className="font-semibold text-base">Social Analytics</h1>
        </header>

        {/* Action Buttons */}
        <div className="px-4 pt-4 pb-3 flex gap-2">
          <button className="btn-primary flex-1 px-3 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all">
            <TrendingUp className="w-4 h-4" />
            Analyze
          </button>
          <button className="btn-secondary flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all">
            Export
          </button>
          <button className="btn-tertiary flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all">
            Settings
          </button>
        </div>

        {/* Status/Progress Area */}
        <div className="px-4 pb-3">
          <div className="bg-muted rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground font-medium">Syncing data...</p>
              <span className="text-xs text-muted-foreground">68%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="analytics-list px-4 pb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Recent Activity
          </h2>
          <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-custom">
            <div className="analytics-card bg-card border border-border rounded-md p-3 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Instagram Engagement Up 24%
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your recent post gained 1.2k interactions
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </div>

            <div className="analytics-card bg-card border border-border rounded-md p-3 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    New Follower Milestone
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    You've reached 10,000 followers on Twitter
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </div>

            <div className="analytics-card bg-card border border-border rounded-md p-3 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Best Posting Time Detected
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tuesday 2-4pm shows highest engagement
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </div>

            <div className="analytics-card bg-card border border-border rounded-md p-3 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Content Performance Report
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Weekly summary is ready for review
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </div>

            <div className="analytics-card bg-card border border-border rounded-md p-3 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Audience Demographics Updated
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your audience is primarily 25-34 years old
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-muted px-4 py-3 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Pro Account</p>
              <p className="text-[10px] text-muted-foreground">user@email.com</p>
            </div>
          </div>
          <a 
            href="#" 
            className="text-xs text-primary hover:underline font-medium"
          >
            Dashboard →
          </a>
        </footer>
      </div>

      <style>{`
        .extension-popup {
          min-height: 500px;
          max-height: 600px;
        }

        .btn-primary {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .btn-primary:hover {
          background: hsl(var(--primary) / 0.9);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-secondary {
          background: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
          border: 1px solid hsl(var(--border));
        }

        .btn-secondary:hover {
          background: hsl(var(--secondary) / 0.8);
          border-color: hsl(var(--primary));
        }

        .btn-tertiary {
          background: transparent;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
        }

        .btn-tertiary:hover {
          background: hsl(var(--muted));
        }

        .progress-bar-container {
          height: 6px;
          background: hsl(var(--border));
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
          border-radius: 999px;
          transition: width 0.3s ease;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
          }
        }

        .analytics-card {
          transition: all 0.2s ease;
        }

        .analytics-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>
    </div>
  );
};

export default Index;
