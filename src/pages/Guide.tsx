import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Download, 
  FolderOpen, 
  Chrome, 
  Upload, 
  CheckCircle2, 
  MousePointer2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  ArrowRight,
  Monitor,
  Smartphone,
  AlertCircle,
  Sparkles,
  Eye,
  ScrollText,
  Zap,
  Hand,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { AuthButtons } from "@/components/AuthButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ number, title, description, icon }: StepProps) => (
  <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 group">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold shadow-lg group-hover:scale-110 transition-transform">
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary">{icon}</span>
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
}

const VideoPlayer = ({ src, title, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setHasError(true));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog);
      setCurrentTime(formatTime(videoRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  // Show placeholder if video fails to load
  if (hasError) {
    return (
      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-muted-foreground ml-1" />
          </div>
          <p className="text-white/80 font-medium">{title}</p>
          <p className="mt-2 text-white/40 text-sm">Video coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-border/50 overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnd}
        onError={handleError}
        onClick={togglePlay}
        playsInline
      />
      
      {/* Play overlay when paused */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-primary/30">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
          <p className="mt-4 text-white/90 font-medium">{title}</p>
          <span className="mt-1 text-white/50 text-sm">{duration}</span>
        </div>
      )}

      {/* Video title badge */}
      <div className={`absolute top-4 left-4 transition-opacity duration-300 ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'}`}>
        <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm">
          {title}
        </Badge>
      </div>

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-8 transition-all duration-300 ${
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {/* Progress bar */}
        <div 
          className="h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
            <button
              onClick={handleReplay}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            <span className="text-white/70 text-sm font-medium ml-2">
              {currentTime} / {duration}
            </span>
          </div>
          <button
            onClick={handleFullscreen}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
          >
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface PlatformCardProps {
  platform: string;
  icon: string;
  methods: string[];
  color: string;
  description: string;
}

const PlatformCard = ({ platform, icon, methods, color, description }: PlatformCardProps) => (
  <Card className={`relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1`}>
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`}></div>
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{platform}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex gap-2 flex-wrap">
            {methods.map((method) => (
              <Badge 
                key={method} 
                variant={method === "Auto" ? "default" : "secondary"}
                className="text-xs"
              >
                {method === "Auto" ? <Zap className="w-3 h-3 mr-1" /> : <Hand className="w-3 h-3 mr-1" />}
                {method}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Guide = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>("installation");
const { user} = useAuth();
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-background">
     
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
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a href={!user?"/login":"/analytics"} className="text-muted-foreground hover:text-foreground transition-colors relative group">
              {!user?"Sign In":"Analyze"}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            
          </nav>
          <div className="flex items-center gap-3">
            <AuthButtons/>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 animate-fade-in" variant="secondary">
              <ScrollText className="w-3 h-3 mr-1" />
              Complete Tutorial
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Master{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
                SocialInsight
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Learn how to capture and analyze social media posts like a pro. 
              Follow our step-by-step guides with video tutorials.
            </p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-500 mb-2">Important: Where to View Your Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The <strong className="text-foreground">primary and recommended way</strong> to view your analysis results is through our{" "}
                    <Link to="/dashboard" className="text-primary hover:underline font-medium">
                      web dashboard <ExternalLink className="w-3 h-3 inline" />
                    </Link>. 
                    While you can wait for results in the extension, we don't recommend this as it requires keeping the extension open. 
                    All your analyses are <strong className="text-foreground">automatically saved</strong> and accessible anytime from your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Supported Platforms</h2>
            <p className="text-muted-foreground">Each platform has different capture methods available</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <PlatformCard 
              platform="X (Twitter)"
              icon="𝕏"
              methods={["Auto", "Manual"]}
              color="from-slate-600 to-slate-400"
              description="Full support with both automatic and manual capture modes"
            />
            <PlatformCard 
              platform="Facebook"
              icon="📘"
              methods={["Manual"]}
              color="from-blue-600 to-blue-400"
              description="Manual capture with scroll-to-capture functionality"
            />
            <PlatformCard 
              platform="TikTok"
              icon="🎵"
              methods={["Manual"]}
              color="from-pink-600 to-purple-400"
              description="One-click manual capture - no scrolling required!"
            />
          </div>
        </div>
      </section>

      {/* Tutorial Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Installation Guide */}
          <div className="mb-8">
            <button 
              onClick={() => toggleSection("installation")}
              className="w-full flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Download className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold">Installation Guide</h2>
                  <p className="text-muted-foreground">Set up the SocialInsight extension in Chrome</p>
                </div>
              </div>
              {expandedSection === "installation" ? (
                <ChevronUp className="w-6 h-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
            
            {expandedSection === "installation" && (
              <div className="mt-4 p-6 rounded-2xl border bg-card animate-fade-in">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Step 
                      number={1}
                      title="Extract the Downloaded File"
                      description="After downloading, extract the ZIP file to reveal the SocialInsight extension folder"
                      icon={<FolderOpen className="w-4 h-4" />}
                    />
                    <Step 
                      number={2}
                      title="Locate the Extension Folder"
                      description="Inside the extracted folder, find the SocialInsight folder - this is what we need"
                      icon={<FolderOpen className="w-4 h-4" />}
                    />
                    <Step 
                      number={3}
                      title="Open Chrome Extensions"
                      description="Navigate to chrome://extensions in your browser's address bar"
                      icon={<Chrome className="w-4 h-4" />}
                    />
                    <Step 
                      number={4}
                      title="Enable Developer Mode"
                      description="Toggle on 'Developer mode' in the top right corner"
                      icon={<Monitor className="w-4 h-4" />}
                    />
                    <Step 
                      number={5}
                      title="Load Unpacked Extension"
                      description="Click 'Load unpacked' button to install the extension"
                      icon={<Upload className="w-4 h-4" />}
                    />
                    <Step 
                      number={6}
                      title="Select the Folder"
                      description="Navigate to and click the SocialInsight folder, then click 'Select Folder'"
                      icon={<MousePointer2 className="w-4 h-4" />}
                    />
                    <Step 
                      number={7}
                      title="You're All Set!"
                      description="Click the extension icon in Chrome toolbar to open SocialInsight and sign in"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <VideoPlayer src="/new-installation.mp4" title="Installation Tutorial" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* X/Twitter Tutorials */}
          <div className="mb-8">
            <button 
              onClick={() => toggleSection("twitter")}
              className="w-full flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-slate-500/10 to-slate-500/5 border border-slate-500/20 hover:border-slate-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-2xl">
                  𝕏
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold">X (Twitter) Capture</h2>
                  <p className="text-muted-foreground">Both Auto and Manual capture available</p>
                </div>
              </div>
              {expandedSection === "twitter" ? (
                <ChevronUp className="w-6 h-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
            
            {expandedSection === "twitter" && (
              <div className="mt-4 animate-fade-in">
                <Tabs defaultValue="auto" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="auto" className="gap-2">
                      <Zap className="w-4 h-4" /> Auto Capture
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="gap-2">
                      <Hand className="w-4 h-4" /> Manual Capture
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="auto" className="p-6 rounded-2xl border bg-card">
                    <div className="flex items-center gap-2 mb-6">
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        <Zap className="w-3 h-3 mr-1" /> Recommended
                      </Badge>
                      <span className="text-sm text-muted-foreground">Fastest way to capture</span>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Step 
                          number={1}
                          title="Open a Twitter Post"
                          description="Navigate to the tweet you want to analyze"
                          icon={<ExternalLink className="w-4 h-4" />}
                        />
                        <Step 
                          number={2}
                          title="Open SocialInsight Extension"
                          description="Click the extension icon in your Chrome toolbar"
                          icon={<MousePointer2 className="w-4 h-4" />}
                        />
                        <Step 
                          number={3}
                          title="Click Auto Analysis"
                          description="A new window will open - don't close or minimize it!"
                          icon={<Zap className="w-4 h-4" />}
                        />
                        <Step 
                          number={4}
                          title="Continue Working"
                          description="Just click somewhere on your normal browser window to continue. The analysis runs automatically in the background"
                          icon={<Monitor className="w-4 h-4" />}
                        />
                        <Step 
                          number={5}
                          title="View Results"
                          description="Results will be available in your dashboard when complete"
                          icon={<Eye className="w-4 h-4" />}
                        />
                      </div>
                      <div>
                        <VideoPlayer src="/auto-video-x.mp4" title="X Auto Capture Tutorial" />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="p-6 rounded-2xl border bg-card">
                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant="secondary">
                        <Hand className="w-3 h-3 mr-1" /> Manual Mode
                      </Badge>
                      <span className="text-sm text-muted-foreground">More control over what you capture</span>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Step 
                          number={1}
                          title="Open a Twitter Post"
                          description="Navigate to the tweet you want to analyze"
                          icon={<ExternalLink className="w-4 h-4" />}
                        />
                        <Step 
                          number={2}
                          title="Open SocialInsight Extension"
                          description="Click the extension icon in your Chrome toolbar"
                          icon={<MousePointer2 className="w-4 h-4" />}
                        />
                        <Step 
                          number={3}
                          title="Click Manual Analysis"
                          description="This activates the capture mode"
                          icon={<Hand className="w-4 h-4" />}
                        />
                        <Step 
                          number={4}
                          title="Scroll Through Replies"
                          description="Go back to the post and scroll through the replies you want to capture"
                          icon={<ScrollText className="w-4 h-4" />}
                        />
                        <Step 
                          number={5}
                          title="Stop and Analyze"
                          description="Open the extension again and click 'Stop and Analyze' to process the captured content"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        />
                      </div>
                      <div>
                        <VideoPlayer src="/manual-video-x.mp4" title="X Manual Capture Tutorial" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Facebook Tutorial */}
          <div className="mb-8">
            <button 
              onClick={() => toggleSection("facebook")}
              className="w-full flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-2xl">
                  📘
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold">Facebook Capture</h2>
                  <p className="text-muted-foreground">Manual capture with scroll-to-capture</p>
                </div>
              </div>
              {expandedSection === "facebook" ? (
                <ChevronUp className="w-6 h-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
            
            {expandedSection === "facebook" && (
              <div className="mt-4 p-6 rounded-2xl border bg-card animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <Badge variant="secondary">
                    <Hand className="w-3 h-3 mr-1" /> Manual Only
                  </Badge>
                  <span className="text-sm text-muted-foreground">Scroll to capture comments</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Step 
                      number={1}
                      title="Open Facebook"
                      description="Navigate to Facebook and find the post you want to analyze"
                      icon={<ExternalLink className="w-4 h-4" />}
                    />
                    <Step 
                      number={2}
                      title="Open Comment Section"
                      description="Click on comments to expand the comment section"
                      icon={<MousePointer2 className="w-4 h-4" />}
                    />
                    <Step 
                      number={3}
                      title="Open SocialInsight Extension"
                      description="Click the extension icon in your Chrome toolbar"
                      icon={<Smartphone className="w-4 h-4" />}
                    />
                    <Step 
                      number={4}
                      title="Click Manual Analysis"
                      description="This activates the capture mode"
                      icon={<Hand className="w-4 h-4" />}
                    />
                    <Step 
                      number={5}
                      title="Scroll Through Comments"
                      description="Click on the comment section and scroll to capture the replies you want"
                      icon={<ScrollText className="w-4 h-4" />}
                    />
                    <Step 
                      number={6}
                      title="Stop and Analyze"
                      description="Open the extension again and click 'Stop and Analyze' to process"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <VideoPlayer src="/facebook-video.mp4" title="Facebook Capture Tutorial" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TikTok Tutorial */}
          <div className="mb-8">
            <button 
              onClick={() => toggleSection("tiktok")}
              className="w-full flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/5 border border-pink-500/20 hover:border-pink-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-purple-500 flex items-center justify-center text-2xl">
                  🎵
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold">TikTok Capture</h2>
                  <p className="text-muted-foreground">One-click capture - no scrolling needed!</p>
                </div>
              </div>
              {expandedSection === "tiktok" ? (
                <ChevronUp className="w-6 h-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
            
            {expandedSection === "tiktok" && (
              <div className="mt-4 p-6 rounded-2xl border bg-card animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30">
                    <Sparkles className="w-3 h-3 mr-1" /> Easiest!
                  </Badge>
                  <span className="text-sm text-muted-foreground">Just one click, no scrolling required</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Step 
                      number={1}
                      title="Open a TikTok Post"
                      description="Navigate to the TikTok video you want to analyze"
                      icon={<ExternalLink className="w-4 h-4" />}
                    />
                    <Step 
                      number={2}
                      title="Open SocialInsight Extension"
                      description="Click the extension icon in your Chrome toolbar"
                      icon={<MousePointer2 className="w-4 h-4" />}
                    />
                    <Step 
                      number={3}
                      title="Click Manual Analysis"
                      description="That's it! The analysis will start automatically - no scrolling needed"
                      icon={<Hand className="w-4 h-4" />}
                    />
                    <Step 
                      number={4}
                      title="View Results"
                      description="Results will be available in your dashboard when complete"
                      icon={<Eye className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <VideoPlayer src="/new-tiktok.mp4" title="TikTok Capture Tutorial" />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Tips & Important Notes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Your Work is Always Saved</h4>
                    <p className="text-sm text-muted-foreground">
                      All analyses are securely saved and always available in your Dashboard → Recent. 
                      You don't need to keep the extension open.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Background Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      Analysis continues quietly in the background. Results appear instantly if the extension is open, 
                      otherwise they're saved for later.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content Limitations</h4>
                    <p className="text-sm text-muted-foreground">
                      We capture recent posts and top-level replies. Some replies may be missing, 
                      nested replies aren't included, and content may change if users edit or delete it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Best Viewing Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      View results in the extension if it's open, or access them anytime on our website. 
                      Your work is never tied to keeping the extension open.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Now that you know how to use SocialInsight, start analyzing your social media content!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="gap-2">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 SocialInsight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Guide;
