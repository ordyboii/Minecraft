import { NearestFilter, TextureLoader } from "three";
import dirtTexture from "./assets/dirt.jpeg";
import grassTexture from "./assets/grass.jpeg";
import glassTexture from "./assets/glass.png";
import logTexture from "./assets/log.jpeg";
import woodTexture from "./assets/wood.png";

export const images = {
  dirt: dirtTexture,
  grass: grassTexture,
  glass: glassTexture,
  wood: woodTexture,
  log: logTexture
};

const dirt = new TextureLoader().load(dirtTexture);
const grass = new TextureLoader().load(grassTexture);
const glass = new TextureLoader().load(glassTexture);
const log = new TextureLoader().load(logTexture);
const wood = new TextureLoader().load(woodTexture);

dirt.magFilter = NearestFilter;
grass.magFilter = NearestFilter;
glass.magFilter = NearestFilter;
log.magFilter = NearestFilter;
wood.magFilter = NearestFilter;

export const textures = { dirt, grass, glass, log, wood };

export type Texture = keyof typeof textures;
