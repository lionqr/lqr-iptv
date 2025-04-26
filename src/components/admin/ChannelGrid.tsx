
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Edit, Trash } from 'lucide-react';
import { Channel, Category } from '@/hooks/useChannelData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { playSoundEffect } from '@/lib/sound-utils';
import { supabase } from '@/integrations/supabase/client';

interface ChannelGridProps {
  channels: Channel[];
  categories: Category[];
  selectedCategory: Category | null;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channel: Channel) => void;
  onChannelDetails: (channel: Channel) => void;
  loading: boolean;
}

const ChannelGrid = ({
  channels,
  categories,
  selectedCategory,
  onEditChannel,
  onDeleteChannel,
  onChannelDetails,
  loading
}: ChannelGridProps) => {
  const [channelToDelete, setChannelToDelete] = React.useState<Channel | null>(null);
  const [channelToMove, setChannelToMove] = React.useState<Channel | null>(null);
  const [targetCategoryId, setTargetCategoryId] = React.useState<string>('');

  const handleDeleteClick = (channel: Channel) => {
    playSoundEffect('back');
    setChannelToDelete(channel);
  };

  const handleDeleteConfirm = () => {
    if (channelToDelete) {
      onDeleteChannel(channelToDelete);
      setChannelToDelete(null);
    }
  };

  const handleMoveChannel = async () => {
    if (!channelToMove || !targetCategoryId) return;

    try {
      const { error } = await supabase
        .from('channels')
        .update({ 
          category_id: targetCategoryId,
          last_updated: new Date().toISOString()
        })
        .eq('id', channelToMove.id);

      if (error) throw error;

      toast.success('Channel moved successfully');
      playSoundEffect('select');
      setChannelToMove(null);
      setTargetCategoryId('');

      // Refresh the channels list
      if (selectedCategory) {
        const { data, error: fetchError } = await supabase
          .from('channels')
          .select('*')
          .eq('category_id', selectedCategory.id)
          .order('order_index');
        
        if (fetchError) throw fetchError;
      }
    } catch (error) {
      console.error('Error moving channel:', error);
      playSoundEffect('error');
      toast.error('Failed to move channel');
    }
  };

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-video bg-gray-700/30 rounded-md animate-pulse"></div>
            ))
          ) : channels.length > 0 ? (
            channels.map(channel => (
              <div 
                key={channel.id}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative group">
                  {channel.logo ? (
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-xl font-bold">{channel.name.charAt(0)}</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => onChannelDetails(channel)}
                      className="p-2 bg-firetv-accent rounded-full hover:bg-firetv-accent/80"
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={() => setChannelToMove(channel)}
                      className="p-2 bg-blue-600 rounded-full hover:bg-blue-500"
                    >
                      Move
                    </button>
                  </div>
                  
                  {channel.is_default && (
                    <div className="absolute top-2 right-2 bg-green-700 px-2 py-1 rounded-full text-xs">
                      Default
                    </div>
                  )}
                  
                  {channel.is_visible === false && (
                    <div className="absolute top-2 left-2 bg-gray-700 px-2 py-1 rounded-full text-xs">
                      Hidden
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{channel.name}</h3>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => onEditChannel(channel)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(channel)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4 col-span-3">
              No channels found in this category. Add your first channel or import an M3U playlist.
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!channelToDelete} onOpenChange={() => setChannelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the channel "{channelToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChannelToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!channelToMove} onOpenChange={() => setChannelToMove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Channel</DialogTitle>
            <DialogDescription>
              Select a category to move "{channelToMove?.name}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChannelToMove(null)}>
              Cancel
            </Button>
            <Button onClick={handleMoveChannel} disabled={!targetCategoryId}>
              Move Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChannelGrid;
