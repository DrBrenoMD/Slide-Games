import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveReaction } from '../../types';

interface LiveReactionsOverlayProps {
  reactions: LiveReaction[];
}

interface FloatingParticle extends LiveReaction {
  drift: number;
}

export const LiveReactionsOverlay: React.FC<LiveReactionsOverlayProps> = ({ reactions }) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  useEffect(() => {
    if (!reactions || reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];
    if (!latest) return;

    const newParticle: FloatingParticle = {
      ...latest,
      drift: (Math.random() - 0.5) * 60
    };

    setParticles((prev) => [...prev.slice(-25), newParticle]);

    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 2500);

    return () => clearTimeout(timer);
  }, [reactions]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 0,
              y: '100vh',
              x: `${p.x}%`,
              scale: 0.5
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: '-10vh',
              x: `calc(${p.x}% + ${p.drift}px)`,
              scale: [0.5, 1.4, 1.2, 0.8],
              rotate: [0, p.drift * 0.5]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.2,
              ease: 'easeOut'
            }}
            className="absolute text-4xl select-none filter drop-shadow-md"
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
