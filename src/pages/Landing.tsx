import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveDemo } from "@/components/LiveDemo";
import { AuthButtons } from "@/components/AuthButtons";
import { HowItWorks } from "@/components/HowItWorks";
import { GuideDialog } from "@/components/GuideDialog";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  MessageSquare,
  Target,
  Brain,
  Sparkles,
  ChevronRight,
  Play,
  Award,
  Globe,
  Lock,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Minus,
  PieChart,
  Hash,
  Lightbulb,
  MousePointerClick,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [activeDemo, setActiveDemo] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({ posts: 0, sentiment: 0, topics: 0 });
  const [guideOpen, setGuideOpen] = useState(false)
  // Animate stats on load
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        posts: Math.floor(10000000 * easeOut),
        sentiment: Math.floor(95 * easeOut),
        topics: Math.floor(500 * easeOut),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate demo
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Sentiment Analysis",
      description: "Detect positive, negative, and neutral sentiments in social posts and replies with 95% accuracy",
      color: "from-violet-500 to-purple-600",
      stat: "95%",
      statLabel: "Accuracy",
    },
    {
      icon: ThumbsUp,
      title: "Agreement Detection",
      description: "Understand who agrees, disagrees, or remains neutral to your content and why",
      color: "from-emerald-500 to-teal-600",
      stat: "3x",
      statLabel: "More Insights",
    },
    {
      icon: Hash,
      title: "Topic Clustering",
      description: "Automatically identify trending topics, themes, and conversation clusters",
      color: "from-blue-500 to-cyan-600",
      stat: "500+",
      statLabel: "Topics/Day",
    },
    {
      icon: Heart,
      title: "Emotion Detection",
      description: "Identify emotions like joy, anger, sadness, and surprise in user responses",
      color: "from-rose-500 to-pink-600",
      stat: "8",
      statLabel: "Emotions",
    },
    {
      icon: Lightbulb,
      title: "Intent Analysis",
      description: "Understand user intent - questions, complaints, praise, or suggestions",
      color: "from-amber-500 to-orange-600",
      stat: "12",
      statLabel: "Intent Types",
    },
    {
      icon: Sparkles,
      title: "Novelty Scoring",
      description: "Discover unique insights and fresh perspectives in your audience feedback",
      color: "from-indigo-500 to-blue-600",
      stat: "New",
      statLabel: "Insights",
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description: "Beautiful charts and graphs that make complex data instantly understandable",
      color: "from-cyan-500 to-blue-600",
      stat: "20+",
      statLabel: "Chart Types",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Analyze thousands of posts and replies in seconds, not hours",
      color: "from-yellow-500 to-amber-600",
      stat: "<1s",
      statLabel: "Processing",
    },
  ];

  const stats = [
    { value: animatedStats.posts.toLocaleString() + "+", label: "Posts Analyzed", icon: BarChart3 },
    { value: "50K+", label: "Active Users", icon: Users },
    { value: animatedStats.sentiment + "%", label: "Accuracy Rate", icon: Target },
    { value: "24/7", label: "Real-time Analysis", icon: Clock },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "The sentiment analysis completely changed how we respond to our audience. We now catch negative trends before they escalate.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Content Strategist",
      company: "Growth Labs",
      content: "Topic clustering helped us identify content gaps we never knew existed. Our engagement increased by 300%.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Social Media Manager",
      company: "Brand Studio",
      content: "The agreement detection feature is brilliant. Understanding who agrees or disagrees with our posts transformed our strategy.",
      rating: 5,
      avatar: "ER",
    },
  ];

  const demoData = [
    {
      title: "Sentiment Breakdown",
      positive: 67,
      negative: 18,
      neutral: 15,
    },
    {
      title: "Agreement Analysis",
      agree: 72,
      disagree: 15,
      neutral: 13,
    },
    {
      title: "Top Topics",
      topics: ["Product Quality", "Customer Service", "Pricing", "Features", "UX Design"],
    },
  ];

  const pricingPlans = [
    {
      name: "Early Access",
      price: "----",
      credits: "----",
      pricePerCredit: "----",
      features: [
        "--------------",
        "--------------",
        "--------------",
        "--------------",
        "--------------",
      ],
      popular: false,
    },
     {
    name: "Early Access",
    price: "TBA",
    credits: "100",
    pricePerCredit: "TBA",
    features: [
      "Full AI analysis",
      "Sentiment & emotion detection",
      "Topic clustering",
      "Agreement & disagreement detection",
      "Unlimited posts during beta",
      "Email support",
      "Early tester priority",
    ],
    popular: true,
    beta: true,
  },
    {
      name: "Early Access",
      price: "----",
      credits: "----",
      pricePerCredit: "----",
      features: [
        "--------------",
        "--------------",
        "--------------",
        "--------------",
        "--------------",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl  flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <img src="/images/SocialInsightLogo.png" alt="Logo" /> </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">SocialInsight</span>
              <span className="block text-[10px] text-muted-foreground -mt-1">Analytics Platform</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors relative group">
              Demo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <AuthButtons/>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
                <Sparkles className="w-4 h-4" />
                AI-Powered Social Post Analysis
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Understand What Your
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"> Audience Really Thinks</span>
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Analyze social media posts and replies to uncover <span className="text-foreground font-medium">sentiments</span>, <span className="text-foreground font-medium">agreements</span>, <span className="text-foreground font-medium">emotions</span>, and <span className="text-foreground font-medium">trending topics</span> with powerful AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Link to="/auth">
                  <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all group"
                    
                  >
                    Start Analyzing Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 group"
onClick={()=>{ setGuideOpen(true)}}
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  How it works
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  50 free credits
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Instant results
                </div>
              </div>
            </div>

            {/* Right - Interactive Demo */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient bg-[length:200%_auto]" />
                <CardContent className="p-6 space-y-6">
                  {/* Sample Post */}
                  <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                        P
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Sample Post</p>
                        <p className="text-xs text-muted-foreground mb-2">Just now</p>
                        <p className="text-sm text-foreground">
                          "Just launched our new feature! 🚀 What do you all think?"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Animated Analysis Results */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Analysis Results</span>
                      <Badge variant="secondary" className="bg-success/10 text-success animate-pulse">
                        Live
                      </Badge>
                    </div>

                    {/* Sentiment Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Sentiment Distribution</span>
                        <span className="text-foreground font-medium">847 replies</span>
                      </div>
                      <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                        <div 
                          className="bg-success transition-all duration-1000 ease-out flex items-center justify-center"
                          style={{ width: `${demoData[0].positive}%` }}
                        >
                          <span className="text-[10px] text-success-foreground font-medium">
                            {demoData[0].positive}%
                          </span>
                        </div>
                        <div 
                          className="bg-destructive transition-all duration-1000 ease-out flex items-center justify-center"
                          style={{ width: `${demoData[0].negative}%` }}
                        >
                          <span className="text-[10px] text-destructive-foreground font-medium">
                            {demoData[0].negative}%
                          </span>
                        </div>
                        <div 
                          className="bg-neutral transition-all duration-1000 ease-out flex items-center justify-center"
                          style={{ width: `${demoData[0].neutral}%` }}
                        >
                          <span className="text-[10px] text-neutral-foreground font-medium">
                            {demoData[0].neutral}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-success" /> Positive</span>
                        <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3 text-destructive" /> Negative</span>
                        <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-neutral" /> Neutral</span>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Trending Topics</span>
                      <div className="flex flex-wrap gap-2">
                        {["New Feature", "UX Design", "Performance", "Pricing"].map((topic, i) => (
                          <Badge 
                            key={topic} 
                            variant="outline" 
                            className="text-xs animate-fade-in"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <Hash className="w-3 h-3 mr-1" />
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-success/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-success">72%</p>
                        <p className="text-xs text-muted-foreground">Agree</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-destructive">15%</p>
                        <p className="text-xs text-muted-foreground">Disagree</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary">4.2</p>
                        <p className="text-xs text-muted-foreground">Novelty</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-bounce-slow">
                +847 replies analyzed
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-border px-3 py-2 rounded-lg shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Real-time processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center space-y-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Analyze Section */}
      <section id="demo" className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="px-4 py-2 bg-accent/10 text-accent border-accent/20">
              <MousePointerClick className="w-4 h-4 mr-2" />
              Powerful Analysis
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              What Can You Discover?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI dives deep into every post and reply to extract meaningful insights you can act on
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sentiment Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-success via-neutral to-destructive" />
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Sentiment Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Instantly know if responses are positive, negative, or neutral. Track sentiment trends over time.
                </p>
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      Positive
                    </span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      Negative
                    </span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neutral" />
                      Neutral
                    </span>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Agreement Detection</h3>
                <p className="text-muted-foreground text-sm">
                  See who agrees with your content and who pushes back. Understand the "why" behind reactions.
                </p>
                <div className="pt-4">
                  <div className="flex gap-2">
                    <div className="flex-1 bg-success/10 rounded-lg p-3 text-center">
                      <ThumbsUp className="w-5 h-5 text-success mx-auto mb-1" />
                      <p className="text-lg font-bold text-success">72%</p>
                      <p className="text-xs text-muted-foreground">Agree</p>
                    </div>
                    <div className="flex-1 bg-destructive/10 rounded-lg p-3 text-center">
                      <ThumbsDown className="w-5 h-5 text-destructive mx-auto mb-1" />
                      <p className="text-lg font-bold text-destructive">15%</p>
                      <p className="text-xs text-muted-foreground">Disagree</p>
                    </div>
                    <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                      <Minus className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-lg font-bold text-foreground">13%</p>
                      <p className="text-xs text-muted-foreground">Neutral</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topics Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Topic Clustering</h3>
                <p className="text-muted-foreground text-sm">
                  Automatically group conversations by theme. Discover what topics resonate most with your audience.
                </p>
                <div className="pt-4 flex flex-wrap gap-2">
                  {["Product", "UX", "Price", "Support", "Speed"].map((topic, i) => (
                    <Badge 
                      key={topic}
                      variant="outline"
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      #{topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4 mr-2" />
              Full Feature Suite
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Everything You Need to Understand Your Audience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools that transform raw social data into actionable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-5 space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">{feature.stat}</p>
                      <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <ChevronRight className={`w-5 h-5 text-primary transition-transform ${hoveredFeature === index ? 'translate-x-1' : ''}`} />
                </CardContent>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <LiveDemo/>
      <HowItWorks/>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="px-4 py-2 bg-success/10 text-success border-success/20">
              <Award className="w-4 h-4 mr-2" />
              Trusted by Thousands
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of marketers and content creators who trust SocialInsight
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed">"{testimonial.content}"</p>
                  <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Credit-Based Pricing
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Pay For What You Use
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Buy credits and use them whenever you need. No monthly commitments, no wasted spend.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 ${plan.popular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'border-border/50 hover:border-primary/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                )}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 bg-primary text-primary-foreground shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.credits}</span>
                      <span className="text-muted-foreground">credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold text-primary">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">({plan.pricePerCredit}/credit)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/payments" className="block">
                    <Button 
                      className={`w-full ${plan.popular ? 'shadow-lg shadow-primary/25' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.popular ? 'Get Started' : 'Buy Credits'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8">
            Need more? <Link to="/payments" className="text-primary hover:underline">Buy custom credit amounts</Link> at competitive rates.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-6 py-12 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-12 text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Globe className="w-5 h-5" />
              <span className="font-medium">Global Coverage</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Lock className="w-5 h-5" />
              <span className="font-medium">SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Shield className="w-5 h-5" />
              <span className="font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Award className="w-5 h-5" />
              <span className="font-medium">Award Winning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <CardContent className="relative p-12 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
                  Ready to Understand Your Audience?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Start analyzing social posts today with 50 free credits. No credit card required.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="gap-2 text-lg px-10 py-6 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all group">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-10 py-6">
                  <MessageSquare className="w-5 h-5" />
                  Contact Sales
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  50 free credits
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                 <img src="/images/SocialInsightLogo.png" alt="Logo" />
              </div>
              <span className="text-lg font-bold text-foreground">SocialInsight</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SocialInsight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <GuideDialog
    open={guideOpen}
    setOpen ={() => setGuideOpen(false)}
      />
    
    </div>
  );
}
