import { useEffect, useRef } from "react";
import { seedParticles, stepParticles } from "./confetti.ts";
import { nextUnit } from "./shuffle.ts";
import { TrophyIcon } from "./icons.tsx";
import { fill, type Copy } from "./messages.ts";

export function WinnerBanner({ name, text, celebrate }: { name: string; text: Copy; celebrate: boolean }) {
  return (
    <section className="winner-banner" data-testid="winner" aria-live="polite">
      <TrophyIcon />
      <p className="eyebrow text-xs font-semibold uppercase text-steel">{text.winnerEyebrow}</p>
      <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{fill(text.winnerTitle, { name })}</h2>
      {celebrate ? <Confetti key={name} /> : null}
    </section>
  );
}

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let alive = true;
    let particles = seedParticles(80, window.innerWidth, nextUnit);
    const paint = () => {
      if (!alive) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      particles = stepParticles(particles, height);
      for (const particle of particles) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rot);
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size * 0.55);
        ctx.restore();
      }
      if (particles.length > 0) requestAnimationFrame(paint);
    };
    const frame = requestAnimationFrame(paint);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, []);
  return <canvas ref={ref} className="confetti-layer" aria-hidden="true" />;
}
