// app/prompts/components/prompts-grid.tsx
"use client"; // Mark as Client Component for state and interaction

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Import Shadcn Card
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPrompt, updatePrompt, deletePrompt } from "@/actions/prompts-actions";
import { motion } from "framer-motion";
import { Copy, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Import toast for notifications

// Define the expected structure for a prompt object
interface Prompt {
  id: number;
  name: string;
  description: string;
  content: string;
}

// Define the props the component expects
interface PromptsGridProps {
  initialPrompts: Prompt[];
}

export const PromptsGrid = ({ initialPrompts }: PromptsGridProps) => {
  // Initialize state with the passed prompts
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: ""
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        const updatedPrompt = await updatePrompt({ id: editingId, ...formData });
        setPrompts(prev => prev.map(p => p.id === editingId ? updatedPrompt : p));
      } else {
        const newPrompt = await createPrompt(formData);
        setPrompts(prev => [newPrompt, ...prev]);
      }
      setFormData({ name: "", description: "", content: "" });
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setFormData({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content
    });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingId(null);
      setFormData({ name: "", description: "", content: "" });
    }
    setIsDialogOpen(open);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await deletePrompt(deletingId);
      setPrompts(prev => prev.filter(p => p.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete prompt");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Prompt copied to clipboard!");
    } catch {
      toast.error("Failed to copy prompt");
    }
  };

  // Filter prompts based on search query
  const filteredPrompts = prompts.filter(prompt => 
    prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Display message and create button if no prompts exist
  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 gap-2">
              <Plus className="w-5 h-5" /> Create First Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="min-h-[100px]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Prompt"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <p className="text-gray-600 dark:text-gray-300">No prompts found. Get started by creating one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-5 h-5" /> Create Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Prompt" : "Create Prompt")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPrompts.length} of {prompts.length} prompts
          </p>
        )}
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Map over the prompts state array */}
        {filteredPrompts.map((prompt, index) => (
          <motion.div /* Animation wrapper */
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            {/* Shadcn Card */}
            <Card className="h-full flex flex-col bg-white dark:bg-gray-800/50 shadow-sm border border-gray-200 dark:border-gray-700/50">
              <CardContent className="pt-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-2">
                   {/* Title & Description */}
                  <div className="flex-1 min-w-0"> {/* Allow text to wrap/truncate */}
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate" title={prompt.name}>
                      {prompt.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2" title={prompt.description}>
                      {prompt.description}
                    </p>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(prompt.content)}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(prompt)}
                      title="Edit prompt"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(prompt.id)}
                          title="Delete prompt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Prompt</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Are you sure you want to delete this prompt? This action cannot be undone.
                        </p>
                        {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {/* Prompt Content */}
                <div className="flex-grow mt-2 bg-gray-100 dark:bg-gray-700/60 rounded p-3 overflow-auto max-h-40"> {/* Limit height and allow scroll */}
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words font-mono">
                    {prompt.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
};