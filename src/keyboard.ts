import { useEffect, useState } from "react";

const actionKeys: Record<string, string> = {
  KeyW: "moveForward",
  KeyS: "moveBackward",
  KeyA: "moveLeft",
  KeyD: "moveRight",
  Space: "jump",
  Digit1: "dirt",
  Digit2: "grass",
  Digit3: "glass",
  Digit4: "wood",
  Digit5: "log"
} as const;

export const useKeyboard = () => {
  const [movement, setMovement] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    dirt: false,
    grass: false,
    glass: false,
    wood: false,
    log: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (actionKeys[e.code]) {
        setMovement(state => ({ ...state, [actionKeys[e.code]]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (actionKeys[e.code]) {
        setMovement(state => ({ ...state, [actionKeys[e.code]]: false }));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return movement;
};
