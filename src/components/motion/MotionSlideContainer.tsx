import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlideAnimationConfig } from '../../types';

interface MotionSlideContainerProps {
  slideKey: string | number;
  animation: SlideAnimationConfig;
  children: React.ReactNode;
  className?: string;
}

export const MotionSlideContainer: React.FC<MotionSlideContainerProps> = ({
  slideKey,
  animation,
  children,
  className = ''
}) => {
  const getVariants = () => {
    switch (animation.transition) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 80, filter: 'blur(4px)' },
          animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, x: -80, filter: 'blur(4px)' }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.85, filter: 'blur(6px)' },
          animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 1.1, filter: 'blur(6px)' }
        };
      case 'kinetic':
        return {
          initial: { opacity: 0, y: 50, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -40, scale: 0.95 }
        };
      case 'spring':
        return {
          initial: { opacity: 0, scale: 0.7, y: 30 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.9, y: -30 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slideKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration: animation.duration || 0.6,
          ease: [0.16, 1, 0.3, 1] // Apple/Remotion-style smooth ease
        }}
        className={`w-full h-full relative overflow-hidden flex flex-col ${className}`}
      >
        {/* Background Visual Effects (Mesh / Particles / Grid) */}
        {animation.backgroundEffect === 'particles' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        )}
        {animation.backgroundEffect === 'grid' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
          />
        )}
        {animation.backgroundEffect === 'pulse' && (
          <div className="absolute inset-0 pointer-events-none bg-radial from-indigo-500/10 via-transparent to-transparent opacity-60" />
        )}

        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
