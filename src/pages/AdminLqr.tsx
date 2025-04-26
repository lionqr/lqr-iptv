
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Category, Channel } from '@/hooks/useChannelData';
import { Edit, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import M3UImport from '@/components/M3UImport';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminLqr = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'category' | 'channel';
    item: Category | Channel | null;
  }>({ open: false, type: 'category', item: null });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: 'category' | 'channel';
    item: Category | Channel | null;
  }>({ open: false, type: 'category', item: null });
  const [moveDialog, setMoveDialog] = useState<{
    open: boolean;
    channel: Channel | null;
  }>({ open: false, channel: null });
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchChannelsByCategory(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelsByCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');
      
      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Failed to load channels');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    try {
      if (deleteDialog.type === 'category') {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', deleteDialog.item.id);
        
        if (error) throw error;
        toast.success('Category deleted');
        fetchCategories();
        if (selectedCategory?.id === deleteDialog.item.id) {
          setSelectedCategory(null);
          setChannels([]);
        }
      } else {
        const { error } = await supabase
          .from('channels')
          .delete()
          .eq('id', deleteDialog.item.id);
        
        if (error) throw error;
        toast.success('Channel deleted');
        if (selectedCategory) {
          fetchChannelsByCategory(selectedCategory.id);
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    } finally {
      setDeleteDialog({ open: false, type: 'category', item: null });
    }
  };

  const handleEditConfirm = async () => {
    if (!editDialog.item || !newName.trim()) return;

    try {
      if (editDialog.type === 'category') {
        const { error } = await supabase
          .from('categories')
          .update({ name: newName })
          .eq('id', editDialog.item.id);
        
        if (error) throw error;
        toast.success('Category renamed');
        fetchCategories();
      } else {
        const { error } = await supabase
          .from('channels')
          .update({ name: newName })
          .eq('id', editDialog.item.id);
        
        if (error) throw error;
        toast.success('Channel renamed');
        if (selectedCategory) {
          fetchChannelsByCategory(selectedCategory.id);
        }
      }
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Failed to update');
    } finally {
      setEditDialog({ open: false, type: 'category', item: null });
      setNewName('');
    }
  };

  const handleMoveChannel = async (newCategoryId: string) => {
    if (!moveDialog.channel) return;

    try {
      const { error } = await supabase
        .from('channels')
        .update({ category_id: newCategoryId })
        .eq('id', moveDialog.channel.id);
      
      if (error) throw error;
      toast.success('Channel moved');
      if (selectedCategory) {
        fetchChannelsByCategory(selectedCategory.id);
      }
    } catch (error) {
      console.error('Error moving channel:', error);
      toast.error('Failed to move channel');
    } finally {
      setMoveDialog({ open: false, channel: null });
    }
  };

  return (
    <div className="min-h-screen bg-firetv-background text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">LQR Admin</h1>
          <div className="space-x-4">
            <M3UImport onSuccess={fetchCategories} />
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80"
            >
              Back to App
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-firetv-dark rounded-lg p-4">
            <h2 className="text-xl mb-4">Categories</h2>
            <ScrollArea className="h-[calc(100vh-240px)]">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 mb-2 rounded-md flex items-center justify-between ${
                    selectedCategory?.id === category.id
                      ? 'bg-firetv-accent'
                      : 'bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className="flex-1 text-left"
                  >
                    {category.name}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditDialog({
                          open: true,
                          type: 'category',
                          item: category
                        });
                        setNewName(category.name);
                      }}
                      className="p-1 hover:text-firetv-accent"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({
                        open: true,
                        type: 'category',
                        item: category
                      })}
                      className="p-1 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="md:col-span-8 bg-firetv-dark rounded-lg p-4">
            <h2 className="text-xl mb-4">
              {selectedCategory ? `Channels in ${selectedCategory.name}` : 'Select a Category'}
            </h2>
            <ScrollArea className="h-[calc(100vh-240px)]">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="p-3 mb-2 rounded-md bg-gray-800 flex items-center justify-between"
                >
                  <span className="flex-1">{channel.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditDialog({
                          open: true,
                          type: 'channel',
                          item: channel
                        });
                        setNewName(channel.name);
                      }}
                      className="p-1 hover:text-firetv-accent"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setMoveDialog({
                        open: true,
                        channel
                      })}
                      className="p-1 hover:text-yellow-500"
                    >
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({
                        open: true,
                        type: 'channel',
                        item: channel
                      })}
                      className="p-1 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: 'category', item: null })}>
          <AlertDialogContent className="bg-firetv-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this {deleteDialog.type}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, type: 'category', item: null })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <AlertDialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, type: 'category', item: null })}>
          <AlertDialogContent className="bg-firetv-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Rename {editDialog.type}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Enter a new name below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                placeholder="Enter new name"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEditDialog({ open: false, type: 'category', item: null })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleEditConfirm} className="bg-firetv-accent hover:bg-firetv-accent/80">
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Move Channel Dialog */}
        <AlertDialog open={moveDialog.open} onOpenChange={(open) => !open && setMoveDialog({ open: false, channel: null })}>
          <AlertDialogContent className="bg-firetv-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Move Channel</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Select a new category for this channel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-60 py-4">
              <div className="space-y-2">
                {categories
                  .filter(cat => cat.id !== selectedCategory?.id)
                  .map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleMoveChannel(category.id)}
                      className="w-full p-2 text-left rounded-md hover:bg-gray-800"
                    >
                      {category.name}
                    </button>
                  ))
                }
              </div>
            </ScrollArea>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMoveDialog({ open: false, channel: null })}>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminLqr;
