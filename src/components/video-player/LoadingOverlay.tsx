
import { LoaderCircle } from 'lucide-react';

const LoadingOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
    <LoaderCircle className="w-16 h-16 text-blue-600 animate-spin" />
  </div>
);

export default LoadingOverlay;
