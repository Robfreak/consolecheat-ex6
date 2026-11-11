export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  rot: number;
  spin: number;
};

const COLORS = ["#0070d1", "#7eb6ff", "#f6d27a", "#e07a2f", "#8fceab", "#f3f5f8"];

export function prefersReducedMotion(match: (query: string) => { matches: boolean } | null): boolean {
  return match("(prefers-reduced-motion: reduce)")?.matches === true;
}

export function seedParticles(count: number, width: number, random: () => number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: random() * width,
      y: -20 - random() * 80,
      vx: (random() - 0.5) * 2.4,
      vy: 1.4 + random() * 2.8,
      life: 1,
      size: 4 + random() * 6,
      color: COLORS[Math.floor(random() * COLORS.length)] ?? COLORS[0] ?? "#0070d1",
      rot: random() * Math.PI,
      spin: (random() - 0.5) * 0.2,
    });
  }
  return particles;
}

export function stepParticles(particles: readonly Particle[], height: number): Particle[] {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.04,
      rot: particle.rot + particle.spin,
      life: particle.life - 0.008,
    }))
    .filter((particle) => particle.life > 0 && particle.y < height + 40);
}
