
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { parseM3UFile, parseM3UFromURL } from '@/lib/m3u-utils';
import { Upload, FolderOpen } from 'lucide-react';
import { 
  Sheet,
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

interface M3UImportProps {
  onSuccess: () => void;
}

type ImportMethod = 'file' | 'url';

export default function M3UImport({ onSuccess }: M3UImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importMethod, setImportMethod] = useState<ImportMethod>('file');
  const [file, setFile] = useState<File | null>(null);
  
  const form = useForm({
    defaultValues: {
      playlistName: '',
      playlistUrl: '',
      isDefault: false,
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.m3u') && !selectedFile.name.endsWith('.m3u8')) {
        toast.error('Please select a valid M3U file (.m3u or .m3u8 extension)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async (data: { playlistName: string; playlistUrl: string; isDefault: boolean }) => {
    if (!data.playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (importMethod === 'file' && file) {
        result = await parseM3UFile(file, {
          name: data.playlistName,
          isDefault: data.isDefault
        });
      } else if (importMethod === 'url' && data.playlistUrl) {
        result = await parseM3UFromURL(data.playlistUrl, {
          name: data.playlistName,
          isDefault: data.isDefault
        });
      } else {
        toast.error(importMethod === 'file' ? 'Please select a file' : 'Please enter a URL');
        setIsLoading(false);
        return;
      }
      
      if (result.success) {
        toast.success(result.message);
        form.reset();
        setFile(null);
        setIsOpen(false);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during import');
      console.error('M3U import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80 text-white"
      >
        <Upload size={16} />
        <span>Import M3U</span>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="bg-firetv-dark border-l border-firetv-accent">
          <SheetHeader>
            <SheetTitle className="text-white">Import M3U Playlist</SheetTitle>
            <SheetDescription className="text-gray-400">
              Import channels from M3U file or URL
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-white text-sm">Playlist Name</label>
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                placeholder="Enter playlist name"
                {...form.register('playlistName')}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex space-x-3 pb-3">
                <button
                  type="button"
                  onClick={() => setImportMethod('file')}
                  className={`px-3 py-2 rounded-md ${
                    importMethod === 'file' ? 'bg-firetv-accent text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  From File
                </button>
                <button
                  type="button"
                  onClick={() => setImportMethod('url')}
                  className={`px-3 py-2 rounded-md ${
                    importMethod === 'url' ? 'bg-firetv-accent text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  From URL
                </button>
              </div>
              
              {importMethod === 'file' ? (
                <div className="space-y-2">
                  <label className="text-sm text-white">M3U File</label>
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full h-20 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors">
                        <div className="text-center">
                          <FolderOpen className="mx-auto h-6 w-6 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-400">
                            {file ? file.name : 'Select M3U file'}
                          </span>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept=".m3u,.m3u8" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-white text-sm">M3U URL</label>
                  <input
                    type="url"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="https://example.com/playlist.m3u"
                    {...form.register('playlistUrl')}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                className="rounded bg-gray-800 border-gray-700 text-firetv-accent"
                {...form.register('isDefault')}
              />
              <label htmlFor="isDefault" className="text-white text-sm">
                Set as default playlist (shown on home page)
              </label>
            </div>
          </div>
          
          <SheetFooter>
            <button
              onClick={form.handleSubmit(handleImport)}
              disabled={isLoading}
              className="w-full bg-firetv-accent py-2 rounded-md hover:bg-firetv-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Importing...' : 'Import Playlist'}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
