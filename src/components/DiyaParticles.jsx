import React, { useEffect, useRef } from 'react';

export default function DiyaParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const particleCount = 35;

    // Hot golden/saffron tones matching temple lights
    const colors = [
      'rgba(227, 95, 36, ',  // Saffron
      'rgba(243, 229, 171, ', // Light Gold
      'rgba(212, 175, 55, ',  // Gold
      'rgba(255, 130, 71, '   // Saffron Light
    ];

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Spread out initially
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 0.7 + 0.2); // Slow float up
        this.speedX = Math.random() * 0.4 - 0.2; // Gentle horizontal drift
        this.alpha = Math.random() * 0.5 + 0.15;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        this.swaySpeed = Math.random() * 0.015 + 0.005;
        this.swayRange = Math.random() * 2 + 0.5;
        this.time = Math.random() * 100;
      }

      update() {
        this.y += this.speedY;
        this.time += this.swaySpeed;
        this.x += this.speedX + Math.sin(this.time) * 0.1 * this.swayRange;

        // Fade out in the upper 25% of screen
        if (this.y < height * 0.25) {
          this.alpha -= 0.004;
        }

        // Reset if goes off screen or fades completely
        if (this.y < -10 || this.alpha <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        // Radial gradient for glowing flame particle representation
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
        gradient.addColorStop(0, `${this.colorBase}${this.alpha})`);
        gradient.addColorStop(0.5, `${this.colorBase}${this.alpha * 0.45})`);
        gradient.addColorStop(1, `${this.colorBase}0)`);
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      width = canvas.width = parent.offsetWidth;
      height = canvas.height = parent.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70"
    />
  );
}
