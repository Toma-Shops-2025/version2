import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      {/* Main Image Display */}
      <div className={`relative ${className}`}>
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full rounded-lg cursor-pointer"
          crossOrigin="anonymous"
          onClick={openModal}
        />
        
        {/* Navigation Arrows (only show if multiple images) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${title} - Thumbnail ${index + 1}`}
              className={`h-16 w-16 object-cover rounded cursor-pointer border-2 ${
                index === currentIndex ? 'border-blue-500' : 'border-gray-600'
              }`}
              crossOrigin="anonymous"
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white z-10"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <img
              src={images[currentIndex]}
              alt={`${title} - Full Size ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              crossOrigin="anonymous"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery; 