
import { supabase } from '@/integrations/supabase/client';

interface PlaylistInfo {
  name: string;
  isDefault: boolean;
}

interface ChannelInfo {
  name: string;
  logo: string | null;
  url: string;
  categoryName: string;
}

export async function parseM3UFile(file: File, playlistInfo: PlaylistInfo): Promise<{ success: boolean, message: string }> {
  try {
    const content = await readFileAsText(file);
    const { channels, categories } = parseM3UContent(content);
    
    if (channels.length === 0) {
      return { success: false, message: 'No valid channels found in the M3U file' };
    }
    
    // Save categories and channels to database
    await savePlaylistToDatabase(categories, channels, playlistInfo);
    return { 
      success: true, 
      message: `Successfully imported ${channels.length} channels in ${categories.size} categories` 
    };
  } catch (error) {
    console.error('Error parsing M3U file:', error);
    return { success: false, message: 'Failed to parse M3U file' };
  }
}

export async function parseM3UFromURL(url: string, playlistInfo: PlaylistInfo): Promise<{ success: boolean, message: string }> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U from URL: ${response.statusText}`);
    }
    
    const content = await response.text();
    const { channels, categories } = parseM3UContent(content);
    
    if (channels.length === 0) {
      return { success: false, message: 'No valid channels found in the M3U URL' };
    }
    
    // Save categories and channels to database
    await savePlaylistToDatabase(categories, channels, playlistInfo);
    return { 
      success: true, 
      message: `Successfully imported ${channels.length} channels in ${categories.size} categories from URL` 
    };
  } catch (error) {
    console.error('Error parsing M3U from URL:', error);
    return { success: false, message: `Failed to parse M3U from URL: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

function parseM3UContent(content: string): { channels: ChannelInfo[], categories: Set<string> } {
  const lines = content.split('\n');
  const channels: ChannelInfo[] = [];
  const categories = new Set<string>();
  
  // Check if this is a valid M3U file
  if (!lines[0].trim().startsWith('#EXTM3U')) {
    throw new Error('Not a valid M3U file');
  }
  
  let currentChannel: Partial<ChannelInfo> = {};
  let nextLineIsUrl = false;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      continue;
    }
    
    if (line.startsWith('#EXTINF:')) {
      // Parse the EXTINF line to get channel name and attributes
      currentChannel = {}; // Reset current channel
      nextLineIsUrl = true;
      
      const infoMatch = line.match(/#EXTINF:-?\d+\s+(.*)/);
      if (infoMatch) {
        // Extract channel name
        const channelInfo = infoMatch[1];
        const nameMatch = channelInfo.match(/,(.+)$/);
        if (nameMatch) {
          currentChannel.name = nameMatch[1].trim();
        }
        
        // Extract logo URL (tvg-logo attribute)
        const logoMatch = channelInfo.match(/tvg-logo="([^"]+)"/);
        if (logoMatch) {
          currentChannel.logo = logoMatch[1];
        }
        
        // Extract category/group (group-title attribute)
        const groupMatch = channelInfo.match(/group-title="([^"]+)"/);
        if (groupMatch) {
          const categoryName = groupMatch[1];
          currentChannel.categoryName = categoryName;
          categories.add(categoryName);
        } else {
          // Default category if none specified
          currentChannel.categoryName = 'Uncategorized';
          categories.add('Uncategorized');
        }
      }
    } else if (nextLineIsUrl && !line.startsWith('#')) {
      // This line should be the channel URL
      currentChannel.url = line;
      nextLineIsUrl = false;
      
      // Add the completed channel to our list
      if (currentChannel.name && currentChannel.url && currentChannel.categoryName) {
        channels.push({
          name: currentChannel.name,
          logo: currentChannel.logo || null,
          url: currentChannel.url,
          categoryName: currentChannel.categoryName
        });
      }
    }
  }
  
  return { channels, categories };
}

async function savePlaylistToDatabase(
  categories: Set<string>, 
  channels: ChannelInfo[],
  playlistInfo: PlaylistInfo
): Promise<void> {
  // Map to store category names to their IDs after creation
  const categoryMap = new Map<string, string>();
  
  // First, create all categories
  for (const categoryName of categories) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        is_default: playlistInfo.isDefault,
        is_visible: true // Make categories visible by default
      })
      .select('id')
      .single();
    
    if (categoryError) {
      console.error('Error creating category:', categoryError);
      continue;
    }
    
    categoryMap.set(categoryName, categoryData.id);
  }
  
  // Now create all channels with their category IDs
  for (const channel of channels) {
    const categoryId = categoryMap.get(channel.categoryName);
    if (!categoryId) continue;
    
    await supabase
      .from('channels')
      .insert({
        name: channel.name,
        logo: channel.logo,
        url: channel.url,
        category_id: categoryId,
        is_default: playlistInfo.isDefault,
        is_visible: true // Make channels visible by default
      });
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
