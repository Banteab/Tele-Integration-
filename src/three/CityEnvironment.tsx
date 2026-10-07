import { useMemo } from 'react';

interface Building {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
}

function makeBuildings(seed: number, count: number): Building[] {
  // Deterministic pseudo-random layout (same skyline every load, no jitter between renders).
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const palette = ['#eef3f8', '#e3edf6', '#f2efe8', '#e8f0ea', '#f0e9e4'];
  const buildings: Building[] = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (6 + rand() * 7);
    const z = -4 - i * 3.2 - rand() * 1.5;
    const w = 2 + rand() * 2.2;
    const d = 2 + rand() * 2;
    const h = 2.2 + rand() * 4.5;
    buildings.push({ x, z, w, d, h, color: palette[i % palette.length] });
  }
  return buildings;
}

/** A deliberately simple, low-poly Addis Ababa street — just enough context for the bus to belong somewhere. */
export function CityEnvironment({ reduced = false }: { reduced?: boolean }) {
  const buildings = useMemo(() => makeBuildings(42, reduced ? 5 : 10), [reduced]);

  return (
    <group>
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[6, 36]} />
        <meshStandardMaterial color="#cfd6dd" roughness={0.95} />
      </mesh>
      {/* Lane marking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -4]}>
        <planeGeometry args={[0.08, 36]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Sidewalks */}
      {[1, -1].map((side) => (
        <mesh key={side} rotation={[-Math.PI / 2, 0, 0]} position={[side * 4.5, 0.01, -4]} receiveShadow>
          <planeGeometry args={[3, 36]} />
          <meshStandardMaterial color="#e5e1d8" roughness={0.95} />
        </mesh>
      ))}
      {/* Park strips behind the sidewalks */}
      {[1, -1].map((side) => (
        <mesh key={side} rotation={[-Math.PI / 2, 0, 0]} position={[side * 9, 0, -4]} receiveShadow>
          <planeGeometry args={[8, 36]} />
          <meshStandardMaterial color="#d9e6d6" roughness={1} />
        </mesh>
      ))}

      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
