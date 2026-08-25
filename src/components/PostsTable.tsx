import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ExternalLink,
  FolderPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { deletePost } from "@/services/socialEcho";
import { useToast } from "@/hooks/use-toast";

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

export function PostsTable({
  posts,
  onViewPost,
  onAssignPost,
  showAssignButton = false,
  onPostDeleted,
}: PostsTableProps) {
  const { toast } = useToast();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const completedPosts = useMemo(
    () => posts.filter((post) => post.status === "completed"),
    [posts]
  );

  const totalPages = Math.ceil(completedPosts.length / postsPerPage);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return completedPosts.slice(startIndex, startIndex + postsPerPage);
  }, [completedPosts, currentPage]);

  // If deleting/filtering causes the current page to disappear,
  // move back to the last available page.
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (postId: string) => {
    if (deletingId) return;

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
            <TableHead>Sentiment</TableHead>
            <TableHead>Agreement</TableHead>
            <TableHead>Post Url</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedPosts.map((post, index) => (
            <motion.tr
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <TableCell>
                <div>
                  <div className="text-gray-900 max-w-[200px]">
                    {post.post_text?.content}
                  </div>

                  {post.campaignName && (
                    <div className="text-xs text-gray-500 mt-1">
                      Campaign: {post.campaignName}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-gray-600">
                {post.date}
              </TableCell>

              <TableCell>
                <span className={getSentimentColor(post.sentiment)}>
                  {post.sentiment}%
                </span>
              </TableCell>

              <TableCell>
                <span className={getAgreementColor(post.agreement)}>
                  {post.agreement}%
                </span>
              </TableCell>

              <TableCell className="text-gray-900">
                {post.url}
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
                    View
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === post.id}
                    onClick={() => handleDelete(post.id)}
                  >
                    {deletingId === post.id ? "Deleting..." : "Delete"}
                    <Trash2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing{" "}
            {(currentPage - 1) * postsPerPage + 1}–
            {Math.min(
              currentPage * postsPerPage,
              completedPosts.length
            )}{" "}
            of {completedPosts.length} posts
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}