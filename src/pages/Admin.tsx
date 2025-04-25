
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

const Admin = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetType, setSheetType] = useState<'category' | 'channel'>('category');
  const [editingItem, setEditingItem] = useState<Category | Channel | null>(null);

  const categoryForm = useForm({
    defaultValues: {
      name: '',
    }
  });

  const channelForm = useForm({
    defaultValues: {
      name: '',
      logo: '',
      url: '',
      category_id: '',
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchChannelsByCategory(selectedCategory.id);
    } else {
      setChannels([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoading(true);
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
    setSelectedCategory(category);
  };

  const handleAddCategory = async (data: { name: string }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: data.name, order_index: categories.length }]);
      
      if (error) throw error;
      toast.success('Category added successfully');
      fetchCategories();
      categoryForm.reset();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleUpdateCategory = async (data: { name: string }) => {
    if (!editingItem) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: data.name })
        .eq('id', editingItem.id);
      
      if (error) throw error;
      toast.success('Category updated successfully');
      fetchCategories();
      categoryForm.reset();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete ${category.name}? All channels in this category will also be deleted.`)) {
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAddChannel = async (data: { name: string, logo: string, url: string }) => {
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
          category_id: selectedCategory.id,
          order_index: channels.length 
        }]);
      
      if (error) throw error;
      toast.success('Channel added successfully');
      fetchChannelsByCategory(selectedCategory.id);
      channelForm.reset();
    } catch (error) {
      console.error('Error adding channel:', error);
      toast.error('Failed to add channel');
    }
  };

  const handleUpdateChannel = async (data: { name: string, logo: string, url: string }) => {
    if (!editingItem || !selectedCategory) return;
    
    try {
      const { error } = await supabase
        .from('channels')
        .update({ 
          name: data.name,
          logo: data.logo,
          url: data.url
        })
        .eq('id', editingItem.id);
      
      if (error) throw error;
      toast.success('Channel updated successfully');
      fetchChannelsByCategory(selectedCategory.id);
      channelForm.reset();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating channel:', error);
      toast.error('Failed to update channel');
    }
  };

  const handleDeleteChannel = async (channel: Channel) => {
    if (!confirm(`Are you sure you want to delete ${channel.name}?`)) {
      return;
    }
    
    try {
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
      toast.error('Failed to delete channel');
    }
  };

  const openCategorySheet = (category?: Category) => {
    setSheetType('category');
    if (category) {
      setEditingItem(category);
      categoryForm.reset({ name: category.name });
    } else {
      setEditingItem(null);
      categoryForm.reset();
    }
  };

  const openChannelSheet = (channel?: Channel) => {
    setSheetType('channel');
    if (channel) {
      setEditingItem(channel);
      channelForm.reset({ 
        name: channel.name,
        logo: channel.logo || '',
        url: channel.url
      });
    } else {
      setEditingItem(null);
      channelForm.reset();
    }
  };

  return (
    <div className="min-h-screen bg-firetv-background text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80"
          >
            Back to App
          </button>
        </div>
        
        <div className="grid md:grid-cols-12 gap-6">
          {/* Categories Panel */}
          <div className="md:col-span-4 bg-firetv-dark rounded-lg p-6">
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
            
            <ScrollArea className="h-[500px]">
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
                        <span>{category.name}</span>
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
                    No categories found. Add your first category.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Channels Panel */}
          <div className="md:col-span-8 bg-firetv-dark rounded-lg p-6">
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
                    <form 
                      onSubmit={channelForm.handleSubmit(
                        editingItem ? handleUpdateChannel : handleAddChannel
                      )}
                      className="space-y-6 py-6"
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
                            <div className="flex gap-2">
                              <FormControl>
                                <input 
                                  type="text"
                                  className="flex-1 bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                  placeholder="Enter logo URL"
                                  {...field}
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="px-3 py-2 bg-gray-700 rounded-md"
                                onClick={() => {}}
                              >
                                <Upload size={16} />
                              </button>
                            </div>
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
                      <button 
                        type="submit"
                        className="w-full bg-firetv-accent py-2 rounded-md hover:bg-firetv-accent/80"
                      >
                        {editingItem ? 'Update Channel' : 'Add Channel'}
                      </button>
                    </form>
                  </SheetContent>
                </Sheet>
              )}
            </div>
            
            {!selectedCategory ? (
              <div className="text-center text-gray-400 p-12">
                Please select a category from the left panel to view its channels.
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
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
                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
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
                    <div className="col-span-full text-center text-gray-400 py-8">
                      No channels in this category. Add your first channel.
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
