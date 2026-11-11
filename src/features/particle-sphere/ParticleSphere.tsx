"use client"; // Required in Next.js App Router for browser APIs (window, WebGL)

import { type ReactNode, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CAMERA_INTRO, PARTICLE_COUNT, SPHERE_RADIUS } from "./constants";
import { createBokehTexture } from "./createBokehTexture";
import { createSphereBuffers } from "./createSphereBuffers";
import { projectMouseToWorld, updateLocalMouse } from "./mouseProjection";
import { updateParticlesPhysics } from "./updateParticlesPhysics";

export interface ParticleSphereProps {
  children?: ReactNode;
}

export default function ParticleSphere({ children }: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTextVisible, setIsTextVisible] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = CAMERA_INTRO.startZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const { geometry, positions, originalPositions, velocities } =
      createSphereBuffers(PARTICLE_COUNT, SPHERE_RADIUS);

    const bokehTexture = createBokehTexture(256);
    const material = new THREE.PointsMaterial({
      size: 0.05,
      map: bokehTexture,
      color: "#3b82f6",
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let isMouseActive = false;
    let mouseInfluence = 0;
    const targetWorldMouse = new THREE.Vector3();
    const smoothWorldMouse = new THREE.Vector3();
    const localMouse = new THREE.Vector3();

    const handleMouseMove = (event: MouseEvent) => {
      projectMouseToWorld(event, container, camera, targetWorldMouse);

      if (!isMouseActive) {
        smoothWorldMouse.copy(targetWorldMouse);
        isMouseActive = true;
      }
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = (performance.now() - startTime) * 0.001;

      if (time < CAMERA_INTRO.duration) {
        const progress = time / CAMERA_INTRO.duration;
        const ease = 1 - Math.pow(1 - progress, 3);
        camera.position.z =
          CAMERA_INTRO.startZ +
          (CAMERA_INTRO.endZ - CAMERA_INTRO.startZ) * ease;
      } else {
        camera.position.z = CAMERA_INTRO.endZ;
      }

      // Reveal hero title once camera is close to its final position
      if (
        camera.position.z - CAMERA_INTRO.endZ <
        CAMERA_INTRO.textRevealDelta
      ) {
        setIsTextVisible(true);
      }

      points.rotation.x += 0.001;
      points.rotation.y += 0.001;
      points.updateMatrixWorld();

      const targetInfluence = isMouseActive ? 1.0 : 0.0;
      mouseInfluence += (targetInfluence - mouseInfluence) * 0.05;

      updateLocalMouse(targetWorldMouse, smoothWorldMouse, localMouse, points);

      updateParticlesPhysics({
        count: PARTICLE_COUNT,
        positions,
        originalPositions,
        velocities,
        localMouse,
        mouseInfluence,
        time,
      });

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      bokehTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-0"
      />

      <div
        className={`relative z-10 transition-all duration-3300 ease-out ${
          isTextVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-40 scale-95 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
