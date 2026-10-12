import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { THEME } from '../config/theme';
import type { SeatData } from '../hooks/useSeatLayout';
import { isSelectableSeat, isUnavailableSeat } from '../hooks/useSeatLayout';

/**
 * One shared geometric vocabulary for the whole bus — exterior shell and
 * interior cabin are sized against the same BUS_LENGTH/BUS_WIDTH/BUS_HEIGHT
 * constants so the camera can pass from outside to inside without the
 * two halves ever looking like different objects. Swapping this file for
 * a real GLB later only means replacing these two components; every
 * camera pose in Experience3D is keyed to world-space positions, not to
 * this geometry.
 */
export const BUS_LENGTH = 9;
export const BUS_WIDTH = 2.3;
export const BUS_HEIGHT = 2.4;
export const BUS_FRONT_Z = BUS_LENGTH / 2;
export const BUS_REAR_Z = -BUS_LENGTH / 2;

const bodyColor = new THREE.Color('#ffffff');
const stripeColor = new THREE.Color(THEME.brand);
const glassColor = new THREE.Color('#5fa8d3');
const darkTrim = new THREE.Color('#1f2937');

const WHEEL_RADIUS = 0.42;

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, WHEEL_RADIUS, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.3, 20]} />
      <meshStandardMaterial color="#111318" roughness={0.9} />
    </mesh>
  );
}

interface BusExteriorProps {
  idle?: boolean;
  /** True once the camera is inside the cabin — skips exterior-only details (wheels) that would otherwise poke through the interior floor. */
  interiorView?: boolean;
}

/** The painted shell, glass band, doors, wheels and lights — visible from outside the bus at every scene. */
export function BusExterior({ idle = true, interiorView = false }: BusExteriorProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!idle || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.9) * 0.025;
    group.current.rotation.z = Math.sin(t * 0.6) * 0.004;
  });

  return (
    <group ref={group}>
      {/* Main body shell */}
      <mesh position={[0, BUS_HEIGHT / 2 + 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[BUS_WIDTH, BUS_HEIGHT, BUS_LENGTH]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Rounded roof ridge — a subtle bump, not a second body: small radius, mostly embedded */}
      <mesh position={[0, BUS_HEIGHT + 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, BUS_LENGTH - 0.4, 20, 1, false]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Dark skirt — sits directly above the wheel tops, grounding the silhouette */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[(side * BUS_WIDTH) / 2 + side * 0.012, 0.92, 0]}>
          <boxGeometry args={[0.018, 0.16, BUS_LENGTH - 0.3]} />
          <meshStandardMaterial color={darkTrim} roughness={0.7} />
        </mesh>
      ))}

      {/* Brand stripe along both sides */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[(side * BUS_WIDTH) / 2 + side * 0.014, 1.15, 0]}>
          <boxGeometry args={[0.022, 0.3, BUS_LENGTH - 0.6]} />
          <meshStandardMaterial color={stripeColor} roughness={0.35} />
        </mesh>
      ))}

      {/* Window band, both sides — the clearest read-at-a-glance cue that this is a bus */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[(side * BUS_WIDTH) / 2 + side * 0.016, 1.85, 0]}>
          <boxGeometry args={[0.016, 0.9, BUS_LENGTH - 1.2]} />
          <meshStandardMaterial color={glassColor} roughness={0.2} metalness={0.15} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Windshield */}
      <mesh position={[0, 1.7, BUS_FRONT_Z - 0.02]}>
        <boxGeometry args={[BUS_WIDTH - 0.3, 1.0, 0.02]} />
        <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.25} transparent opacity={0.8} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 1.7, BUS_REAR_Z + 0.02]}>
        <boxGeometry args={[BUS_WIDTH - 0.5, 0.8, 0.02]} />
        <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.25} transparent opacity={0.8} />
      </mesh>

      {/* Door (right side, curb side for Ethiopia's right-hand traffic) — set well clear of the front wheel arch */}
      <mesh position={[BUS_WIDTH / 2 + 0.015, 0.95, BUS_FRONT_Z - 2.5]}>
        <boxGeometry args={[0.015, 1.3, 0.72]} />
        <meshStandardMaterial color={darkTrim} roughness={0.6} />
      </mesh>

      {/* Headlights */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[(side * (BUS_WIDTH - 0.35)) / 2, 0.55, BUS_FRONT_Z - 0.02]}>
          <boxGeometry args={[0.25, 0.14, 0.05]} />
          <meshStandardMaterial color="#fff6d8" emissive="#ffd877" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* Taillights */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[(side * (BUS_WIDTH - 0.35)) / 2, 0.55, BUS_REAR_Z + 0.02]}>
          <boxGeometry args={[0.2, 0.12, 0.04]} />
          <meshStandardMaterial color="#c0392b" emissive="#c0392b" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Wheels — only from outside; they'd otherwise poke through the cabin floor */}
      {!interiorView && (
        <>
          <Wheel x={BUS_WIDTH / 2 + 0.05} z={BUS_FRONT_Z - 1.3} />
          <Wheel x={-BUS_WIDTH / 2 - 0.05} z={BUS_FRONT_Z - 1.3} />
          <Wheel x={BUS_WIDTH / 2 + 0.05} z={BUS_REAR_Z + 1.3} />
          <Wheel x={-BUS_WIDTH / 2 - 0.05} z={BUS_REAR_Z + 1.3} />
        </>
      )}

      {/* Bumpers */}
      <mesh position={[0, 0.25, BUS_FRONT_Z + 0.03]}>
        <boxGeometry args={[BUS_WIDTH + 0.06, 0.2, 0.08]} />
        <meshStandardMaterial color={darkTrim} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, BUS_REAR_Z - 0.03]}>
        <boxGeometry args={[BUS_WIDTH + 0.06, 0.2, 0.08]} />
        <meshStandardMaterial color={darkTrim} roughness={0.7} />
      </mesh>
    </group>
  );
}

const SEAT_W = 0.42;
const SEAT_GAP_X = 0.48;
const SEAT_GAP_Y = 0.52;
const AISLE_GAP = 0.3;

interface SeatMeshProps {
  seat: SeatData;
  position: [number, number, number];
  selected: boolean;
  onSelect: (name: string) => void;
}

/** A single interactive cabin seat: cushion + backrest, rising and glowing when selected. */
function SeatMesh({ seat, position, selected, onSelect }: SeatMeshProps) {
  const group = useRef<THREE.Group>(null);
  const unavailable = isUnavailableSeat(seat.type);
  const targetY = useRef(position[1]);
  targetY.current = position[1] + (selected ? 0.1 : 0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const damp = 1 - Math.exp(-10 * delta);
    group.current.position.y += (targetY.current - group.current.position.y) * damp;
  });

  const color = unavailable ? '#c7cdd6' : selected ? THEME.primary : THEME.brandSoft;
  const backColor = unavailable ? '#b7bdc7' : selected ? THEME.primaryHover : THEME.brandSurface;

  return (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (!unavailable) onSelect(seat.name);
      }}
      onPointerOver={(e) => {
        if (!unavailable) document.body.style.cursor = 'pointer';
        e.stopPropagation();
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Cushion */}
      <mesh position={[0, 0.22, 0.08]} castShadow>
        <boxGeometry args={[SEAT_W, 0.14, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} emissive={selected ? THEME.primary : '#000000'} emissiveIntensity={selected ? 0.18 : 0} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.48, -0.14]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[SEAT_W, 0.52, 0.1]} />
        <meshStandardMaterial color={backColor} roughness={0.7} />
      </mesh>
      {/* Headrest */}
      <mesh position={[0, 0.78, -0.22]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[SEAT_W * 0.9, 0.16, 0.08]} />
        <meshStandardMaterial color={backColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

interface BusInteriorProps {
  seats: SeatData[];
  maxX: number;
  maxY: number;
  selectedSeats: string[];
  onSeatSelect: (name: string) => void;
}

/** Floor, driver area and the real seat grid — this is the data-driven 3D seat map, not decoration. */
export function BusInterior({ seats, maxX, maxY, selectedSeats, onSeatSelect }: BusInteriorProps) {
  const floorZ = BUS_FRONT_Z - 1.6;

  const positions = useMemo(() => {
    const colSpan = (maxX - 1) * SEAT_GAP_X + AISLE_GAP;
    const startX = -colSpan / 2;
    const aisleCol = Math.floor(maxX / 2);
    return seats
      // Only real seats get a mesh — aisle/staircase/driver-seat cells stay open floor,
      // exactly like the 2D grid's getSeatStyle() returning 'hidden' for those types.
      .filter((seat) => isSelectableSeat(seat.type) || isUnavailableSeat(seat.type))
      .map((seat) => {
        const colOffset = seat.x > aisleCol ? AISLE_GAP : 0;
        const x = startX + (seat.x - 1) * SEAT_GAP_X + colOffset;
        const z = floorZ - (seat.y - 1) * SEAT_GAP_Y;
        return { seat, position: [x, 0.08, z] as [number, number, number] };
      });
  }, [seats, maxX, floorZ]);

  const floorLength = (maxY + 1) * SEAT_GAP_Y;

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0.02, floorZ - floorLength / 2 + SEAT_GAP_Y]} receiveShadow>
        <boxGeometry args={[BUS_WIDTH - 0.08, 0.04, floorLength]} />
        <meshStandardMaterial color="#e9edf2" roughness={0.9} />
      </mesh>

      {/* Driver dashboard + steering wheel (left side, Ethiopia drives right) */}
      <mesh position={[-0.65, 0.55, BUS_FRONT_Z - 0.55]}>
        <boxGeometry args={[0.55, 0.5, 0.35]} />
        <meshStandardMaterial color="#2b3440" roughness={0.6} />
      </mesh>
      <mesh position={[-0.65, 0.78, BUS_FRONT_Z - 0.3]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.16, 0.025, 10, 20]} />
        <meshStandardMaterial color="#15181d" roughness={0.5} />
      </mesh>
      <mesh position={[-0.65, 0.3, BUS_FRONT_Z - 0.75]}>
        <boxGeometry args={[0.4, 0.42, 0.4]} />
        <meshStandardMaterial color={THEME.brandDeep} roughness={0.7} />
      </mesh>

      {/* Seats, driven entirely by the real seat layout from the API */}
      {positions.map(({ seat, position }) => (
        <SeatMesh
          key={seat.id}
          seat={seat}
          position={position}
          selected={selectedSeats.includes(seat.name)}
          onSelect={onSeatSelect}
        />
      ))}
    </group>
  );
}
