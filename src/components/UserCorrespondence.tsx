import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  User,
  MessageSquare,
  CreditCard,
  Eye,
  Mail,
  StickyNote,
  ChevronRight,
  ArrowLeft,
  Send,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data ---

interface Note {
  id: string;
  date: string;
  type: "note" | "email" | "dm";
  platform?: string;
  content: string;
  author: string;
}

interface PageVisit {
  id: string;
  date: string;
  page: string;
  duration: string;
  referrer: string;
}

interface CreditEvent {
  id: string;
  date: string;
  type: "activation" | "purchase" | "free";
  amount: number;
  method?: string;
}

interface EngagementEvent {
  id: string;
  date: string;
  action: string;
  platform: string;
  postLink?: string;
}

interface LeadUser {
  id: string;
  name: string;
  handle: string;
  email?: string;
  platform: string;
  tier: 1 | 2 | 3;
  conversionStatus: "prospect" | "engaged" | "activated" | "converted" | "churned";
  buyerSignals: string[];
  lastActivity: string;
  totalCredits: number;
  notes: Note[];
  pageVisits: PageVisit[];
  creditEvents: CreditEvent[];
  engagementTimeline: EngagementEvent[];
}

const mockUsers: LeadUser[] = [
  {
    id: "u1",
    name: "Sarah Kimani",
    handle: "@sarahkim",
    email: "sarah@agency.co",
    platform: "X",
    tier: 1,
    conversionStatus: "activated",
    buyerSignals: ["Pain", "Analytical", "Professional"],
    lastActivity: "2 hours ago",
    totalCredits: 150,
    notes: [
      { id: "n1", date: "2025-11-18 14:30", type: "note", content: "Responded to insight thread about engagement patterns. Very interested in analytics deep dive. Mentioned running campaigns for 3 clients.", author: "Admin" },
      { id: "n2", date: "2025-11-18 10:15", type: "dm", platform: "X", content: "Sent curiosity bridge DM about pattern analysis on her latest post. She asked for more details.", author: "Admin" },
      { id: "n3", date: "2025-11-17 16:00", type: "email", content: "Follow-up email with starter credit activation link. Opened within 1 hour.", author: "Admin" },
      { id: "n4", date: "2025-11-16 11:20", type: "note", content: "Initial detection — high buyer signal density on TikTok analytics thread. Tagged as Tier 1.", author: "Admin" },
    ],
    pageVisits: [
      { id: "v1", date: "2025-11-18 14:45", page: "/dashboard", duration: "8m 32s", referrer: "DM link" },
      { id: "v2", date: "2025-11-18 14:50", page: "/analytics", duration: "12m 15s", referrer: "Internal" },
      { id: "v3", date: "2025-11-17 16:30", page: "/", duration: "2m 05s", referrer: "Email" },
      { id: "v4", date: "2025-11-17 16:33", page: "/guide", duration: "5m 40s", referrer: "Internal" },
    ],
    creditEvents: [
      { id: "cr1", date: "2025-11-18 15:00", type: "activation", amount: 50, method: "Starter credits" },
      { id: "cr2", date: "2025-11-18 15:30", type: "purchase", amount: 100, method: "M-Pesa" },
    ],
    engagementTimeline: [
      { id: "e1", date: "2025-11-18 14:00", action: "Replied to Tier 1 post (Pain script)", platform: "X" },
      { id: "e2", date: "2025-11-18 10:10", action: "Sent Curiosity Bridge DM", platform: "X" },
      { id: "e3", date: "2025-11-17 15:30", action: "Initial detection — tagged Tier 1", platform: "TikTok" },
      { id: "e4", date: "2025-11-16 11:00", action: "Detected pain signals in thread", platform: "TikTok" },
    ],
  },
  {
    id: "u2",
    name: "David Ochieng",
    handle: "@dave_och",
    platform: "TikTok",
    tier: 1,
    conversionStatus: "engaged",
    buyerSignals: ["Curiosity", "Authority"],
    lastActivity: "5 hours ago",
    totalCredits: 0,
    notes: [
      { id: "n5", date: "2025-11-18 09:00", type: "note", content: "Commented 3 times on pattern analysis thread. Shows strong curiosity signal. Preparing curiosity bridge DM.", author: "Admin" },
      { id: "n6", date: "2025-11-17 20:00", type: "dm", platform: "TikTok", content: "Initial outreach — mentioned his comment about engagement patterns. Waiting for reply.", author: "Admin" },
    ],
    pageVisits: [
      { id: "v5", date: "2025-11-18 09:30", page: "/", duration: "1m 20s", referrer: "Direct" },
    ],
    creditEvents: [],
    engagementTimeline: [
      { id: "e5", date: "2025-11-18 08:45", action: "Replied to engagement insight post", platform: "TikTok" },
      { id: "e6", date: "2025-11-17 19:30", action: "Detected — repeated curiosity signals", platform: "TikTok" },
    ],
  },
  {
    id: "u3",
    name: "Amina Wanjiru",
    handle: "@amina_w",
    email: "amina@marketing.io",
    platform: "Facebook",
    tier: 2,
    conversionStatus: "prospect",
    buyerSignals: ["Professional"],
    lastActivity: "1 day ago",
    totalCredits: 0,
    notes: [
      { id: "n7", date: "2025-11-17 14:00", type: "note", content: "Engaged lightly on Facebook discussion thread. Professional signal — mentions she runs a digital agency. Low urgency, monitor.", author: "Admin" },
    ],
    pageVisits: [],
    creditEvents: [],
    engagementTimeline: [
      { id: "e7", date: "2025-11-17 13:50", action: "Light engagement on Tier 2 post", platform: "Facebook" },
    ],
  },
  {
    id: "u4",
    name: "James Mutua",
    handle: "@jmutua",
    platform: "X",
    tier: 1,
    conversionStatus: "converted",
    buyerSignals: ["Pain", "Analytical", "Curiosity"],
    lastActivity: "3 hours ago",
    totalCredits: 500,
    notes: [
      { id: "n8", date: "2025-11-18 12:00", type: "note", content: "Fully converted. Purchased 500 credits. Very active user — runs 5 client accounts. Potential referral source.", author: "Admin" },
      { id: "n9", date: "2025-11-17 10:00", type: "dm", platform: "X", content: "Credit activation DM sent. He immediately activated and purchased more.", author: "Admin" },
    ],
    pageVisits: [
      { id: "v6", date: "2025-11-18 12:10", page: "/analytics", duration: "22m 08s", referrer: "Direct" },
      { id: "v7", date: "2025-11-18 12:35", page: "/payments", duration: "4m 12s", referrer: "Internal" },
      { id: "v8", date: "2025-11-17 10:20", page: "/dashboard", duration: "15m 30s", referrer: "DM link" },
    ],
    creditEvents: [
      { id: "cr3", date: "2025-11-17 10:30", type: "activation", amount: 50, method: "Starter credits" },
      { id: "cr4", date: "2025-11-17 11:00", type: "purchase", amount: 200, method: "Paystack" },
      { id: "cr5", date: "2025-11-18 12:40", type: "purchase", amount: 250, method: "M-Pesa" },
    ],
    engagementTimeline: [
      { id: "e8", date: "2025-11-18 12:00", action: "Purchased 250 credits", platform: "Web" },
      { id: "e9", date: "2025-11-17 11:00", action: "Purchased 200 credits", platform: "Web" },
      { id: "e10", date: "2025-11-17 10:30", action: "Activated starter credits", platform: "Web" },
      { id: "e11", date: "2025-11-17 09:00", action: "Sent credit activation DM", platform: "X" },
      { id: "e12", date: "2025-11-16 14:00", action: "Detected — pain + analytical signals", platform: "X" },
    ],
  },
];

const tierConfig = {
  1: { label: "Tier 1", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  2: { label: "Tier 2", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  3: { label: "Tier 3", color: "bg-muted text-muted-foreground border-border" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  prospect: { label: "Prospect", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  engaged: { label: "Engaged", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  activated: { label: "Activated", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  converted: { label: "Converted", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  churned: { label: "Churned", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const platformIcon: Record<string, string> = {
  X: "𝕏",
  TikTok: "♪",
  Facebook: "f",
};

// --- Note type config ---
const noteTypeConfig = {
  note: { icon: <StickyNote className="w-3.5 h-3.5" />, label: "Note", color: "text-amber-400" },
  email: { icon: <Mail className="w-3.5 h-3.5" />, label: "Email", color: "text-blue-400" },
  dm: { icon: <Send className="w-3.5 h-3.5" />, label: "DM", color: "text-emerald-400" },
};

export default function UserCorrespondence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<LeadUser | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState<"note" | "email" | "dm">("note");
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === null || u.tier === filterTier;
    const matchesStatus = filterStatus === null || u.conversionStatus === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedUser) return;
    // In production this would save to DB
    const note: Note = {
      id: `n-${Date.now()}`,
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      type: newNoteType,
      content: newNote,
      author: "Admin",
    };
    selectedUser.notes.unshift(note);
    setNewNote("");
    setShowAddNote(false);
  };

  // --- User List View ---
  if (!selectedUser) {
    return (
      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((t) => (
              <Button
                key={t}
                variant="outline"
                size="sm"
                onClick={() => setFilterTier(filterTier === t ? null : t)}
                className={cn(
                  "text-xs",
                  filterTier === t && tierConfig[t as 1 | 2 | 3].color
                )}
              >
                Tier {t}
              </Button>
            ))}
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus(filterStatus === key ? null : key)}
                className={cn("text-xs", filterStatus === key && cfg.color)}
              >
                {cfg.label}
              </Button>
            ))}
          </div>
        </div>

        {/* User Cards */}
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.handle}</span>
                      <span className="text-xs opacity-60">{platformIcon[user.platform]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] py-0", tierConfig[user.tier].color)}>
                        {tierConfig[user.tier].label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] py-0", statusConfig[user.conversionStatus].color)}>
                        {statusConfig[user.conversionStatus].label}
                      </Badge>
                      {user.buyerSignals.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] py-0 text-muted-foreground">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{user.lastActivity}</p>
                    {user.totalCredits > 0 && (
                      <p className="text-xs font-medium text-primary">{user.totalCredits} credits</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-xs">{user.notes.length}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No users match your filters
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- User Detail View ---
  const user = selectedUser;

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <span className="text-sm text-muted-foreground">{user.handle}</span>
              <span className="text-sm opacity-60">{platformIcon[user.platform]}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {user.email && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {user.email}
                </span>
              )}
              <Badge variant="outline" className={cn("text-xs", tierConfig[user.tier].color)}>
                {tierConfig[user.tier].label} — Buyer
              </Badge>
              <Badge variant="outline" className={cn("text-xs", statusConfig[user.conversionStatus].color)}>
                {statusConfig[user.conversionStatus].label}
              </Badge>
            </div>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAddNote(true)} className="gap-1">
          <Plus className="w-4 h-4" /> Add Note
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Notes", value: user.notes.length, icon: <StickyNote className="w-4 h-4 text-amber-400" />, bg: "bg-amber-500/10" },
          { label: "Page Visits", value: user.pageVisits.length, icon: <Eye className="w-4 h-4 text-blue-400" />, bg: "bg-blue-500/10" },
          { label: "Credits", value: user.totalCredits, icon: <CreditCard className="w-4 h-4 text-purple-400" />, bg: "bg-purple-500/10" },
          { label: "Engagements", value: user.engagementTimeline.length, icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-xl border p-3 flex items-center gap-3", stat.bg)}>
            {stat.icon}
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Buyer Signals */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Buyer Signals:</span>
        {user.buyerSignals.map((s) => (
          <Badge key={s} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            <Target className="w-3 h-3 mr-1" /> {s}
          </Badge>
        ))}
      </div>

      {/* Tabbed Detail */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="notes" className="text-xs gap-1">
            <StickyNote className="w-3.5 h-3.5" /> Notes
          </TabsTrigger>
          <TabsTrigger value="visits" className="text-xs gap-1">
            <Eye className="w-3.5 h-3.5" /> Visits
          </TabsTrigger>
          <TabsTrigger value="credits" className="text-xs gap-1">
            <CreditCard className="w-3.5 h-3.5" /> Credits
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs gap-1">
            <Clock className="w-3.5 h-3.5" /> Timeline
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-3">
          {user.notes.map((note) => {
            const cfg = noteTypeConfig[note.type];
            return (
              <div key={note.id} className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <Badge variant="outline" className="text-[10px] py-0">{cfg.label}</Badge>
                  {note.platform && (
                    <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                      {note.platform}
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground ml-auto">{note.date}</span>
                </div>
                <p className="text-sm leading-relaxed">{note.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">— {note.author}</p>
              </div>
            );
          })}
          {user.notes.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No notes yet</p>
          )}
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits">
          <Card>
            <CardContent className="pt-4 p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Page</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs">Referrer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.pageVisits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-xs text-muted-foreground">{v.date}</TableCell>
                      <TableCell className="text-xs font-mono">{v.page}</TableCell>
                      <TableCell className="text-xs">{v.duration}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] py-0">{v.referrer}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {user.pageVisits.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">No page visits recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-3">
          {user.creditEvents.map((cr) => (
            <div key={cr.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  cr.type === "purchase" ? "bg-emerald-500/20 text-emerald-400" :
                  cr.type === "activation" ? "bg-purple-500/20 text-purple-400" :
                  "bg-blue-500/20 text-blue-400"
                )}>
                  {cr.type === "purchase" ? "$" : cr.type === "activation" ? "★" : "🎁"}
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{cr.type}</p>
                  <p className="text-[11px] text-muted-foreground">{cr.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">+{cr.amount} credits</p>
                {cr.method && <p className="text-[10px] text-muted-foreground">{cr.method}</p>}
              </div>
            </div>
          ))}
          {user.creditEvents.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No credit activity</p>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
            {user.engagementTimeline.map((evt) => (
              <div key={evt.id} className="relative">
                <div className="absolute -left-[14px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <div className="p-3 rounded-lg bg-card border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] py-0">{evt.platform}</Badge>
                    <span className="text-[10px] text-muted-foreground">{evt.date}</span>
                  </div>
                  <p className="text-sm">{evt.action}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Correspondence</DialogTitle>
            <DialogDescription>
              Log a note, email, or DM for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              {(["note", "email", "dm"] as const).map((type) => {
                const cfg = noteTypeConfig[type];
                return (
                  <Button
                    key={type}
                    variant={newNoteType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewNoteType(type)}
                    className="gap-1"
                  >
                    {cfg.icon} {cfg.label}
                  </Button>
                );
              })}
            </div>
            <Textarea
              placeholder="Write your note, email summary, or DM content..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full gap-1">
              <Plus className="w-4 h-4" /> Save Correspondence
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
