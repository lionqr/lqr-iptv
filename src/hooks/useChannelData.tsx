
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'>;
export type Channel = Tables<'channels'>;

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
      return data as Category[];
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
      return data as Channel[];
    },
  });

  return {
    categories,
    channels,
    isLoading: isLoadingCategories || isLoadingChannels,
  };
};
