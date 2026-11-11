import type * as THREE from "three";
import { PHYSICS_CONFIG, type PhysicsConfig } from "./constants";

export interface UpdateParticlesPhysicsParams {
  count: number;
  positions: Float32Array;
  originalPositions: Float32Array;
  velocities: Float32Array;
  localMouse: THREE.Vector3;
  mouseInfluence: number;
  time: number;
  physics?: PhysicsConfig;
}

/**
 * Updates particle velocities and positions for a single animation frame
 * using Euler integration
 */
export function updateParticlesPhysics({
  count,
  positions,
  originalPositions,
  velocities,
  localMouse,
  mouseInfluence,
  time,
  physics = PHYSICS_CONFIG,
}: UpdateParticlesPhysicsParams): void {
  const { attractionRadius, magnetForce, returnSpring, damping } = physics;

  const currentForce = magnetForce * mouseInfluence;
  const radiusSq = attractionRadius * attractionRadius;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;

    // Breathing Home Target: oscillate around originalPositions using sin/cos
    const ox =
      originalPositions[idx] +
      Math.sin(time + originalPositions[idx + 1] * 1.5) * 0.06;
    const oy =
      originalPositions[idx + 1] +
      Math.cos(time + originalPositions[idx] * 1.5) * 0.06;
    const oz =
      originalPositions[idx + 2] +
      Math.sin(time + originalPositions[idx] * 1.5) * 0.15;

    // Mouse Magnet Force: pull particles within attractionRadius
    const dx = localMouse.x - positions[idx];
    const dy = localMouse.y - positions[idx + 1];
    const dz = localMouse.z - positions[idx + 2];
    const distSq = dx * dx + dy * dy + dz * dz;

    if (mouseInfluence > 0.001 && distSq < radiusSq) {
      const dist = Math.sqrt(distSq);
      const t = 1 - dist / attractionRadius;
      const smoothFactor = t * t * (3 - 2 * t);
      const force = smoothFactor * currentForce;

      velocities[idx] += dx * force;
      velocities[idx + 1] += dy * force;
      velocities[idx + 2] += dz * force;
    }

    // Pull particle back toward its home coordinates
    velocities[idx] += (ox - positions[idx]) * returnSpring;
    velocities[idx + 1] += (oy - positions[idx + 1]) * returnSpring;
    velocities[idx + 2] += (oz - positions[idx + 2]) * returnSpring;

    // Decay velocity per frame to prevent endless oscillation
    velocities[idx] *= damping;
    velocities[idx + 1] *= damping;
    velocities[idx + 2] *= damping;

    // Move particle by its updated velocity
    positions[idx] += velocities[idx];
    positions[idx + 1] += velocities[idx + 1];
    positions[idx + 2] += velocities[idx + 2];
  }
}
