import React, { useState, useEffect } from 'react';
import { DeviceDetector } from '../utils/deviceDetection';

interface ImageConfig {
  mobile: string;
  tablet?: string;
  desktop: string;
  retina?: string;
  alt: string;
}

const IMAGE_MAP: Record<string, ImageConfig> = {
  'hero-1': {
    mobile: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&facepad=3',
    tablet: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    desktop: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    retina: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=90',
    alt: 'Determined entrepreneur planning business growth in Gaborone'
  },
  'hero-2': {
    mobile: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    tablet: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200',
    desktop: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=2000',
    retina: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=2400',
    alt: 'Physical discipline protocol visual'
  },
  'feature-1': {
    mobile: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desktop: 'https://images.unsplash.com/photo-1573164713714-d95e436ab284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    alt: 'Focused professional tracking fitness progress with intensity'
  },
  'feature-2': {
    mobile: 'https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desktop: 'https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    alt: 'Business owner analyzing financial charts with determination'
  },
  'feature-3': {
    mobile: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desktop: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    alt: 'Network of ambitious professionals collaborating'
  }
};

interface Props {
  imageKey: string;
  className?: string;
  detector: DeviceDetector;
}

export const ResponsiveImage: React.FC<Props> = ({ imageKey, className, detector }) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const config = IMAGE_MAP[imageKey] || IMAGE_MAP['hero-1'];
    const summary = detector.getSummary();
    
    let src = config.desktop;
    
    // Logic as per specification
    if (summary.isSlow && config.mobile) {
      src = config.mobile;
    } else if (summary.display.isRetina && summary.device === 'desktop' && config.retina) {
      src = config.retina;
    } else {
      switch(summary.device) {
        case 'mobile':
          src = config.mobile || config.tablet || config.desktop;
          break;
        case 'tablet':
          src = config.tablet || config.desktop || config.mobile;
          break;
        case 'desktop':
          src = config.desktop || config.tablet || config.mobile;
          break;
      }
    }

    setCurrentSrc(src);
  }, [imageKey, detector]);

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      <img
        src={currentSrc}
        alt={IMAGE_MAP[imageKey]?.alt || ''}
        data-processed="true"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover grayscale transition-opacity duration-700 ${isLoaded ? 'opacity-100 img-loaded' : 'opacity-0 img-loading'}`}
        loading="lazy"
        decoding="async"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-[10px] font-black uppercase opacity-40">
          IMAGE_LOAD_ERROR
        </div>
      )}
    </div>
  );
};