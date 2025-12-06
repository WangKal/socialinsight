import { motion, AnimatePresence } from "motion/react";
import { X, FolderPlus, User, Briefcase } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface AssignPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (category: "personal" | "campaign", campaignId?: string) => void;
  postTitle: string;
  campaigns: Array<{ id: string; name: string; description: string; color: string }>;
}

export function AssignPostDialog({ isOpen, onClose, onAssign, postTitle, campaigns, category,campaign, assignedCampaignName }: AssignPostDialogProps) {
  const [selectedAssignment, setselectedAssignment] = useState<"personal" | "campaign" | "removeCampaign" | "removePersonal" | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
const [creatingNewCampaign, setCreatingNewCampaign] = useState(false);
const [newCampaignName, setNewCampaignName] = useState("");
const [campaignDescription, setNewCampaignDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 console.log(selectedCampaignId)
    if (!selectedAssignment) {
      setError("Please select a category");
      return;
    }

    if (selectedAssignment === "campaign" && (!selectedCampaignId )) {
      setError("Please select a campaign");
      return;
    }

    onAssign(selectedAssignment, selectedAssignment === "campaign" || selectedAssignment === "campaign" ? selectedCampaignId : undefined, newCampaignName, campaignDescription);
    handleClose();
  };

  const handleClose = () => {
    setselectedAssignment(null);
    setSelectedCampaignId("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FolderPlus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Assign Post
                  </h2>
                </div>
                <p className="text-gray-600">
                  Assign "{postTitle}" to a category
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm text-gray-700 mb-3">
                    Select Assignment *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                   {category !="personal" ?( <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setselectedAssignment("personal");
                        setError("");
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedAssignment === "personal"
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <User className={`w-6 h-6 mx-auto mb-2 ${
                        selectedAssignment === "personal" ? "text-violet-600" : "text-gray-400"
                      }`} />
                      <div className={`text-sm ${
                        selectedAssignment === "personal" ? "text-violet-900" : "text-gray-700"
                      }`}>
                        Personal
                      </div>
                    </motion.button>)
                   :(
                    <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Assigned as:</strong> 
                      <span className="text-purple-600 font-semibold">
                        Personal
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setselectedAssignment("removePersonal");
                        
                       
                      }}
                    >
                      Remove as Personal post
                    </Button>
                  </div>)}

                    {campaign==null || campaign.length < 1 ?(<motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setselectedAssignment("campaign");
                        setError("");
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedAssignment === "campaign"
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 mx-auto mb-2 ${
                        selectedAssignment === "campaign" ? "text-violet-600" : "text-gray-400"
                      }`} />
                      <div className={`text-sm ${
                        selectedAssignment === "campaign" ? "text-violet-900" : "text-gray-700"
                      }`}>
                        Campaign
                      </div>
                    </motion.button>):(


<div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Status:</strong> Assigned to campaign{" "}
                      <span className="text-purple-600 font-semibold">
                        {assignedCampaignName}
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setselectedAssignment("removeCampaign");
                        
                        
                      }}
                    >
                      Remove from Campaign
                    </Button>
                  </div>

                    )}
                  </div>
                </div>

                {/* Campaign Name Input (for selecting or creating a campaign) */}
<AnimatePresence>
  {selectedAssignment === "campaign" && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <label htmlFor="campaignName" className="block text-sm text-gray-700">
        Campaign *
      </label>

      {/* Campaign Select */}
      <select
        id="campaignName"
        value={selectedCampaignId}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedCampaignId(value);
          setError("");

          // If "new" was chosen, reveal the new campaign input
          if (value === "new") {
            setCreatingNewCampaign(true);
          } else {
            setCreatingNewCampaign(false);
          }
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-violet-500 
                   focus:border-transparent"
      >
        <option value="">Select a campaign</option>
        <option value="new">+ Create New Campaign</option>
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.name}
          </option>
        ))}

        
      </select>

      {/* New Campaign Name Input */}
      <AnimatePresence>
        {creatingNewCampaign && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm text-gray-700 mb-2">
              New Campaign Name *
            </label>

            <input
              type="text"
              value={newCampaignName}
              onChange={(e) => {
                setNewCampaignName(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-violet-500 
                         focus:border-transparent"
              placeholder="Enter campaign name..."
            />
             <label className="block text-sm text-gray-700 mb-2">
              New Campaign Description *
            </label>

            <input
              type="text"
              value={campaignDescription}
              onChange={(e) => {
                setNewCampaignDescription(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-violet-500 
                         focus:border-transparent"
              placeholder="Enter campaign description..."
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )}
</AnimatePresence>


                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  >
                    Assign
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}