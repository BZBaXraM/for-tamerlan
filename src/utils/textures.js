import * as THREE from "three";

// Generate procedural fabric canvas texture for the suit
export function createSuitTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Base camel/beige color
  ctx.fillStyle = "#bfa182";
  ctx.fillRect(0, 0, 512, 512);

  // Linen/wool fine weave texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const pattern = x % 4 === 0 || y % 4 === 0 ? 15 : -15;
      const noise = (Math.random() - 0.5) * 12;
      const delta = pattern + noise;

      data[idx] = Math.min(255, Math.max(0, data[idx] + delta));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + delta * 0.9));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + delta * 0.8));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// Generate trouser dark charcoal twill texture
export function createTrouserTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#232529";
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const diag = (x + y) % 3 === 0 ? 8 : -8;
      const noise = (Math.random() - 0.5) * 8;
      const delta = diag + noise;

      data[idx] = Math.min(255, Math.max(0, data[idx] + delta));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + delta));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + delta * 1.1));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

// Generate watch face texture
export function createWatchDialTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // White dial background
  ctx.fillStyle = "#f8f8f6";
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  // Outer gold rim
  ctx.strokeStyle = "#c5a059";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Hour markers
  ctx.fillStyle = "#1a1a1a";
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = 128 + Math.cos(angle) * 100;
    const y1 = 128 + Math.sin(angle) * 100;
    const x2 = 128 + Math.cos(angle) * 112;
    const y2 = 128 + Math.sin(angle) * 112;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = i % 3 === 0 ? 4 : 2;
    ctx.stroke();
  }

  // Hands (set to 10:10)
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(
    128 + Math.cos(-Math.PI * 0.6) * 55,
    128 + Math.sin(-Math.PI * 0.6) * 55,
  );
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(
    128 + Math.cos(-Math.PI * 0.25) * 80,
    128 + Math.sin(-Math.PI * 0.25) * 80,
  );
  ctx.stroke();

  // Center cap
  ctx.fillStyle = "#c5a059";
  ctx.beginPath();
  ctx.arc(128, 128, 5, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}
