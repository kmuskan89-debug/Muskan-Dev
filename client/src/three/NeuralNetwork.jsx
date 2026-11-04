import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function NeuralNetwork({ count = 120, isMobile = false }) {
  const groupRef = useRef();
  const coreRef = useRef();
  const innerCoreRef = useRef();
  const linesMeshRef = useRef();

  // Generate node positions in a sphere
  const [nodes, linePositions] = useMemo(() => {
    const nodeCount = isMobile ? Math.min(count, 50) : count;
    const pts = [];
    const radius = 3.6;

    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius + 0.8;

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }

    // Connect nearby nodes
    const lines = [];
    const maxDistance = isMobile ? 1.4 : 1.6;

    for (let i = 0; i < pts.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < pts.length; j++) {
        if (connections >= 4) break; // clamp connections per node for visual clarity & performance
        const dist = pts[i].distanceTo(pts[j]);
        if (dist < maxDistance) {
          lines.push(pts[i].x, pts[i].y, pts[i].z);
          lines.push(pts[j].x, pts[j].y, pts[j].z);
          connections++;
        }
      }
    }

    return [pts, new Float32Array(lines)];
  }, [count, isMobile]);

  // Points geometry attribute
  const pointsPositionArray = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((pt, i) => {
      arr[i * 3] = pt.x;
      arr[i * 3 + 1] = pt.y;
      arr[i * 3 + 2] = pt.z;
    });
    return arr;
  }, [nodes]);

  // Frame animation & mouse parallax
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Slow ambient rotation
    groupRef.current.rotation.y += delta * 0.12;
    groupRef.current.rotation.x += delta * 0.05;

    // Counter-rotation of core
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.2;
      coreRef.current.rotation.z += delta * 0.15;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x += delta * 0.25;
    }

    // Smooth mouse parallax tilt (lerping)
    const targetRotX = -state.pointer.y * 0.35;
    const targetRotY = state.pointer.x * 0.45;

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      state.pointer.x * 0.5,
      3,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      state.pointer.y * 0.4,
      3,
      delta
    );
  });

  return (
    <group ref={groupRef}>
      {/* 1. Rotating Wireframe Icosahedron Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#4DA3FF"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner glowing core for depth */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial
          color="#5EEAD4"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Center glowing focal point */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#5EEAD4" transparent opacity={0.8} />
      </mesh>

      {/* 2. Neural Nodes (Points) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointsPositionArray, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.08 : 0.09}
          color="#5EEAD4"
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* 3. Interconnecting Synapse Lines */}
      {linePositions.length > 0 && (
        <lineSegments ref={linesMeshRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#4DA3FF"
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  );
}

