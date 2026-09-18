import React, { useRef, useEffect } from 'react';

export const StarsBackground = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className = "",
}: {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      twinkleSpeed: number;
      isTwinkling: boolean;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * (maxTwinkleSpeed - minTwinkleSpeed) + minTwinkleSpeed;
        this.isTwinkling = allStarsTwinkle || Math.random() < twinkleProbability;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Match theme colors: White, Cyan (#0fbac6), Pink (#f72585)
        const colorFactor = Math.random();
        let color = [255, 255, 255]; // white
        if (colorFactor > 0.85) color = [15, 186, 198]; // --color-brand-cyan
        else if (colorFactor > 0.7) color = [247, 37, 133]; // --color-brand-pink

        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacity})`;
        ctx.fill();
        ctx.closePath();
      }

      update() {
        if (this.isTwinkling) {
          this.opacity -= this.twinkleSpeed * 0.02;
          if (this.opacity <= 0) {
            this.opacity = 1;
            this.x = Math.random() * width;
            this.y = Math.random() * height;
          }
        }
      }
    }

    let stars: Star[] = [];
    const generateStars = () => {
      const numStars = width * height * starDensity;
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
      }
    };
    generateStars();

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.update();
        star.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateStars();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]);

  return <canvas ref={canvasRef} className={`absolute inset-0 z-[-1] ${className}`} />;
};
