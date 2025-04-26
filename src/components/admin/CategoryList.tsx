
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, FolderOpen, Edit, Trash } from 'lucide-react';
import { Category } from '@/hooks/useChannelData';
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
import { toast } from 'sonner';
import { playSoundEffect } from '@/lib/sound-utils';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  loading: boolean;
}

const CategoryList = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onEditCategory,
  onDeleteCategory,
  loading
}: CategoryListProps) => {
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);

  const handleDeleteClick = (category: Category) => {
    playSoundEffect('back');
    setCategoryToDelete(category);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
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
                  onClick={() => onCategorySelect(category)}
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
                    onClick={() => onEditCategory(category)}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
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

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{categoryToDelete?.name}" and all its channels.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryList;
