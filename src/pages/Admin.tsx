
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Category, Channel } from '@/hooks/useChannelData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Folder,
  FolderOpen, 
  Edit, 
  Trash, 
  Plus,
  Upload,
  Settings,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { playSoundEffect } from '@/lib/sound-utils';
import M3UImport from '@/components/M3UImport';
import { Switch } from '@/components/ui/switch';

const Admin = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetType, setSheetType] = useState<'category' | 'channel' | 'channelDetails' | 'playlist'>('category');
  const [editingItem, setEditingItem] = useState<Category | Channel | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [hasPlaylists, setHasPlaylists] = useState(false);

  const categoryForm = useForm({
    defaultValues: {
      name: '',
      is_visible: true,
    }
  });

  const channelForm = useForm({
    defaultValues: {
      name: '',
      logo: '',
      url: '',
      current_program: '',
      next_program: '',
      program_start_time: '',
      program_end_time: '',
      category_id: '',
      is_visible: true,
    }
  });

  const playlistForm = useForm({
    defaultValues: {
      name: '',
      is_default: false,
    }
  });

  useEffect(() => {
    fetchCategories();
    checkForPlaylists();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchChannelsByCategory(selectedCategory.id);
    } else {
      setChannels([]);
    }
  }, [selectedCategory]);

  const checkForPlaylists = async () => {
    try {
      const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setHasPlaylists(count !== null && count > 0);
    } catch (error) {
      console.error('Error checking for playlists:', error);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      setCategories(data || []);
      
      // Get last update time
      const lastUpdate = data && data.length > 0 
        ? new Date(Math.max(...data.map(c => new Date(c.last_updated || c.created_at).getTime())))
        : null;
      
      if (lastUpdate) {
        setLastUpdated(lastUpdate.toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelsByCategory = async (categoryId: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    playSoundEffect('select');
    setSelectedCategory(category);
  };

  const handleAddPlaylist = async (data: { name: string; is_default: boolean }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: data.name, 
          order_index: categories.length,
          last_updated: new Date().toISOString(),
          is_default: data.is_default
        }]);
      
      if (error) throw error;
      playSoundEffect('select');
      toast.success('Playlist created successfully');
      fetchCategories();
      setHasPlaylists(true);
      playlistForm.reset();
    } catch (error) {
      console.error('Error adding playlist:', error);
      playSoundEffect('error');
      toast.error('Failed to create playlist');
    }
  };

  const handleAddCategory = async (data: { name: string; is_visible: boolean }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: data.name, 
          order_index: categories.length,
          last_updated: new Date().toISOString(),
          is_visible: data.is_visible
        }]);
      
      if (error) throw error;
      playSoundEffect('select');
      toast.success('Category added successfully');
      fetchCategories();
      categoryForm.reset();
    } catch (error) {
      console.error('Error adding category:', error);
      playSoundEffect('error');
      toast.error('Failed to add category');
    }
  };

  const handleUpdateCategory = async (data: { name: string; is_visible: boolean }) => {
    if (!editingItem) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: data.name,
          last_updated: new Date().toISOString(),
          is_visible: data.is_visible
        })
        .eq('id', editingItem.id);
      
      if (error) throw error;
      playSoundEffect('select');
      toast.success('Category updated successfully');
      fetchCategories();
      categoryForm.reset();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating category:', error);
      playSoundEffect('error');
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete ${category.name}? All channels in this category will also be deleted.`)) {
      return;
    }
    
    try {
      playSoundEffect('back');
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);
      
      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchCategories();
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null);
      }
      checkForPlaylists();
    } catch (error) {
      console.error('Error deleting category:', error);
      playSoundEffect('error');
      toast.error('Failed to delete category');
    }
  };

  const handleAddChannel = async (data: { 
    name: string, 
    logo: string, 
    url: string,
    current_program?: string,
    next_program?: string,
    program_start_time?: string,
    program_end_time?: string,
    is_visible: boolean
  }) => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('channels')
        .insert([{ 
          name: data.name, 
          logo: data.logo, 
          url: data.url,
          current_program: data.current_program || null,
          next_program: data.next_program || null,
          program_start_time: data.program_start_time || null,
          program_end_time: data.program_end_time || null,
          category_id: selectedCategory.id,
          order_index: channels.length,
          last_updated: new Date().toISOString(),
          is_visible: data.is_visible
        }]);
      
      if (error) throw error;
      playSoundEffect('select');
      toast.success('Channel added successfully');
      fetchChannelsByCategory(selectedCategory.id);
      channelForm.reset();
    } catch (error) {
      console.error('Error adding channel:', error);
      playSoundEffect('error');
      toast.error('Failed to add channel');
    }
  };

  const handleUpdateChannel = async (data: { 
    name: string, 
    logo: string, 
    url: string,
    current_program?: string,
    next_program?: string,
    program_start_time?: string,
    program_end_time?: string,
    is_visible: boolean
  }) => {
    if (!editingItem || !selectedCategory) return;
    
    try {
      const { error } = await supabase
        .from('channels')
        .update({ 
          name: data.name,
          logo: data.logo,
          url: data.url,
          current_program: data.current_program || null,
          next_program: data.next_program || null,
          program_start_time: data.program_start_time || null,
          program_end_time: data.program_end_time || null,
          last_updated: new Date().toISOString(),
          is_visible: data.is_visible
        })
        .eq('id', editingItem.id);
      
      if (error) throw error;
      playSoundEffect('select');
      toast.success('Channel updated successfully');
      fetchChannelsByCategory(selectedCategory.id);
      channelForm.reset();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating channel:', error);
      playSoundEffect('error');
      toast.error('Failed to update channel');
    }
  };

  const handleDeleteChannel = async (channel: Channel) => {
    if (!confirm(`Are you sure you want to delete ${channel.name}?`)) {
      return;
    }
    
    try {
      playSoundEffect('back');
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channel.id);
      
      if (error) throw error;
      toast.success('Channel deleted successfully');
      if (selectedCategory) {
        fetchChannelsByCategory(selectedCategory.id);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      playSoundEffect('error');
      toast.error('Failed to delete channel');
    }
  };

  const openCategorySheet = (category?: Category) => {
    setSheetType('category');
    if (category) {
      setEditingItem(category);
      categoryForm.reset({ 
        name: category.name,
        is_visible: category.is_visible !== false
      });
    } else {
      setEditingItem(null);
      categoryForm.reset();
    }
    playSoundEffect('navigate');
  };

  const openChannelSheet = (channel?: Channel) => {
    setSheetType('channel');
    if (channel) {
      setEditingItem(channel);
      channelForm.reset({ 
        name: channel.name,
        logo: channel.logo || '',
        url: channel.url,
        current_program: channel.current_program || '',
        next_program: channel.next_program || '',
        program_start_time: channel.program_start_time || '',
        program_end_time: channel.program_end_time || '',
        is_visible: channel.is_visible !== false
      });
    } else {
      setEditingItem(null);
      channelForm.reset({
        name: '',
        logo: '',
        url: '',
        current_program: '',
        next_program: '',
        program_start_time: '',
        program_end_time: '',
        is_visible: true
      });
    }
    playSoundEffect('navigate');
  };

  const openPlaylistSheet = () => {
    setSheetType('playlist');
    playlistForm.reset({
      name: '',
      is_default: false
    });
    playSoundEffect('navigate');
  };

  const openChannelDetails = (channel: Channel) => {
    setSheetType('channelDetails');
    setEditingItem(channel);
    playSoundEffect('navigate');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    playSoundEffect('select');
    
    try {
      // Update last_updated timestamp for all categories
      await supabase
        .from('categories')
        .update({ last_updated: new Date().toISOString() })
        .gt('id', 0);
        
      // Update last_updated timestamp for all channels
      await supabase
        .from('channels')
        .update({ last_updated: new Date().toISOString() })
        .gt('id', 0);
      
      toast.success('Data refreshed successfully');
      fetchCategories();
      if (selectedCategory) {
        fetchChannelsByCategory(selectedCategory.id);
      }
      
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error refreshing data:', error);
      playSoundEffect('error');
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleM3UImportSuccess = () => {
    fetchCategories();
    toast.success('M3U playlist imported successfully');
    playSoundEffect('select');
    checkForPlaylists();
  };

  return (
    <div className="min-h-screen bg-firetv-background text-white p-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            {hasPlaylists ? (
              <M3UImport onSuccess={handleM3UImportSuccess} />
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <button 
                    onClick={openPlaylistSheet}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500"
                    title="Create playlist first"
                  >
                    <Upload size={16} />
                    <span>Create Playlist First</span>
                  </button>
                </SheetTrigger>
                <SheetContent className="bg-firetv-dark border-l border-firetv-accent">
                  <SheetHeader>
                    <SheetTitle className="text-white">Create New Playlist</SheetTitle>
                    <SheetDescription className="text-gray-400">
                      Create a playlist before importing M3U files
                    </SheetDescription>
                  </SheetHeader>
                  <form 
                    onSubmit={playlistForm.handleSubmit(handleAddPlaylist)}
                    className="space-y-6 py-6"
                  >
                    <FormField
                      control={playlistForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Playlist Name</FormLabel>
                          <FormControl>
                            <input 
                              type="text"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                              placeholder="Enter playlist name"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={playlistForm.control}
                      name="is_default"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-white">
                              Set as Default Playlist
                            </FormLabel>
                            <div className="text-sm text-gray-400">
                              The default playlist will be shown on the main page
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <button 
                      type="submit"
                      className="w-full bg-firetv-accent py-2 rounded-md hover:bg-firetv-accent/80"
                    >
                      Create Playlist
                    </button>
                  </form>
                </SheetContent>
              </Sheet>
            )}
            
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80"
            >
              Back to App
            </button>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="mb-4 text-sm text-gray-400">
            Last updated: {lastUpdated}
          </div>
        )}
        
        <div className="grid md:grid-cols-12 gap-6 h-[calc(100vh-180px)] overflow-hidden">
          {/* Categories Panel */}
          <div className="md:col-span-4 bg-firetv-dark rounded-lg p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Categories</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <button 
                    onClick={() => openCategorySheet()}
                    className="p-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80"
                  >
                    <Plus size={18} />
                  </button>
                </SheetTrigger>
                <SheetContent className="bg-firetv-dark border-l border-firetv-accent">
                  <SheetHeader>
                    <SheetTitle className="text-white">
                      {editingItem ? 'Edit Category' : 'Add Category'}
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                      {editingItem 
                        ? 'Update the category details below' 
                        : 'Fill in the details for the new category'}
                    </SheetDescription>
                  </SheetHeader>
                  <form 
                    onSubmit={categoryForm.handleSubmit(
                      editingItem ? handleUpdateCategory : handleAddCategory
                    )}
                    className="space-y-6 py-6"
                  >
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Category Name</FormLabel>
                          <FormControl>
                            <input 
                              type="text"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                              placeholder="Enter category name"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={categoryForm.control}
                      name="is_visible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-white">
                              Visible
                            </FormLabel>
                            <div className="text-sm text-gray-400">
                              Show this category in the main app
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <button 
                      type="submit"
                      className="w-full bg-firetv-accent py-2 rounded-md hover:bg-firetv-accent/80"
                    >
                      {editingItem ? 'Update Category' : 'Add Category'}
                    </button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700/30 rounded-md animate-pulse"></div>
                  ))
                ) : categories.length > 0 ? (
                  categories.map(category => (
                    <div 
                      key={category.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                        selectedCategory?.id === category.id 
                          ? 'bg-firetv-accent' 
                          : 'hover:bg-gray-700/30'
                      }`}
                    >
                      <div 
                        className="flex items-center space-x-2 flex-1"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {selectedCategory?.id === category.id ? 
                          <FolderOpen size={18} /> : <Folder size={18} />}
                        <span className="truncate">{category.name}</span>
                        {category.is_default && (
                          <span className="text-xs bg-green-700 px-2 py-1 rounded-full">Default</span>
                        )}
                        {category.is_visible === false && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">Hidden</span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openCategorySheet(category)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No categories found. Add your first category or import an M3U playlist.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Channels Panel */}
          <div className="md:col-span-8 bg-firetv-dark rounded-lg p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">
                {selectedCategory ? `Channels in ${selectedCategory.name}` : 'Select a Category'}
              </h2>
              {selectedCategory && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button 
                      onClick={() => openChannelSheet()}
                      className="p-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80"
                    >
                      <Plus size={18} />
                    </button>
                  </SheetTrigger>
                  <SheetContent className="bg-firetv-dark border-l border-firetv-accent">
                    <SheetHeader>
                      <SheetTitle className="text-white">
                        {editingItem ? 'Edit Channel' : 'Add Channel'}
                      </SheetTitle>
                      <SheetDescription className="text-gray-400">
                        {editingItem 
                          ? 'Update the channel details below' 
                          : 'Fill in the details for the new channel'}
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <form 
                        onSubmit={channelForm.handleSubmit(
                          editingItem ? handleUpdateChannel : handleAddChannel
                        )}
                        className="space-y-6 py-6 pr-4"
                      >
                        <FormField
                          control={channelForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Channel Name</FormLabel>
                              <FormControl>
                                <input 
                                  type="text"
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                  placeholder="Enter channel name"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={channelForm.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Logo URL</FormLabel>
                              <FormControl>
                                <input 
                                  type="text"
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                  placeholder="Enter logo URL"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={channelForm.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Stream URL</FormLabel>
                              <FormControl>
                                <input 
                                  type="text"
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                  placeholder="Enter stream URL"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={channelForm.control}
                          name="is_visible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-white">
                                  Visible
                                </FormLabel>
                                <div className="text-sm text-gray-400">
                                  Show this channel in the main app
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          <h3 className="text-white text-lg mb-4">EPG Information (Optional)</h3>
                          
                          <FormField
                            control={channelForm.control}
                            name="current_program"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Current Program</FormLabel>
                                <FormControl>
                                  <input 
                                    type="text"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                    placeholder="Current program name"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={channelForm.control}
                              name="program_start_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Start Time</FormLabel>
                                  <FormControl>
                                    <input 
                                      type="text"
                                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                      placeholder="e.g. 20:00"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={channelForm.control}
                              name="program_end_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">End Time</FormLabel>
                                  <FormControl>
                                    <input 
                                      type="text"
                                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                      placeholder="e.g. 21:00"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={channelForm.control}
                            name="next_program"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel className="text-white">Next Program</FormLabel>
                                <FormControl>
                                  <input 
                                    type="text"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                    placeholder="Next program name"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <button 
                          type="submit"
                          className="w-full bg-firetv-accent py-2 rounded-md hover:bg-firetv-accent/80"
                        >
                          {editingItem ? 'Update Channel' : 'Add Channel'}
                        </button>
                      </form>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              )}
            </div>
            
            {!selectedCategory ? (
              <div className="text-center text-gray-400 p-12 flex-1 flex items-center justify-center">
                Please select a category from the left panel to view its channels.
              </div>
            ) : (
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
                          
                          <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => openChannelDetails(channel)}
                              className="p-2 bg-firetv-accent rounded-full hover:bg-firetv-accent/80"
                            >
                              <Settings size={20} />
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
                              onClick={() => openChannelSheet(channel)}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteChannel(channel)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
