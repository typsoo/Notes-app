import * as THREE from "three";

/**
 * Generates an in-memory radial gradient texture so THREE.Points render
 * as soft glowing orbs.
 */
export function createBokehTexture(size = 256): THREE.CanvasTexture {
  const half = size / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1)"); // Bright core
  grad.addColorStop(0.25, "rgba(160, 210, 255, 0.75)"); // Inner glow
  grad.addColorStop(0.6, "rgba(59, 130, 246, 0.2)"); // Soft outer halo
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)"); // Transparent edges

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}
