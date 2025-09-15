import { addSky } from 'src/generators/sky.ts';
import { generateTerrain, TerrainArgs } from 'src/generators/terrain.ts';
import { addOrbitControle } from 'src/scene-utils.ts';
import { CAMERA, RENDERER, SCENE } from 'src/setup-scene.ts';
import { TerrainMaterial } from 'src/shaders/terrain-material.ts';
import { addSlider } from 'src/ui.ts';
import { AgXToneMapping, Mesh, Vector3 } from 'three';

let terrain: Mesh;
const material = new TerrainMaterial();

export function terrainScene(this: any) {
  RENDERER.toneMapping = AgXToneMapping;
  addSky(70, 120);
  CAMERA.position.set(-3, 4, 8);
  CAMERA.rotation.x -= 0.4;
  CAMERA.rotation.y -= 0.2;
  CAMERA.rotation.z -= 0.06;

  addOrbitControle(new Vector3(-3, 4, 8));

  const args: TerrainArgs = {
    seed: 0,
    gain: 0.5,
    lacunarity: 2,
    frequency: 0.07,
    amplitude: 0.8,
    altitude: 0.1,
    falloff: 0.0,
    erosion: 0.5,
    erosionSoftness: 0,
    rivers: 0.0,
    riversSeed: 0,
    riverFalloff: 0.06,
    riversFrequency: 0.13,
    riverWidth: 0.5,
    smoothLowerPlanes: 0.6,
    octaves: 8,
    resolution: 256,
    width: 12,
    depth: 12,
    posX: 0,
    posZ: 0,
    renderDistance: 5,
  }


  terrain = new Mesh(generateTerrain(args), material);
  SCENE.add(terrain);

  createUi(args);

}

function createUi(args: TerrainArgs) {
  const regenerate = () => {
    terrain.geometry = generateTerrain(args);
  }

  const argSlider = (name: string, min: number, max: number, type: 'range' | 'number' = 'range', isInt = false) => {
    addSlider(name, min, max, (args as any)[name], (value) => {
      (args as any)[name] = value;
      regenerate();
    }, type, isInt);
  }

  argSlider('seed', -99999999, 99999999, 'number', true);
  argSlider('gain', 0, 1);
  argSlider('lacunarity', 0, 10);
  argSlider('frequency', 0, 0.3);
  argSlider('amplitude', 0, 3);
  argSlider('falloff', 0, 1);
  argSlider('erosion', 0, 0.7);
  argSlider('erosionSoftness', 0, 1);
  argSlider('rivers', 0, 0.8);
  argSlider('riversSeed', -99999999, 99999999, 'number', true);
  argSlider('riverWidth', 0, 1);
  argSlider('altitude', 0, 1);
  argSlider('smoothLowerPlanes', 0, 1);
  argSlider('octaves', 1, 16);
  argSlider('resolution', 8, 512);
  argSlider('posX', 0, 2);
  argSlider('posZ', 0, 2);
}


