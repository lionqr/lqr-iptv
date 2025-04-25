
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useChannelData = () => {
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_default', true)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_default', true)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    categories,
    channels,
    isLoading: isLoadingCategories || isLoadingChannels,
  };
};
