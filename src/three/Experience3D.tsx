import { Suspense, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { BusExterior, BusInterior, BUS_FRONT_Z, BUS_REAR_Z } from './BusModel';
import { CityEnvironment } from './CityEnvironment';
import type { SeatData } from '../hooks/useSeatLayout';
import type { SceneQuality } from '../hooks/useSceneQuality';

export type CameraScene = 'hero' | 'approach' | 'entering' | 'interior' | 'driveaway';

interface Pose {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

const POSES: Record<CameraScene | 'heroMobile', Pose> = {
  // A high, steep 3/4 angle so the ground plane recedes into the distance
  // instead of filling the frame edge-on — the bus reads as an object
  // sitting on the street, not a wall the camera is pressed against.
  // A mostly side-on 3/4 view, pulled back far enough that the whole
  // 9-unit-long bus — bumper to bumper, wheels to roof — sits inside the
  // frame with clear margin of road and sky around it.
  hero: { position: new THREE.Vector3(8.5, 2.3, 10), lookAt: new THREE.Vector3(0, 0.3, -1) },
  // Closer/more front-on for narrow phone viewports — "fill the visual
  // area" per the brief, rather than the wide desktop 3/4 side view.
  heroMobile: { position: new THREE.Vector3(3.4, 1.9, 7.2), lookAt: new THREE.Vector3(0, 0.6, 0) },
  approach: { position: new THREE.Vector3(3.2, 2, 6.2), lookAt: new THREE.Vector3(0, 1.15, BUS_FRONT_Z - 1) },
  entering: { position: new THREE.Vector3(0.1, 1.4, BUS_FRONT_Z - 0.6), lookAt: new THREE.Vector3(0, 1.1, BUS_REAR_Z) },
  interior: { position: new THREE.Vector3(0.1, 1.45, BUS_FRONT_Z - 1.9), lookAt: new THREE.Vector3(0, 1.0, BUS_REAR_Z) },
  driveaway: { position: new THREE.Vector3(10, 3.6, 12), lookAt: new THREE.Vector3(0, 1.2, 4) },
};

function CameraRig({ scene }: { scene: CameraScene }) {
  const { camera, size } = useThree();
  const lookAt = useRef(new THREE.Vector3().copy(POSES.hero.lookAt));

  useFrame((_, delta) => {
    const isNarrow = size.width / size.height < 0.85;
    const pose = scene === 'hero' && isNarrow ? POSES.heroMobile : POSES[scene];
    const damp = 1 - Math.exp(-3.4 * delta);
    camera.position.lerp(pose.position, damp);
    lookAt.current.lerp(pose.lookAt, damp);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function DriveAway({ active, children }: { active: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const offset = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = active ? 14 : 0;
    offset.current += (target - offset.current) * (1 - Math.exp(-2.2 * delta));
    group.current.position.z = offset.current;
  });

  return <group ref={group}>{children}</group>;
}

interface Experience3DProps {
  scene: CameraScene;
  quality: SceneQuality;
  seatLayout?: { seats: SeatData[]; maxX: number; maxY: number } | null;
  selectedSeats?: string[];
  onSeatSelect?: (name: string) => void;
}

/**
 * One persistent canvas for the whole booking journey — the bus and city
 * are mounted once and the camera moves between named poses as `scene`
 * changes, instead of unmounting/remounting the 3D world per step.
 */
export default function Experience3D({
  scene,
  quality,
  seatLayout,
  selectedSeats = [],
  onSeatSelect,
}: Experience3DProps) {
  if (quality === 'off') return null;
  const showInterior = scene === 'entering' || scene === 'interior';
  const reduced = quality === 'reduced';

  return (
    <Canvas
      shadows={!reduced}
      dpr={reduced ? 1 : [1, 1.75]}
      gl={{ antialias: !reduced, alpha: true }}
      camera={{ fov: 42, position: POSES.hero.position.toArray(), near: 0.1, far: 60 }}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={['#f3f7fb']} />
      <fog attach="fog" args={['#f3f7fb', 14, 42]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.1}
        castShadow={!reduced}
        shadow-mapSize={reduced ? [512, 512] : [1024, 1024]}
      />
      <directionalLight position={[-4, 3, -4]} intensity={0.25} />

      <CameraRig scene={scene} />

      <Suspense fallback={null}>
        <DriveAway active={scene === 'driveaway'}>
          <BusExterior idle={scene === 'hero' || scene === 'approach'} interiorView={showInterior} />
          {showInterior && seatLayout && (
            <PresentationControls
              global={false}
              snap
              cursor={false}
              rotation={[0, 0, 0]}
              polar={[-0.08, 0.1]}
              azimuth={[-0.25, 0.25]}
              damping={0.3}
            >
              <BusInterior
                seats={seatLayout.seats}
                maxX={seatLayout.maxX}
                maxY={seatLayout.maxY}
                selectedSeats={selectedSeats}
                onSeatSelect={(name) => onSeatSelect?.(name)}
              />
            </PresentationControls>
          )}
        </DriveAway>
        {!reduced && <CityEnvironment />}
        {reduced && <CityEnvironment reduced />}
      </Suspense>
    </Canvas>
  );
}
