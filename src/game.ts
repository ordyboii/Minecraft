import create from "zustand";
import { Texture } from "./textures";
import type { Triplet } from "@react-three/cannon";

export type Cube = {
  pos: Triplet;
  type: Texture;
};

type GameStore = {
  cubes: Cube[];
  texture: Texture;
  addCube: (x: number, y: number, z: number) => void;
  removeCube: (x: number, y: number, z: number) => void;
  setTexture: (texture: Texture) => void;
  saveWorld: () => void;
  resetWorld: () => void;
};

export const useGameStore = create<GameStore>(set => ({
  cubes: JSON.parse(window.localStorage.getItem("world")!) || [],
  texture: "wood",
  addCube: (x, y, z) =>
    set(state => ({
      cubes: [...state.cubes, { pos: [x, y, z], type: state.texture || "wood" }]
    })),
  removeCube: (x, y, z) =>
    set(state => ({
      cubes: state.cubes.filter(
        cube => cube.pos[0] !== x || cube.pos[1] !== y || cube.pos[2] !== z
      )
    })),
  setTexture: texture => set(() => ({ texture })),
  saveWorld: () =>
    set(state => {
      window.localStorage.setItem("world", JSON.stringify(state.cubes));
      return state;
    }),
  resetWorld: () =>
    set(state => {
      window.localStorage.removeItem("world");
      return state;
    })
}));
