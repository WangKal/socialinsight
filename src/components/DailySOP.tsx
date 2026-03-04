import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import UserCorrespondence from "@/components/UserCorrespondence";
import SocialPostsList from "@/components/SocialPostsList";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  Search,
  MessageSquare,
  Megaphone,
  CreditCard,
  Moon,
  Target,
  Zap,
  Send,
  Coins,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItem {
  id: string;
  label: string;
}

interface SOPSection {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeVariant: string;
  duration?: string;
  items: CheckItem[];
}

const rollingCycleSections: SOPSection[] = [
  {
    id: "detection",
    title: "Detection",
    subtitle: "Scan & Identify",
    icon: <Search className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    badgeVariant: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    duration: "20–30 min",
    items: [
      { id: "d1", label: "Scan TikTok trending posts / hashtags" },
      { id: "d2", label: "Scan X for viral threads / high engagement posts" },
      { id: "d3", label: "Scan Facebook discussion threads" },
      { id: "d4", label: "Identify posts with high buyer signal density (pain, analytical, professional, repeated curiosity)" },
      { id: "d5", label: "Tag posts as Tier 1 (buyer-rich), Tier 2 (visibility), Tier 3 (ignore)" },
    ],
  },
  {
    id: "engagement",
    title: "Engagement",
    subtitle: "Reply & Position",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    badgeVariant: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    duration: "60–70 min",
    items: [
      { id: "e1", label: "Reply to Tier 1 posts using Reply Scripts (Pain, Analytical, Authority)" },
      { id: "e2", label: "Light engagement on Tier 2 posts (curiosity / authority positioning)" },
      { id: "e3", label: "Ignore Tier 3 posts" },
      { id: "e4", label: "Monitor profile visits & responses" },
    ],
  },
  {
    id: "amplification",
    title: "Amplification",
    subtitle: "Tease & Position",
    icon: <Megaphone className="w-5 h-5" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    badgeVariant: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    duration: "10–20 min",
    items: [
      { id: "a1", label: "Post 1 short insight / curiosity statement on active thread" },
      { id: "a2", label: "Tease analysis or insight" },
      { id: "a3", label: 'Add soft positioning: "Pattern / consensus observations"' },
    ],
  },
  {
    id: "conversion",
    title: "Conversion / Credit Activation",
    subtitle: "Convert & Track",
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    badgeVariant: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    duration: "5–10 min",
    items: [
      { id: "c1", label: "Identify users who respond / follow-up / show repeated curiosity" },
      { id: "c2", label: "Send DM using Curiosity Bridge / Credit Activation Scripts" },
      { id: "c3", label: "Offer starter credits as insight access" },
      { id: "c4", label: "Track who activates / requests analysis" },
    ],
  },
];

const eveningCycles: SOPSection[] = [
  {
    id: "eve1",
    title: "Cycle 1: 19:00–20:00",
    subtitle: "Detection + Conversations",
    icon: <Search className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    badgeVariant: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    items: [
      { id: "ev1a", label: "Detect new posts / viral spikes" },
      { id: "ev1b", label: "Respond to outstanding DMs" },
      { id: "ev1c", label: "Identify fresh Tier 1 buyers" },
    ],
  },
  {
    id: "eve2",
    title: "Cycle 2: 20:00–21:00",
    subtitle: "Engagement",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    badgeVariant: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    items: [
      { id: "ev2a", label: "Reply to new Tier 1 posts" },
      { id: "ev2b", label: "Start conversations with new buyers" },
    ],
  },
  {
    id: "eve3",
    title: "Cycle 3: 21:00–22:00",
    subtitle: "Amplification + Conversion",
    icon: <Coins className="w-5 h-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    badgeVariant: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    items: [
      { id: "ev3a", label: "Tease insights / patterns" },
      { id: "ev3b", label: "Credit framing / activation messages" },
    ],
  },
];

const buyerSignals = [
  { signal: "Pain Signals", description: "Confusion / frustration / engagement mismatch", color: "text-red-400", bg: "bg-red-500/10" },
  { signal: "Analytical Signals", description: "Mentions of data, patterns, psychology", color: "text-blue-400", bg: "bg-blue-500/10" },
  { signal: "Professional Signals", description: "Marketer / analyst / strategist / agency", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { signal: "Curiosity Signals", description: "Repeated comments, follow-ups, profile visits", color: "text-amber-400", bg: "bg-amber-500/10" },
  { signal: "Authority Signals", description: "Thought leader / educator / commentator", color: "text-purple-400", bg: "bg-purple-500/10" },
];

const replyScripts = [
  "Pattern / Insight replies",
  "Pain-based replies",
  "Authority / intelligence signaling",
  "Avoid pitching; trigger curiosity",
];

const dmSOP = [
  { type: "Pain Buyer DM", approach: "Curiosity + insight" },
  { type: "Analytical Buyer DM", approach: "Pattern observation + discussion" },
  { type: "Authority Buyer DM", approach: "Authority reinforcement + intrigue" },
];

const creditSOP = [
  "Frame credits as access to deeper insights",
  "Use starter credits to let user explore pattern / consensus",
  "Wait for psychological triggers (curiosity, repeated engagement)",
  "Highlight exclusivity / early adopter advantage",
  "Avoid direct sales pitch",
  "Track conversion metrics: credit activations, purchases",
];

const edgeCases = [
  { case: "Viral spikes outside scheduled cycles", action: "Jump in manually" },
  { case: "High-volume threads", action: "Prioritize Tier 1 buyers first" },
  { case: "Unresponsive leads", action: "Schedule follow-up in next cycle" },
  { case: "Overactive / noisy users", action: "Ignore if not buyer-rich" },
  { case: "Multiple DMs from same user", action: "Consolidate insights into single reply" },
];

const dailyMetrics = [
  { metric: "Buyer Signals Detected", goal: "10+ per 2-hour cycle" },
  { metric: "Tier 1 Posts Engaged", goal: "Track daily" },
  { metric: "Replies Sent", goal: "Count / type" },
  { metric: "DMs Sent", goal: "Count / type" },
  { metric: "Credit Activations", goal: "Track conversions" },
  { metric: "Credit Purchases", goal: "Revenue tracked" },
  { metric: "Profile Visits / Responses", goal: "Track engagement" },
];

const weeklyOptimization = [
  "Review which buyer signals convert best",
  "Review which reply scripts triggered most responses",
  "Adjust DM tone and scripts as needed",
  "Optimize credit framing & activation language",
  "Refine detection filters",
];

function ChecklistSection({ section, checked, onToggle }: {
  section: SOPSection;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const completedCount = section.items.filter((item) => checked[item.id]).length;
  const totalCount = section.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn("rounded-xl border p-5 transition-all", section.borderColor, section.bgColor)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", section.bgColor, section.color)}>
            {section.icon}
          </div>
          <div>
            <h3 className={cn("font-semibold text-lg", section.color)}>{section.title}</h3>
            {section.subtitle && (
              <p className="text-sm text-muted-foreground">{section.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {section.duration && (
            <Badge variant="outline" className={cn("text-xs border", section.badgeVariant)}>
              <Clock className="w-3 h-3 mr-1" />
              {section.duration}
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-xs border", section.badgeVariant)}>
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </div>
      <Progress value={progress} className="h-1.5 mb-4" />
      <div className="space-y-3">
        {section.items.map((item) => (
          <label
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
              "hover:bg-background/40",
              checked[item.id] && "opacity-60"
            )}
          >
            <Checkbox
              checked={checked[item.id] || false}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-0.5"
            />
            <span className={cn(
              "text-sm leading-relaxed",
              checked[item.id] && "line-through text-muted-foreground"
            )}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 space-y-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DailySOP() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allItems = [
    ...rollingCycleSections.flatMap((s) => s.items),
    ...eveningCycles.flatMap((s) => s.items),
  ];
  const totalChecked = allItems.filter((item) => checked[item.id]).length;
  const totalItems = allItems.length;
  const overallProgress = totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;

  const resetAll = () => setChecked({});

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">Daily Playbook</Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                10:00–17:00 / 19:00–22:00
              </Badge>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Daily Promotion & Buyer Conversion SOP
            </h1>
            <p className="text-muted-foreground mt-1">Your daily actionable playbook for detection, engagement, and conversion.</p>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset All
          </button>
        </div>

        {/* Overall Progress */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">Daily Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">{totalChecked} / {totalItems} tasks</span>
            </div>
            <Progress value={overallProgress} className="h-2 mb-4" />

            {/* Stage Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { label: "Detection", sections: [...rollingCycleSections.filter(s => s.id === "detection"), ...eveningCycles.filter(s => s.id === "eve1")], color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Engagement", sections: [...rollingCycleSections.filter(s => s.id === "engagement"), ...eveningCycles.filter(s => s.id === "eve2")], color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Amplification", sections: [...rollingCycleSections.filter(s => s.id === "amplification"), ...eveningCycles.filter(s => s.id === "eve3")], color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Conversion", sections: rollingCycleSections.filter(s => s.id === "conversion"), color: "text-purple-400", bg: "bg-purple-500/10" },
              ].map((stage) => {
                const stageItems = stage.sections.flatMap(s => s.items);
                const done = stageItems.filter(i => checked[i.id]).length;
                const total = stageItems.length;
                return (
                  <div key={stage.label} className={cn("rounded-lg p-2.5 border", stage.bg)}>
                    <p className={cn("text-[11px] font-semibold", stage.color)}>{stage.label}</p>
                    <p className="text-lg font-bold">{done}<span className="text-xs text-muted-foreground font-normal">/{total}</span></p>
                    <Progress value={total > 0 ? (done / total) * 100 : 0} className="h-1 mt-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Correspondence CRM */}
      <CollapsibleSection
        title="🔗 Lead Correspondence & CRM"
        icon={<Users className="w-5 h-5 text-pink-400" />}
      >
        <UserCorrespondence />
      </CollapsibleSection>

      {/* 1. Rolling Cycle */}
      <CollapsibleSection
        title="1️⃣ 2-Hour Rolling Cycle Checklist"
        icon={<RefreshCw className="w-5 h-5 text-primary" />}
        defaultOpen
      >
        {rollingCycleSections.map((section) => (
          <div key={section.id}>
            <ChecklistSection section={section} checked={checked} onToggle={toggleCheck} />
            {section.id === "detection" && <SocialPostsList />}
          </div>
        ))}
      </CollapsibleSection>

      {/* 2. Evening Shift */}
      <CollapsibleSection
        title="2️⃣ Evening Shift (7 PM – 10 PM)"
        icon={<Moon className="w-5 h-5 text-indigo-400" />}
      >
        {eveningCycles.map((section) => (
          <ChecklistSection key={section.id} section={section} checked={checked} onToggle={toggleCheck} />
        ))}
      </CollapsibleSection>

      {/* 3. Buyer Detection */}
      <CollapsibleSection
        title="3️⃣ Buyer Detection SOP"
        icon={<Target className="w-5 h-5 text-red-400" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buyerSignals.map((signal) => (
            <div key={signal.signal} className={cn("rounded-xl border p-4", signal.bg)}>
              <h4 className={cn("font-semibold text-sm mb-1", signal.color)}>{signal.signal}</h4>
              <p className="text-xs text-muted-foreground">{signal.description}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 4. Reply Scripts */}
      <CollapsibleSection
        title="4️⃣ Engagement & Reply Scripts"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Plug & Play Scripts</CardTitle>
            <CardDescription>Use these reply frameworks. Never pitch directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {replyScripts.map((script, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-sm">{script}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </CollapsibleSection>

      {/* 5. DM SOP */}
      <CollapsibleSection
        title="5️⃣ DM / Conversation SOP"
        icon={<Send className="w-5 h-5 text-emerald-400" />}
      >
        <div className="space-y-3">
          {dmSOP.map((dm, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div>
                <p className="font-semibold text-sm">{dm.type}</p>
                <p className="text-xs text-muted-foreground">→ {dm.approach}</p>
              </div>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
            ⚡ Always use <strong>Curiosity Bridge</strong> before any credit mention
          </div>
        </div>
      </CollapsibleSection>

      {/* 6. Credit Activation */}
      <CollapsibleSection
        title="6️⃣ Credit Activation & Purchase SOP"
        icon={<Coins className="w-5 h-5 text-purple-400" />}
      >
        <Card>
          <CardContent className="pt-6 space-y-2">
            {creditSOP.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </CollapsibleSection>

      {/* 7. Edge Cases */}
      <CollapsibleSection
        title="7️⃣ Edge Cases & Special Notes"
        icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
      >
        <div className="space-y-2">
          {edgeCases.map((ec, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-sm font-medium">{ec.case}</span>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs bg-orange-500/10 text-orange-300 border-orange-500/30">
                {ec.action}
              </Badge>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 8. Daily Metrics */}
      <CollapsibleSection
        title="8️⃣ Daily Metrics to Track"
        icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
      >
        <Card>
          <CardContent className="pt-6 p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Goal / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyMetrics.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{m.metric}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.goal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CollapsibleSection>

      {/* 9. Weekly Optimization */}
      <CollapsibleSection
        title="9️⃣ Weekly Optimization"
        icon={<RefreshCw className="w-5 h-5 text-teal-400" />}
      >
        <Card>
          <CardContent className="pt-6 space-y-2">
            {weeklyOptimization.map((item, i) => (
              <label key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={checked[`weekly-${i}`] || false}
                  onCheckedChange={() => toggleCheck(`weekly-${i}`)}
                  className="mt-0.5"
                />
                <span className={cn(
                  "text-sm",
                  checked[`weekly-${i}`] && "line-through text-muted-foreground"
                )}>
                  {item}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      </CollapsibleSection>
    </div>
  );
}
