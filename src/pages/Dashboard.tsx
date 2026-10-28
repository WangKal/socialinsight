import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { CampaignsList, Campaign } from "@/components/CampaignsList";
import { CampaignView } from "@/components/CampaignView";
import { PostsTable, Post } from "@/components/PostsTable";
import { AssignPostDialog } from "@/components/AssignPostDialog";
import { AddLinkDialog } from "@/components/analytics/AddLinkDialog";
import { SearchDialog } from "@/components/analytics/SearchDialog";
import { DailyAnalysisDialog } from "@/components/analytics/DailyAnalysisDialog";
import { Globe, User, Briefcase, Link as LinkIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPostsByUser, assignPost, getCampaignsByUser, submitDailyRequest, createSocialCampaign,getCampaign } from "@/services/socialEcho"

import {useAuth } from "@/hooks/use-auth"
import {useToast } from "@/hooks/use-toast"
import { encryptId } from "@/hooks/encrypt";

// Predefined campaigns


// Mock data with campaign assignments

type ViewType = "overview" | "general" | "personal" | "campaigns-list" | "campaign-detail";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState<ViewType>("overview");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<string | null>(null);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [isDailyRequestOpen, setIsDailyRequestOpen] = useState(false);
  const [xAccountUrl, setXAccountUrl] = useState("");
  const { toast } =useToast();


useEffect(() => {
  if (!user?.id) return;    // Don't run until user is loaded

  async function load() {
 
    const result = await getPostsByUser(user.id);
   
    setPosts(result);
  }

  load();
}, [user]);

useEffect(() => {
  if (!user?.id) return;    // Don't run until user is loaded

  async function load() {
 
    const result = await getCampaignsByUser(user.id);
   
    setUserCampaigns(result);
  }

  load();
}, [user]);


  // Calculate stats
  const generalPosts = posts.filter((p) => p.category == null || p.category.length==0 || p.category == "NULL");
  const personalPosts = posts.filter((p) => p.category === "personal");
  const campaignPosts = posts.filter((p) => p.campaign != null);


  const campaigns: Campaign[] = (userCampaigns || []).map((campaign) => {
    const campaignPostsList = campaignPosts.filter((p) => p.campaign == campaign.id);

    return {
      ...campaign,
      postsCount: campaignPostsList.length,
      totalReplies: campaignPostsList.reduce((sum, p) => sum + p.replies, 0),
      avgSentiment: campaignPostsList.length > 0
        ? Math.round(campaignPostsList.reduce((sum, p) => sum + p.sentiment_distribution?.positive?.percentage, 0) / (campaignPostsList.length))
        : 0,
      avgAgreement: campaignPostsList.length > 0
        ? Math.round(campaignPostsList.reduce((sum, p) => sum + p.agreement_distribution?.agree?.percentage, 0) / (campaignPostsList.length))
        : 0,
    };
  });
    const sanitizeName = (str) => 
  String(str || '').replace(/^\[\s*["']?|["']?\s*\]$/g, '').replace(/^["']|["']$/g, '').trim();
const calculateAvg = (
  postsList: Post[],
  field: "sentiment" | "agreement"
) => {
  if (postsList.length === 0) return 0;

  const total = postsList.reduce((sum, p) => {
    const value =
      field === "sentiment"
        ? p.sentiment_distribution?.positive?.percentage
        : p.agreement_distribution?.agree?.percentage;

    return sum + (value ?? 0);
  }, 0);

  return Math.round(total / postsList.length);
};


  const handleViewPost = (postId: string) => {
      const encrypted = encryptId(postId);
      navigate(`/analytics?id=${encodeURIComponent(encrypted)}`);
   // alert(`Viewing analysis for post: ${posts.find(p => p.id === postId)?.title}`);
  };

  const handleAssignPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsAssignOpen(true);
  };

  const handleAssign = async (category: "personal" | "campaign" | "removeCampaign" | "removePersonal", campaignId?: string,newCampaignName?:string, description?:string) => {
    if (!selectedPostId) return;
    let old_category = selectedPostId.category
   let n_c = (category=="personal"? "personal":(category=="removePersonal" && category !="personal"? "":old_category));

  const result = await assignPost(selectedPostId,user.id, category,campaignId, newCampaignName,description);
  if (result.error) {
   toast({
              title: 'Post assignment.',
              description: `Assigment failed ${result.error}`,
              variant: 'destructive',
            });
          
  } else {
       toast({
              title: 'Post assignment.',
              description: `Assigment was successful`,
              variant: 'constructive',
            });
      

       if(category == "personal"){
    setPosts( (prev) =>
          
      prev.map((post) =>
        post.id === selectedPostId
          ? { ...post, category:n_c  }
          : post
      )
    );
          }
          else if(category == "removePersonal"){
    setPosts( (prev) =>
          
      prev.map((post) =>
        post.id === selectedPostId
          ? { ...post, category:""  }
          : post
      )
    );
          }
          else if(category == "campaign"){
                setPosts( (prev) =>
          
      prev.map((post) =>
        post.id === selectedPostId
          ? { ...post, campaignName:newCampaignName, campaign : campaignId  }
          : post
      )
    );
          }
          else if(category == "removeCampaign"){
                setPosts( (prev) =>
          
      prev.map((post) =>
        post.id === selectedPostId
          ? { ...post,  campaignName: null }
          : post
      )
    );
          }
    

  }




  };

 const handleAddLink = (url: string, title: string) => {
};



const getCampaignData = async (payload) => {
  
  try {
    const res = await getCampaign(payload);
console.log(res)
    if (res?.success === false) {
      toast({
              title: 'Campaign.',
              description: `Campaign fetch was not successful`,
              variant: 'destructive',
            });
      return;
    }

    
    setCampaignData(res)
  } catch (error) {
    toast.error("Network error. Please try again.");
  }
};


const handleKeywordSearch = async (payload: SocialSearchPayload) => {
  try {
    const res = await createSocialCampaign(user.id, payload);

    if (res?.success === false) {
      toast({
              title: 'Campaign.',
              description: `Campaign creation was not successful`,
              variant: 'destructive',
            });
      return;
    }

    toast({
              title: 'Campaign.',
              description: `Campaign creation  was successful`,
              variant: 'constructive',
            });;
    return res;
  } catch (error) {
    toast.error("Network error. Please try again.");
  }
};

  // Generate trend data for a campaign
  const generateTrendData = (campaignId: string) => {
    const campaignPostsList = posts
      .filter((p) => p.campaignName === campaignId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return campaignPostsList.map((post) => ({
      date: post.date.split(",")[0],
      sentiment: post.sentiment_distribution,
      agreement: post.agreement_distribution,
      replies: post.replies,
    }));
  };

const handleDailyRequestSubmit = async (url: string) => {
  if (!user?.id) return;

  await submitDailyRequest(user.id, url);
  setIsDailyRequestOpen(false);
};
  const renderContent = () => {
    // Overview
    if (currentView === "overview") {
      return (
        <>
          {/* Category Cards */}
          <div className="mb-10">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                Your library
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                Analysis collections
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
            <CategoryCard
              title="General Posts"
              icon={Globe}
              count={generalPosts.length}
              avgSentiment={calculateAvg(generalPosts, "sentiment")}
              avgAgreement={calculateAvg(generalPosts, "agreement")}
              onClick={() => setCurrentView("general")}
            />
            <CategoryCard
              title="Personal Posts"
              icon={User}
              count={personalPosts.length}
              avgSentiment={calculateAvg(personalPosts, "sentiment")}
              avgAgreement={calculateAvg(personalPosts, "agreement")}
              onClick={() => setCurrentView("personal")}
            />
            <CategoryCard
              title="Campaigns"
              icon={Briefcase}
              count={userCampaigns.length}
              avgSentiment={calculateAvg(campaignPosts, "sentiment")}
              avgAgreement={calculateAvg(campaignPosts, "agreement")}
              onClick={() => setCurrentView("campaigns-list")}
            />
            </div>
          </div>

          {/* Quick Campaigns Preview */}
          <div className="mb-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                  Campaigns
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Active campaigns
                </h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("campaigns-list")}
                className="text-muted-foreground"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {campaigns.length === 0 ? (
                <div className="md:col-span-3 bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                  <p className="text-sm font-medium text-foreground">No active campaigns</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Campaigns will appear here after you group analyzed posts.
                  </p>
                </div>
              ) : campaigns.slice(0, 3).map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedCampaignId(campaign.id);
            setCurrentView("campaign-detail");
           
            getCampaignData(campaign.id)
                    
                  }}
                  className="bg-card rounded-2xl p-5 border border-border cursor-pointer group hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {campaign.postsCount} posts
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-4 line-clamp-2">{sanitizeName(campaign.name)}</h3>
                  <div className="flex items-center gap-6 pt-4 border-t border-border text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Sentiment</div>
                      <div className={`font-semibold tabular-nums ${campaign.avgSentiment > 70 ? "text-green-600" : "text-amber-600"}`}>
                        {campaign.avgSentiment}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Agreement</div>
                      <div className={`font-semibold tabular-nums ${campaign.avgAgreement > 60 ? "text-green-600" : "text-amber-600"}`}>
                        {campaign.avgAgreement}%
                      </div>
                    </div>
                  </div>
                 
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Latest activity
            </p>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent analyses
            </h2>
            <PostsTable
              posts={posts.slice(0, 5)}
              onViewPost={handleViewPost}
              onAssignPost={handleAssignPost}
              showAssignButton={true}
              onPostDeleted={(postId) =>
                setPosts(prev => prev.filter(p => p.id !== postId))
              }
            />
          </div>
        </>
      );
    }

    // Campaigns List View
    if (currentView === "campaigns-list") {
      return (
        <CampaignsList
          campaigns={campaigns}
          onSelectCampaign={(campaignId) => {
            setSelectedCampaignId(campaignId);
            setCurrentView("campaign-detail");
           
            getCampaignData(campaignId)
          }}
          onBack={() => setCurrentView("overview")}
        />
      );
    }

    // Individual Campaign Detail View
    if (currentView === "campaign-detail" && selectedCampaignId) {
      const campaign = campaigns.find((c) => c.id === selectedCampaignId);
      const campaignPostsList = posts.filter((p) => p.campaign == selectedCampaignId);
      const trendData = generateTrendData(selectedCampaignId);

      if (!campaign) return null;

      return (
        <>
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentView("campaigns-list");
              setSelectedCampaignId(null);
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>

          {/* Campaign Header 
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-2">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${campaign.color} flex items-center justify-center`}>
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {campaign.name}
                </h2>
                <p className="text-gray-600">{campaign.description}</p>
              </div>
            </div>
          </div>

          {/* Stats 
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Posts</p>
              <p className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {campaign.postsCount}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Replies</p>
              <p className="text-3xl text-gray-900">{campaign.totalReplies}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Avg Sentiment</p>
              <p
                className={`text-3xl ${
                  campaign.avgSentiment > 70
                    ? "text-green-600"
                    : campaign.avgSentiment > 40
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {campaign.avgSentiment}%
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Avg Agreement</p>
              <p
                className={`text-3xl ${
                  campaign.avgAgreement > 60
                    ? "text-green-600"
                    : campaign.avgAgreement > 40
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {campaign.avgAgreement}%
              </p>
            </div>
          </div>

          {/* Trend Chart 
          {trendData.length > 0 && (
            <div className="mb-8">
              <TrendChart data={trendData} title={`${campaign.name} - Performance Trend`} />
            </div>
          )}**/}
  {campaignData &&(       
<CampaignView campaign={campaignData}/>)}
          {/* Posts Table */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Campaign Posts
            </h2>
            {campaignPostsList.length == 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">No posts in this campaign yet.</p>
              </div>
            ) : (
              <PostsTable
                posts={campaignPostsList}
                onViewPost={handleViewPost}
              />
            )}
          </div>
        </>
      );
    }

    // General/Personal views
    const getFilteredPosts = () => {
      if (currentView === "general") return generalPosts;
      if (currentView === "personal") return personalPosts;
      return [];
    };

    const filteredPosts = getFilteredPosts();
    const avgSentiment = calculateAvg(filteredPosts, "sentiment");
    const avgAgreement = calculateAvg(filteredPosts, "agreement");

    return (
      <>
        <Button
          variant="ghost"
          onClick={() => setCurrentView("overview")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>

        <div className="grid grid-cols-2 md:grid-cols-4 bg-card border border-border rounded-2xl divide-x divide-y md:divide-y-0 divide-border overflow-hidden mb-8">
          <div className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total posts</p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {filteredPosts.length}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total replies</p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {filteredPosts.reduce((sum, p) => sum + p.replies, 0)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Avg. sentiment</p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                avgSentiment > 70
                  ? "text-green-600"
                  : avgSentiment > 40
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {avgSentiment}%
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Avg. agreement</p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                avgAgreement > 60
                  ? "text-green-600"
                  : avgAgreement > 40
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {avgAgreement}%
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Posts
          </h2>
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Globe className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No posts in this category yet.</p>
            </div>
          ) : (
            <PostsTable
              posts={filteredPosts}
              onViewPost={handleViewPost}
              onAssignPost={currentView === "general" ? handleAssignPost : undefined}
              showAssignButton={currentView === "general"}
            />
          )}
        </div>
      </>
    );
  };

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {currentView === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
         <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Workspace overview
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
             <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl">
                Monitor public response, organize analyses, and move from signal to action.
              </p>
            </div>
{/**<Button
  onClick={() => setIsDailyRequestOpen(true)}
  className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700"
>
  Request Daily Analysis
</Button>**/}
            <Button
              onClick={() => setIsAddLinkOpen(true)}
              size="lg"
              className="shadow-md"
            >
              <LinkIcon className="w-4 h-4" />
              New analysis
            </Button>
          </div>
        </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
{/**
      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAdd={handleAddLink}
      />**/}
      <SearchDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onSearch={handleKeywordSearch}
      />

      <AssignPostDialog
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedPostId(null);
        }}
        onAssign={handleAssign}
        postTitle={selectedPost?.title || ""}
        campaigns={userCampaigns}
        category = {selectedPost?.category || ""}
        campaign = {selectedPost?.campaign || ""}
        assignedCampaignName= {selectedPost?.campaignName || ""}
      />
      <DailyAnalysisDialog
  isOpen={isDailyRequestOpen}
  onClose={() => setIsDailyRequestOpen(false)}
  onSubmit={handleDailyRequestSubmit}
/>
    </div>
  );
}
