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
        <h2 className="text-3xl mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          All Campaigns
        </h2>
        <p className="text-gray-600">Manage and analyze your marketing campaigns</p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
          <p className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {campaigns.length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <p className="text-sm text-gray-600 mb-1">Total Posts</p>
          <p className="text-3xl text-gray-900">{totalPosts}</p>
        </motion.div>
        <motion.div
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
        </motion.div>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">No campaigns yet. Assign posts to campaigns to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                onClick={() => onSelectCampaign(campaign.id)}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 cursor-pointer group hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${campaign.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{campaign.postsCount}</span>
                    </div>
                    <div className="text-xs text-gray-500">{campaign.totalReplies} replies</div>
                  </div>
                </div>

                <h3 className="text-xl text-gray-900 mb-2">{campaign.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>

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
