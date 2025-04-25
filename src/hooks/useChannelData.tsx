
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'>;
export type Channel = Tables<'channels'>;

export const useChannelData = () => {
  const { 
    data: categories, 
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_default', true)
        .order('order_index');
      
      if (error) throw error;
      return data as Category[];
    },
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch every 24 hours
  });

  const { 
    data: channels, 
    isLoading: isLoadingChannels,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_default', true)
        .order('order_index');
      
      if (error) throw error;
      return data as Channel[];
    },
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch every 24 hours
  });

  // Function to manually refetch both categories and channels
  const refetch = async () => {
    await Promise.all([
      refetchCategories(),
      refetchChannels()
    ]);
  };

  return {
    categories,
    channels,
    isLoading: isLoadingCategories || isLoadingChannels,
    refetch
  };
};
