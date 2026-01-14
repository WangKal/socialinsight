import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { CampaignsList, Campaign } from "@/components/CampaignsList";
import { PostsTable, Post } from "@/components/PostsTable";
import { AssignPostDialog } from "@/components/AssignPostDialog";
import { AddLinkDialog } from "@/components/analytics/AddLinkDialog";
import { TrendChart } from "@/components/TrendChart";
import { Globe, User, Briefcase, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPostsByUser, assignPost, getCampaignsByUser } from "@/services/socialEcho"
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
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const { toast } =useToast();


useEffect(() => {
  if (!user?.id) return;    // Don't run until user is loaded

  async function load() {
    console.log("Loaded user:", user);
    const result = await getPostsByUser(user.id);
    console.log(result)
    setPosts(result);
  }

  load();
}, [user]);

useEffect(() => {
  if (!user?.id) return;    // Don't run until user is loaded

  async function load() {
    console.log("Loaded user:", user);
    const result = await getCampaignsByUser(user.id);
   
    setUserCampaigns(result);
  }

  load();
}, [user]);

  // Calculate stats
  const generalPosts = posts.filter((p) => p.category == null || p.category.length==0);
  const personalPosts = posts.filter((p) => p.category === "personal");
  const campaignPosts = posts.filter((p) => p.campaign != null);
 console.log(campaignPosts)

 console.log(userCampaigns)
  const campaigns: Campaign[] = (userCampaigns || []).map((campaign) => {
    const campaignPostsList = campaignPosts.filter((p) => p.campaign == campaign.id);
   console.log(campaignPostsList)
    return {
      ...campaign,
      postsCount: campaignPostsList.length,
      totalReplies: campaignPostsList.reduce((sum, p) => sum + p.replies, 0),
      avgSentiment: campaignPostsList.length > 0
        ? Math.round(campaignPostsList.reduce((sum, p) => sum + p.sentiment, 0) / campaignPostsList.length)
        : 0,
      avgAgreement: campaignPostsList.length > 0
        ? Math.round(campaignPostsList.reduce((sum, p) => sum + p.agreement, 0) / campaignPostsList.length)
        : 0,
    };
  });

  const calculateAvg = (postsList: Post[], field: "sentiment" | "agreement") => {
    if (postsList.length === 0) return 0;
    return Math.round(postsList.reduce((sum, p) => sum + p[field], 0) / postsList.length);
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
      
       console.log(n_c);
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
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      url,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      replies: 0,
      sentiment: 0,
      agreement: 0,
      category: "general",
      status: "analyzing",
    };

    setPosts((prev) => [newPost, ...prev]);
    alert("Post added! Analysis starting...");
  };

  // Generate trend data for a campaign
  const generateTrendData = (campaignId: string) => {
    const campaignPostsList = posts
      .filter((p) => p.campaignName === campaignId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return campaignPostsList.map((post) => ({
      date: post.date.split(",")[0],
      sentiment: post.sentiment,
      agreement: post.agreement,
      replies: post.replies,
    }));
  };

  const renderContent = () => {
    // Overview
    if (currentView === "overview") {
      return (
        <>
          {/* Category Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <CategoryCard
              title="General Posts"
              icon={Globe}
              count={generalPosts.length}
              avgSentiment={calculateAvg(generalPosts, "sentiment")}
              avgAgreement={calculateAvg(generalPosts, "agreement")}
              color="from-blue-500 to-cyan-600"
              onClick={() => setCurrentView("general")}
            />
            <CategoryCard
              title="Personal Posts"
              icon={User}
              count={personalPosts.length}
              avgSentiment={calculateAvg(personalPosts, "sentiment")}
              avgAgreement={calculateAvg(personalPosts, "agreement")}
              color="from-green-500 to-emerald-600"
              onClick={() => setCurrentView("personal")}
            />
            <CategoryCard
              title="Campaigns"
              icon={Briefcase}
              count={userCampaigns.length}
              avgSentiment={calculateAvg(campaignPosts, "sentiment")}
              avgAgreement={calculateAvg(campaignPosts, "agreement")}
              color="from-violet-500 to-purple-600"
              onClick={() => setCurrentView("campaigns-list")}
            />
          </div>

          {/* Quick Campaigns Preview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Active Campaigns
              </h3>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("campaigns-list")}
              >
                View All
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedCampaignId(campaign.id);
                    setCurrentView("campaign-detail");
                  }}
                  className="bg-white rounded-xl p-5 shadow-md border border-gray-200 cursor-pointer group hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${campaign.color} flex items-center justify-center`}>
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {campaign.postsCount} posts
                    </div>
                  </div>
                  <h4 className="text-gray-900 mb-3 line-clamp-2">{campaign.name}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Sentiment</div>
                      <div className={campaign.avgSentiment > 70 ? "text-green-600" : "text-amber-600"}>
                        {campaign.avgSentiment}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Agreement</div>
                      <div className={campaign.avgAgreement > 60 ? "text-green-600" : "text-amber-600"}>
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
            <h3 className="text-2xl mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Recent Posts
            </h3>
            <PostsTable
              posts={posts.slice(0, 5)}
              onViewPost={handleViewPost}
              onAssignPost={handleAssignPost}
              showAssignButton={true}
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

          {/* Campaign Header */}
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

          {/* Stats */}
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

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="mb-8">
              <TrendChart data={trendData} title={`${campaign.name} - Performance Trend`} />
            </div>
          )}

          {/* Posts Table */}
          <div>
            <h3 className="text-2xl mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Campaign Posts
            </h3>
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

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Posts</p>
            <p className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {filteredPosts.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Replies</p>
            <p className="text-3xl text-gray-900">
              {filteredPosts.reduce((sum, p) => sum + p.replies, 0)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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
          </div>
        </div>

        <div>
          <h3 className="text-2xl mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Posts
          </h3>
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-gray-600">
                Manage and analyze all your social media posts
              </p>
            </div>

            <Button
              onClick={() => setIsAddLinkOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>

      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAdd={handleAddLink}
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
    </div>
  );
}
