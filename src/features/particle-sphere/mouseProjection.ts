import * as THREE from "three";

const tempVec = new THREE.Vector3();

/**
 * Converts 2D browser cursor coordinates into a 3D point
 * on the Z = 0 plane.
 */
export function projectMouseToWorld(
  event: MouseEvent,
  container: HTMLElement,
  camera: THREE.Camera,
  targetWorldMouse: THREE.Vector3,
): void {
  const rect = container.getBoundingClientRect();

  const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Unproject 2D screen point into a 3D ray from the camera
  tempVec.set(nx, ny, 0.5).unproject(camera);
  const rayDir = tempVec.sub(camera.position).normalize();

  const distanceToZeroPlane = -camera.position.z / rayDir.z;

  targetWorldMouse
    .copy(camera.position)
    .add(rayDir.multiplyScalar(distanceToZeroPlane));
}

export function updateLocalMouse(
  targetWorldMouse: THREE.Vector3,
  smoothWorldMouse: THREE.Vector3,
  localMouse: THREE.Vector3,
  pointsMesh: THREE.Object3D,
): void {
  // Smoothly follow cursor to avoid harsh jumps
  smoothWorldMouse.lerp(targetWorldMouse, 0.06);

  // Convert world point into the rotating sphere's local space(because sphere is rotating, not the points)

  localMouse.copy(smoothWorldMouse);
  pointsMesh.worldToLocal(localMouse);
}
