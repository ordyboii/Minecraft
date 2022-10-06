import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky, softShadows } from "@react-three/drei";
import {
  Physics,
  type Triplet,
  usePlane,
  useSphere,
  useBox
} from "@react-three/cannon";
import { RefObject, useEffect, useRef, useState } from "react";
import { type Mesh, RepeatWrapping, Vector3 } from "three";
import { images, Texture, textures } from "./textures";
import { useKeyboard } from "./keyboard";
import { Cube as CubeType, useGameStore } from "./game";

const Ground = () => {
  const addCube = useGameStore(state => state.addCube);

  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0]
  }));

  textures.grass.wrapS = RepeatWrapping;
  textures.grass.wrapT = RepeatWrapping;
  textures.grass.repeat.set(100, 100);

  return (
    <mesh
      ref={ref as RefObject<Mesh>}
      receiveShadow
      onClick={e => {
        e.stopPropagation();

        if (ref.current) {
          const [x, y, z] = Object.values(e.point).map(value =>
            Math.ceil(value)
          );
          addCube(x, y, z);
        }
      }}
    >
      <planeGeometry attach='geometry' args={[100, 100]} />
      <meshStandardMaterial attach='material' map={textures.grass} />
    </mesh>
  );
};

const SPEED = 6;
const JUMP = 6;

const Player = () => {
  const { camera } = useThree();
  const { moveForward, moveBackward, moveLeft, moveRight, jump } =
    useKeyboard();

  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: "Dynamic",
    position: [0, 1, 0]
  }));

  const position = useRef([0, 0, 0]);
  useEffect(() => {
    api.position.subscribe(p => (position.current = p));
  }, [api.position]);

  const velocity = useRef<Triplet>([0, 0, 0]);
  useEffect(() => {
    api.velocity.subscribe(v => (velocity.current = v));
  }, [api.velocity]);

  useFrame(() => {
    if (ref.current) {
      camera.position.copy(
        new Vector3(
          position.current[0],
          position.current[1],
          position.current[2]
        )
      );

      const frontVector = new Vector3(
        0,
        0,
        (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
      );
      const sideVector = new Vector3(
        (moveLeft ? 1 : 0) - (moveRight ? 1 : 0),
        0,
        0
      );

      const direction = new Vector3();
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED)
        .applyEuler(camera.rotation);

      api.velocity.set(direction.x, velocity.current[1], direction.z);

      if (jump && Math.abs(velocity.current[1]) < 0.05) {
        api.velocity.set(velocity.current[0], JUMP, velocity.current[2]);
      }
    }
  });

  return <mesh ref={ref as RefObject<Mesh>}></mesh>;
};

const Cube = ({ pos, type }: CubeType) => {
  const [hover, setHover] = useState(false);
  const [addCube, removeCube, texture] = useGameStore(state => [
    state.addCube,
    state.removeCube,
    state.texture
  ]);

  const [ref] = useBox(() => ({
    type: "Static",
    position: pos
  }));

  return (
    <mesh
      ref={ref as RefObject<Mesh>}
      castShadow
      onPointerMove={e => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={e => {
        e.stopPropagation();
        setHover(false);
      }}
      onClick={e => {
        e.stopPropagation();

        if (e.faceIndex && ref.current) {
          const clickedFace = Math.floor(e.faceIndex / 2);
          const { x, y, z } = ref.current.position;

          if (e.nativeEvent.altKey) {
            removeCube(x, y, z);
            return;
          }

          if (clickedFace === 0) {
            addCube(x + 1, y, z);
            return;
          }

          if (clickedFace === 1) {
            addCube(x - 1, y, z);
            return;
          }

          if (clickedFace === 2) {
            addCube(x, y + 1, z);
            return;
          }

          if (clickedFace === 3) {
            addCube(x, y - 1, z);
            return;
          }

          if (clickedFace === 4) {
            addCube(x, y, z + 1);
            return;
          }

          if (clickedFace === 5) {
            addCube(x, y, z - 1);
            return;
          }
        }
      }}
    >
      <boxGeometry attach='geometry' />
      <meshStandardMaterial
        attach='material'
        transparent
        opacity={texture === "glass" ? 0.6 : 1}
        color={hover ? "gray" : "white"}
        map={textures[type]}
      />
    </mesh>
  );
};

const TextureSelector = () => {
  const [visible, setVisible] = useState(false);
  const { dirt, grass, glass, wood, log } = useKeyboard();
  const [texture, setTexture] = useGameStore(state => [
    state.texture,
    state.setTexture
  ]);

  const textures = { dirt, grass, glass, wood, log };

  useEffect(() => {
    const pressedTexture = Object.entries(textures).find(
      ([key, value]) => value
    );

    if (pressedTexture) {
      setTexture(pressedTexture[0] as Texture);
    }
  }, [dirt, grass, glass, wood, log, setTexture]);

  useEffect(() => {
    setVisible(true);

    const visible = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(visible);
    };
  }, [dirt, grass, glass, wood, log]);

  if (visible) {
    return (
      <div className='centered' data-texture>
        {Object.entries(images).map(([key, src]) => (
          <img key={key} src={src} alt={key} data-active={key === texture} />
        ))}
      </div>
    );
  }

  return null;
};

const FPV = () => {
  const { camera, gl } = useThree();

  return <PointerLockControls args={[camera, gl.domElement]} />;
};

softShadows();

export default function App() {
  const [cubes, saveWorld, resetWorld] = useGameStore(state => [
    state.cubes,
    state.saveWorld,
    state.resetWorld
  ]);

  return (
    <>
      <Canvas shadows>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.25} />
        <pointLight castShadow intensity={0.7} position={[100, 100, 100]} />
        <FPV />
        <Physics gravity={[0, -30, 0]}>
          <Ground />
          <Player />
          {cubes.map((cube, idx) => (
            <Cube key={idx} pos={cube.pos} type={cube.type} />
          ))}
        </Physics>
      </Canvas>
      <div className='centered'>+</div>
      <TextureSelector />
      <div className='buttons'>
        <button onClick={saveWorld}>Save</button>
        <button onClick={resetWorld}>Reset</button>
      </div>
    </>
  );
}
