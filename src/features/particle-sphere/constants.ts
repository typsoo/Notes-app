export interface CameraIntroConfig {
  startZ: number;
  endZ: number;
  duration: number;
  textRevealDelta: number;
}

export interface PhysicsConfig {
  attractionRadius: number;
  magnetForce: number;
  returnSpring: number;
  damping: number;
}

export const PARTICLE_COUNT = 7000;
export const SPHERE_RADIUS = 3;

export const CAMERA_INTRO: CameraIntroConfig = {
  startZ: 16,
  endZ: 3,
  duration: 3.5,
  textRevealDelta: 0.85,
};

export const PHYSICS_CONFIG: PhysicsConfig = {
  attractionRadius: 2.4, // Max distance where mouse affects particles
  magnetForce: 0.005, // Pull strength
  returnSpring: 0.0015, //  Strength of pulling back to home position
  damping: 0.92, // Velocity retention per frame
};
