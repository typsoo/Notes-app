import * as THREE from "three";

export interface SphereBuffers {
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  originalPositions: Float32Array;
  velocities: Float32Array;
}

/**
 * Allocates flat Float32Array buffers and distributes particles uniformly
 * inside a 3D sphere using spherical coordinates.
 */
export function createSphereBuffers(
  count: number,
  sphereRadius: number,
): SphereBuffers {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  const originalPositions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;

    // Spherical coordinates:
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const rad = sphereRadius * Math.cbrt(Math.random());

    const x = rad * Math.sin(phi) * Math.cos(theta);
    const y = rad * Math.sin(phi) * Math.sin(theta);
    const z = rad * Math.cos(phi);

    originalPositions[idx] = x;
    originalPositions[idx + 1] = y;
    originalPositions[idx + 2] = z;

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return {
    geometry,
    positions,
    originalPositions,
    velocities,
  };
}
