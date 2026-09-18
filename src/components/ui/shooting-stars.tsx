import { motion } from 'motion/react';
import React, { useEffect, useState } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

export const ShootingStars = ({
  minSpeed = 15,
  maxSpeed = 35,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#0fbac6", // --color-brand-cyan
  trailColor = "#f72585", // --color-brand-pink
  starWidth = 10,
  starHeight = 2,
  className = "",
}: {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}) => {
  const [stars, setStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    const createStar = () => {
      // Shoot diagonally from top down
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * (window.innerHeight / 2); // Start mostly in top half
      // Angle based on x position to point inwards
      const angle = startX > window.innerWidth / 2 ? 135 + Math.random() * 30 : 15 + Math.random() * 30;
      
      const scale = 0.5 + Math.random() * 1;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const distance = Math.max(window.innerWidth, window.innerHeight) * 1.5;

      return { id: Date.now() + Math.random(), x: startX, y: startY, angle, scale, speed, distance };
    };

    const addStar = () => {
      setStars((prev) => [...prev, createStar()]);
      setTimeout(addStar, Math.random() * (maxDelay - minDelay) + minDelay);
    };

    const timeout = setTimeout(addStar, Math.random() * (maxDelay - minDelay) + minDelay);
    return () => clearTimeout(timeout);
  }, [minDelay, maxDelay, minSpeed, maxSpeed]);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {stars.map((star) => {
        const dx = star.distance * Math.cos((star.angle * Math.PI) / 180);
        const dy = star.distance * Math.sin((star.angle * Math.PI) / 180);

        return (
          <motion.div
            key={star.id}
            initial={{ x: star.x, y: star.y, opacity: 1, scale: star.scale }}
            animate={{
              x: star.x + dx,
              y: star.y + dy,
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: star.distance / (star.speed * 10),
              ease: "linear",
            }}
            onAnimationComplete={() => {
              setStars((prev) => prev.filter((s) => s.id !== star.id));
            }}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              width: starWidth * star.scale * 10,
              height: starHeight,
              transform: `rotate(${star.angle}deg)`,
            }}
          >
            {/* The tail trail */}
            <div
              className="w-full h-full rounded-[100%]"
              style={{
                background: `linear-gradient(90deg, transparent, ${trailColor}, ${starColor})`,
                boxShadow: `0 0 10px 2px ${trailColor}80`
              }}
            />
            {/* Glow point at the head */}
            <div 
              className="absolute right-0 rounded-full bg-white opacity-100"
              style={{
                width: starHeight * 2.5,
                height: starHeight * 2.5,
                boxShadow: `0 0 15px 4px ${starColor}`
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
