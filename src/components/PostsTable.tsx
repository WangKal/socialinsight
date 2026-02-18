import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink, FolderPlus,Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { deletePost } from "@/services/socialEcho";
import {useToast } from "@/hooks/use-toast"

export interface Post {
  id: string;
  title: string;
  url: string;
  date: string;
  replies: number;
  sentiment: number;
  agreement: number;
  category: "general" | "personal" | "campaign";
  campaignName?: string;
  status: "completed" | "analyzing" | "failed";
}

interface PostsTableProps {
  posts: Post[];
  onViewPost: (postId: string) => void;
  onAssignPost?: (postId: string) => void;
  showAssignButton?: boolean;
  onPostDeleted?: (postId: string) => void;
}

export function PostsTable({ posts, onViewPost, onAssignPost, showAssignButton = false, onPostDeleted }: PostsTableProps) {
  
 const { toast } = useToast();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {

    if (deletingId) return; // 🚨 Prevent multi-click madness

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

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 70) return "text-green-600";
    if (sentiment > 40) return "text-amber-600";
    return "text-red-600";
  };

  const getAgreementColor = (agreement: number) => {
    if (agreement > 60) return "text-green-600";
    if (agreement > 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Post Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Replies</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Agreement</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post, index) => (
            <motion.tr
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <TableCell>
                <div>
                  <div className="text-gray-900">{post.title}</div>
                  {post.campaignName && (
                    <div className="text-xs text-gray-500 mt-1">
                      Campaign: {post.campaignName}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{post.date}</TableCell>
              <TableCell className="text-gray-900">{post.replies}</TableCell>
              <TableCell>
                <span className={getSentimentColor(post.sentiment)}>
                  {post.sentiment_distribution}%
                </span>
              </TableCell>
              <TableCell>
                <span className={getAgreementColor(post.agreement)}>
                  {post.agreement_distribution}%
                </span>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    post.status === "completed"
                      ? "default"
                      : post.status === "analyzing"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {post.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {showAssignButton && onAssignPost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAssignPost(post.id)}
                    >
                      <FolderPlus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewPost(post.id)}
                  >
                    View <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete <Trash2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
