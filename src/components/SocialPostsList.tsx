import { useEffect, useState } from "react";
import { supabase } from "@/intergrations/supabase/client";
import { deletePost } from "@/services/socialEcho";
import {useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, RefreshCw, BarChart3, CheckCircle2, Clock,Trash2 } from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { generateTemplate } from "@/services/socialEcho";

interface SocialPost {
  id: string;
  post_text?: string;
  post_link?: string;
  analysis_link?: string;
  platform?: string;
  post_type?: string; // "post" | "dm"
  status?: string;
  posted?: boolean;
  created_at?: string;
  sentiment_distribution?: Record<string, number>;
  agreement_distribution?: Record<string, number>;
  analysis_result?: any;
  post_template?: any;
}

const platformIcons: Record<string, string> = {
  x: "𝕏",
  twitter: "𝕏",
  facebook: "f",
  tiktok: "♪",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: {
    label: "Analysed",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "Pending",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
};

export default function SocialPostsAdmin() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  // inside the component
const [editedTemplates, setEditedTemplates] = useState<Record<string, any>>({});
 const { toast } = useToast();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {

    if (deletingId) return; // Prevent multi-click madness

    try {
      setDeletingId(postId);

      await deletePost(postId);

      toast({
        title: "Post deleted",
        description: "The post and related analysis were removed successfully.",
      });

      
      onPostDeleted?.(postId); 

    } catch (error) {

      console.error(error);

      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "Something went wrong while deleting the post.",
      });

    } finally {
      setDeletingId(null);
    }
  };

const handleTemplateChange = (postId: string, section: string, value: Partial<any>) => {
  setEditedTemplates((prev) => ({
    ...prev,
    [postId]: {
      ...prev[postId],
      [section]: {
        ...((prev[postId]?.[section]) || {}),
        ...value,
      },
    },
  }));
};;

const saveEditedTemplates = async () => {
  setCreating(true);
  try {
    for (let postId of Array.from(selectedPosts)) {
      const updatedTemplate = editedTemplates[postId];
      console.log(editedTemplates)
      if (!updatedTemplate) continue;
      await supabase
        .from("social_posts")
        .update({ post_template: updatedTemplate })
        .eq("id", postId);
      
      // update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, post_template: updatedTemplate } : p
        )
      );
    }
    alert("hello")
    setEditedTemplates({});
    setShowDialog(false);
  } catch (err) {
    console.error("Failed to save edited templates:", err);
  } finally {
    setCreating(false);
  }
};


  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleSelectPost = (id: string) => {
    setSelectedPosts((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const generateTemplatesForSelected = async () => {
    if (selectedPosts.size === 0) return;
    setCreating(true);

    try {
      const updatedPosts = [...posts];
      for (let post of posts) {
        if (selectedPosts.has(post.id) && post.status === "completed") {
          const template = generateTemplate(post);
          await supabase
            .from("social_posts")
            .update({ post_template: template })
            .eq("id", post.id);
          post.post_template = template; // update local state
        }
      }
      setPosts(updatedPosts);
      setShowDialog(true); // open dialog to show templates
    } catch (err) {
      console.error("Failed to generate templates:", err);
    } finally {
      setCreating(false);
    }
  };

  const markAsPosted = async () => {
    if (selectedPosts.size === 0) return;
    setCreating(true);

    try {
      await supabase
        .from("social_posts")
        .update({ posted: true,is_general: true })
        .in("id", Array.from(selectedPosts));

      setPosts((prev) =>
        prev.map((p) =>
          selectedPosts.has(p.id) ? { ...p, posted: true } : p
        )
      );
      setSelectedPosts(new Set()); // clear selection
    } catch (err) {
      console.error("Failed to mark as posted:", err);
    } finally {
      setCreating(false);
    }
  };

  const completedCount = posts.filter((p) => p.status === "completed").length;
  const templatesCount = posts.filter((p) => p.post_template).length;
  const postedCount = posts.filter((p) => p.posted).length;

  const getSentimentSummary = (dist?: Record<string, number>) => {
    if (!dist) return null;
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    const positive = dist.positive || 0;
    return `${Math.round((positive / total) * 100)}% positive`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading posts...
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
    
  <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4 className="text-sm font-semibold">Social Posts Admin</h4>
          <Badge variant="outline" className="text-[10px] py-0">
            {completedCount}/{posts.length} analysed
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0">
            {templatesCount} templates
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0">
            {postedCount} posted
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchPosts} className="gap-1 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
  size="sm"
  onClick={() => setShowEditDialog(true)}
  disabled={selectedPosts.size === 0 || creating}
  className="gap-1 text-xs"
>
  Edit Template
</Button>

          <Button size="sm" onClick={generateTemplatesForSelected} disabled={creating || selectedPosts.size===0} className="gap-1 text-xs">
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Generate Template"}
          </Button>
          <Button size="sm" onClick={markAsPosted} disabled={creating || selectedPosts.size===0} className="gap-1 text-xs">
            Mark as Posted
          </Button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Select</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Platform</TableHead>
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs">Posted</TableHead>
               <TableHead className="text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => {
              const post_text = Object.entries(post.post_text);
              return (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.has(post.id)}
                      onCheckedChange={() => toggleSelectPost(post.id)}
                      disabled={post.status !== "completed"}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] py-0 gap-1">
                      {post.status === "completed" ? "Analysed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {platformIcons[post.platform?.toLowerCase() || ""] || "🌐"} {post.platform || "—"}
                  </TableCell>
                  
                  <TableCell className="max-w-[300px] ">{post.source_url || ""}</TableCell>
    <TableCell>{post.posted ? "✅" : "—"}</TableCell>
                  <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                 
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete <Trash2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TableCell>
    
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
{/* Dialog to show generated templates */}
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Generated Templates</DialogTitle>
      <DialogDescription>
        Showing templates for selected posts
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2">
      {Array.from(selectedPosts).map((id) => {
        const post = posts.find((p) => p.id === id);
        if (!post?.post_template) return null;

        return (
          <div key={id} className="border p-2 rounded space-y-2">
            <h5 className="text-xs font-semibold">Post ID: {id}</h5>
            {Object.entries(post.post_template).map(([section, content]) => (
              <div key={section} className="border-t pt-1">
                <strong className="text-[10px] font-medium capitalize">{section}</strong>
                <p className="text-xs mt-0.5">{(content as any).text}</p>
                <p className="text-[9px] text-muted-foreground">
                  Tone: {(content as any).tone}, Goal: {(content as any).goal}
                </p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  </DialogContent>
</Dialog>


{/* Dialog to edit generated templates */}
<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Edit Generated Templates</DialogTitle>
      <DialogDescription>
        Modify the generated templates for selected posts before saving
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto">
      {Array.from(selectedPosts).map((id) => {
        const post = posts.find((p) => p.id === id);
        if (!post?.post_template) return null;

        return (
          <div key={id} className="border p-2 rounded space-y-2">
            <h5 className="text-xs font-semibold">Post ID: {id}</h5>
            {Object.entries(post.post_template).map(([section, content]) => (
              <div key={section} className="space-y-1">
                <h6 className="text-[10px] font-medium capitalize">{section}</h6>

               {/* Editable Text Field */}
<label className="text-[9px] font-medium">Text</label>
<Textarea
  rows={2}
  value={editedTemplates[id]?.[section]?.text ?? (content as any).text}
  onChange={(e) =>
    handleTemplateChange(id, section, { text: e.target.value })
  }
/>

{/* Tone Input */}
<label className="text-[9px] font-medium mt-1">Tone</label>
<Input
  size="sm"
  value={editedTemplates[id]?.[section]?.tone ?? (content as any).tone}
  onChange={(e) =>
    handleTemplateChange(id, section, { tone: e.target.value })
  }
/>

{/* Goal Input */}
<label className="text-[9px] font-medium mt-1">Goal</label>
<Input
  size="sm"
  value={editedTemplates[id]?.[section]?.goal ?? (content as any).goal}
  onChange={(e) =>
    handleTemplateChange(id, section, { goal: e.target.value })
  }
/>
              </div>
            ))}
          </div>
        );
      })}
    </div>

    <div className="flex justify-end gap-2 mt-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowEditDialog(false)}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={saveEditedTemplates}
        disabled={creating}
      >
        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}
