"use client";

import { useEffect, useRef } from "react";

const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const confettiCount = 100;
    const confetti: { x: number; y: number; r: number; d: number; color: string }[] = [];

    // Генеруємо конфетті
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 6 + 4, 
        d: Math.random() * confettiCount,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      });
    }

    let animationFrameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();

        // Рух вниз
        c.y += Math.cos(c.d) + 2 + c.r / 2;
        c.x += Math.sin(c.d);

        // Перезапуск з верхнього краю
        if (c.y > canvas.height) {
          c.y = -10;
          c.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default Confetti;
