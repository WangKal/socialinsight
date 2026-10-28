import { motion } from "motion/react";
import { Briefcase, ArrowLeft, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { CampaignCard } from "./CampaignCard";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  color: string;
  postsCount: number;
  avgSentiment: number;
  avgAgreement: number;
  totalReplies: number;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaignId: string) => void;
  onBack: () => void;
}

export function CampaignsList({ campaigns, onSelectCampaign, onBack }: CampaignsListProps) {
  const totalPosts = campaigns.reduce((sum, c) => sum + c.postsCount, 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + c.totalReplies, 0);
  const avgSentiment = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.avgSentiment, 0) / campaigns.length)
    : 0;
  const avgAgreement = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.avgAgreement, 0) / campaigns.length)
    : 0;
    const sanitizeName = (str) => 
  String(str || '').replace(/^\[\s*["']?|["']?\s*\]$/g, '').replace(/^["']|["']$/g, '').trim();

// Example Outputs:
// '["Marketing"]'  -> "Marketing"
// '["Marketing"]'  -> "Marketing"
// 'Marketing'      -> "Marketing"
// '"Marketing"'    -> "Marketing"
// ["Marketing"]    -> "Marketing"
  return (
    <>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Overview
      </Button>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Campaign library
        </p>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          All Campaigns
        </h2>
        <p className="text-sm text-muted-foreground">Manage and analyze your grouped conversations.</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 max-w-xl bg-card border border-border rounded-2xl divide-x divide-border overflow-hidden mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Total campaigns</p>
          <p className="text-2xl font-semibold text-foreground tabular-nums">
            {campaigns.length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Total posts</p>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{totalPosts}</p>
        </motion.div>
     {/**   <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <p className="text-sm text-gray-600 mb-1">Avg Sentiment</p>
          <p
            className={`text-3xl ${
              avgSentiment > 70
                ? "text-green-600"
                : avgSentiment > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {avgSentiment}%
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <p className="text-sm text-gray-600 mb-1">Avg Agreement</p>
          <p
            className={`text-3xl ${
              avgAgreement > 60
                ? "text-green-600"
                : avgAgreement > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {avgAgreement}%
          </p>
        </motion.div>*/}
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 text-center border border-dashed border-border">
          <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No campaigns yet</p>
          <p className="text-sm text-muted-foreground mt-1">Assign posts to campaigns to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                onClick={() => onSelectCampaign(campaign.id)}
                className="bg-card rounded-2xl p-5 border border-border cursor-pointer group hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{campaign.postsCount}</span>
                    </div>
                    <div className="text-xs text-gray-500">{campaign.totalReplies} replies</div>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-foreground mb-2">{sanitizeName(campaign.name)}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Sentiment</div>
                    <div
                      className={`flex items-center gap-1 ${
                        campaign.avgSentiment > 70
                          ? "text-green-600"
                          : campaign.avgSentiment > 40
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>{campaign.avgSentiment}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Agreement</div>
                    <div
                      className={`flex items-center gap-1 ${
                        campaign.avgAgreement > 60
                          ? "text-green-600"
                          : campaign.avgAgreement > 40
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>{campaign.avgAgreement}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
