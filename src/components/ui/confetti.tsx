import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const colors = ["#e53e3e", "#f56565", "#fc8181", "#feb2b2"];

export const LikeConfetti = ({ isActive }: { isActive: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -50 - 25,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: particle.color }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1],
            times: [0, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}; 