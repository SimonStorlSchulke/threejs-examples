import { addSky } from 'src/generators/sky.ts';
import { generateTerrain, TerrainArgs } from 'src/generators/terrain.ts';
import { addOrbitControle } from 'src/scene-utils.ts';
import { addFrameCallback, CAMERA, RENDERER, SCENE } from 'src/setup-scene.ts';
import { TerrainMaterial } from 'src/shaders/terrain-material.ts';
import { addSlider } from 'src/ui.ts';
import { AgXToneMapping, Fog, Mesh, Vector3 } from 'three';


export function terrainInfiniteScene(this: any) {
  let terrainGrid: Map<string, { mesh: Mesh, resolution: number }> = new Map();

  const material = new TerrainMaterial();

  const args: TerrainArgs = {
    seed: 0,
    gain: 0.5,
    lacunarity: 2,
    frequency: 0.07,
    amplitude: 0.5,
    altitude: 0.1,
    falloff: 0.0,
    erosion: 0.7,
    erosionSoftness: 0.3,
    rivers: 0.1,
    riversSeed: 0,
    riverWidth: 0.5,
    offset: 0.35,
    octaves: 10,
    resolution: 256,
    width: 10,
    depth: 10,
    posX: 0,
    posZ: 0,
  }

  RENDERER.toneMapping = AgXToneMapping;
  addSky(70, 120);
  SCENE.fog = new Fog( 0xd3dde2, 4, 33 );
  CAMERA.position.set(-3, 4, 8);
  CAMERA.rotation.x -= 0.4;
  CAMERA.rotation.y -= 0.2;
  CAMERA.rotation.z -= 0.06;

  addOrbitControle(new Vector3(-3, 4, 8));


  createUi(args);


  addFrameCallback(() => {
    lod();
  })


  function getNearbyKeys(center: Vector3, radius: number): string[] {
    const keys: string[] = [];
    const cx = Math.round(center.x);
    const cz = Math.round(center.z);

    const r = Math.ceil(radius);

    for (let x = cx - r; x <= cx + r; x++) {
      for (let z = cz - r; z <= cz + r; z++) {
        const dx = x - center.x;
        const dz = z - center.z;
        if (Math.sqrt(dx * dx + dz * dz) <= radius) {
          keys.push(`${x},${z}`);
        }
      }
    }

    return keys;
  }

  function lod() {
    const camPosInGrid = CAMERA.position.clone().multiplyScalar(0.1);
    camPosInGrid.y = 0;
    const camX = Math.round(camPosInGrid.x);
    const camZ = Math.round(camPosInGrid.z);

    for (const gridKey of getNearbyKeys(camPosInGrid, 5)) {

      const iX = +gridKey.split(',')[0];
      const iZ = +gridKey.split(',')[1];
      args.resolution = 128;


      if (!terrainGrid.has(gridKey)) {



        args.posX = iX * .4;
        args.posZ = iZ * .4;

        console.log("generating chunk", gridKey, args.resolution)

        const newTerrain = new Mesh(generateTerrain(args), material);
        newTerrain.position.x = iX * 10;
        newTerrain.position.z = iZ * 10;
        terrainGrid.set(gridKey, {mesh: newTerrain, resolution: args.resolution});
        SCENE.add(newTerrain)
      }
    }

    for (const gridKey of terrainGrid.keys()) {
      const iX = +gridKey.split(',')[0];
      const iZ = +gridKey.split(',')[1];
      const distanceToCamera = camPosInGrid.distanceTo(new Vector3(iX, 0, iZ));
      if (distanceToCamera > 5) {
        SCENE.remove(terrainGrid.get(gridKey)!.mesh);
        terrainGrid.delete(gridKey);
      }
    }


    console.log(camX, camZ);
  }

  function createUi(args: TerrainArgs) {
    const regenerate = () => {

      for (const terrainKv of terrainGrid) {
        SCENE.remove(terrainKv[1].mesh);
        terrainGrid.delete(terrainKv[0]);
      }

      lod()

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
    argSlider('offset', 0, 1);
    argSlider('octaves', 1, 16);
    argSlider('resolution', 8, 512);
  }


}
