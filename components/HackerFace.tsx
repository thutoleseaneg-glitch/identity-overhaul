import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const HackerFace: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particles: THREE.Points[] = [];
    const originalPositions: THREE.Vector3[] = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    const mouse = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector2(0, 0);
    const scatterRadius = 50;
    let scatterStrength = 0;

    const colors = [
      new THREE.Color(0x00ff00),  // Bright green
      new THREE.Color(0x00cc00),  // Medium green
      new THREE.Color(0x009900),  // Dark green
      new THREE.Color(0x33ff33),  // Light green
      new THREE.Color(0x006600)   // Very dark green
    ];

    const createParticle = (x: number, y: number, z: number, color: THREE.Color) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([x, y, z]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const material = new THREE.PointsMaterial({
        color: color,
        size: 2,
        sizeAttenuation: true
      });
      
      const particle = new THREE.Points(geometry, material);
      (particle as any).userData = {
        originalX: x,
        originalY: y,
        originalZ: z,
        velocity: new THREE.Vector3(0, 0, 0)
      };
      
      particles.push(particle);
      originalPositions.push(new THREE.Vector3(x, y, z));
      particleGroup.add(particle);
    };

    // Create face shape
    for (let i = 0; i < 800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 60 + Math.random() * 10;
      const x = Math.cos(angle) * r * (0.8 + Math.random() * 0.4);
      const y = Math.sin(angle) * r;
      createParticle(x, y, (Math.random() - 0.5) * 20, colors[Math.floor(Math.random() * colors.length)]);
    }

    // Eyes
    const createEye = (ox: number, oy: number) => {
      for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 12 + Math.random() * 3;
        createParticle(ox + Math.cos(angle) * r, oy + Math.sin(angle) * r, 5, colors[3]);
      }
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 5 + Math.random() * 2;
        createParticle(ox + Math.cos(angle) * r, oy + Math.sin(angle) * r, 10, colors[0]);
      }
    };
    createEye(-35, 20);
    createEye(35, 20);

    // Mouth
    for (let t = 0; t < Math.PI; t += 0.05) {
      for (let i = 0; i < 3; i++) {
        const mx = Math.cos(t) * 30;
        const my = -15 + Math.sin(t) * 8 - 5;
        createParticle(mx + (Math.random() - 0.5) * 2, my + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 5, colors[1]);
      }
    }

    // Matrix background
    const matrixParticles: { mesh: THREE.Points; velocity: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array([(Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600, -200 + Math.random() * 100]);
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0x00ff00, size: 1.5, transparent: true, opacity: 0.2 });
      const p = new THREE.Points(geom, mat);
      matrixParticles.push({ mesh: p, velocity: Math.random() * 1.5 + 0.5 });
      scene.add(p);
    }

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      const dist = Math.sqrt(Math.pow(mouse.x * 100, 2) + Math.pow(mouse.y * 100, 2));
      scatterStrength = Math.max(0, 1 - dist / 150);
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      mouseTarget.x += (mouse.x - mouseTarget.x) * 0.1;
      mouseTarget.y += (mouse.y - mouseTarget.y) * 0.1;

      const vector = new THREE.Vector3(mouseTarget.x, mouseTarget.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const mouseWorld = camera.position.clone().add(dir.multiplyScalar(distance));

      particles.forEach((p, i) => {
        const originalPos = originalPositions[i];
        const userData = (p as any).userData;
        const distToMouse = p.position.distanceTo(mouseWorld);

        if (distToMouse < scatterRadius) {
          const force = (1 - distToMouse / scatterRadius) * scatterStrength;
          const repulsion = new THREE.Vector3().subVectors(p.position, mouseWorld).normalize();
          userData.velocity.add(repulsion.multiplyScalar(force * 5));
        }

        userData.velocity.multiplyScalar(0.92);
        p.position.add(userData.velocity);

        const returnForce = 0.08;
        p.position.x += (originalPos.x - p.position.x) * returnForce;
        p.position.y += (originalPos.y - p.position.y) * returnForce;
        p.position.z += (originalPos.z - p.position.z) * returnForce;
        
        p.geometry.attributes.position.needsUpdate = true;
      });

      matrixParticles.forEach(p => {
        p.mesh.position.y -= p.velocity;
        if (p.mesh.position.y < -300) {
          p.mesh.position.y = 300;
          p.mesh.position.x = (Math.random() - 0.5) * 600;
        }
        p.mesh.geometry.attributes.position.needsUpdate = true;
      });

      particleGroup.rotation.y += 0.002;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div id="hacker-face-container" ref={mountRef} />;
};
