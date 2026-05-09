<template>
  <div id="homePage">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

type NullableNumber = number | null;

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  friction: number;
  ease: number;

  constructor(x: number, y: number, isTextParticle: boolean, colors: string[]) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.size = isTextParticle ? 2 : Math.random() * 1.5 + 0.5;
    this.color = isTextParticle
      ? colors[Math.floor(Math.random() * colors.length)]
      : "#64b5f6";
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.95;
    this.ease = 0.08;
  }

  update(mouseX: NullableNumber, mouseY: NullableNumber, mouseRadius: number) {
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouseRadius) {
        const force = (mouseRadius - distance) / mouseRadius;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 3;
        this.vy += Math.sin(angle) * force * 3;
      }
    }

    this.vx += (this.originX - this.x) * this.ease;
    this.vy += (this.originY - this.y) * this.ease;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const textParticles: Particle[] = [];
const bgParticles: Particle[] = [];
const particleColors = ["#1e88e5", "#64b5f6", "#42a5f5"];
const textColor = "#1e88e5";
const text = "Welcome to\nuser center!";
const mouse = {
  x: null as NullableNumber,
  y: null as NullableNumber,
  radius: 120,
};

let width = 0;
let height = 0;
let fontSize = 0;
let frameId = 0;

const createTextParticles = (ctx: CanvasRenderingContext2D) => {
  textParticles.length = 0;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = text.split("\n");
  const lineHeight = fontSize * 1.4;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const index = (y * width + x) * 4;
      if (data[index + 3] > 128) {
        textParticles.push(new Particle(x, y, true, particleColors));
      }
    }
  }
};

const createBgParticles = () => {
  bgParticles.length = 0;
  for (let i = 0; i < 800; i += 1) {
    bgParticles.push(
      new Particle(
        Math.random() * width,
        Math.random() * height,
        false,
        particleColors
      )
    );
  }
};

const resize = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;
  fontSize = Math.min(width * 0.06, 70);
  createTextParticles(ctx);
  createBgParticles();
};

const animate = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(0, 0, width, height);
  [...bgParticles, ...textParticles].forEach((particle) => {
    particle.update(mouse.x, mouse.y, mouse.radius);
    particle.draw(ctx);
  });
  frameId = window.requestAnimationFrame(() => animate(ctx));
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const handleMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };

  const handleMouseOut = () => {
    mouse.x = null;
    mouse.y = null;
  };

  const handleResize = () => {
    resize(canvas, ctx);
  };

  resize(canvas, ctx);
  animate(ctx);

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseout", handleMouseOut);
  window.addEventListener("resize", handleResize);

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseout", handleMouseOut);
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<style scoped>
#homePage {
  width: 100%;
  height: calc(100vh - 80px);
  overflow: hidden;
  background: #fff;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
