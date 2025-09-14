import { addSky } from 'src/generators/sky.ts';
import { TerrainArgs } from 'src/generators/terrain.ts';
import { addOrbitControle } from 'src/scene-utils.ts';
import { addFrameCallback, CAMERA, RENDERER, SCENE } from 'src/setup-scene.ts';
import { TerrainMaterial } from 'src/shaders/terrain-material.ts';
import { addSlider } from 'src/ui.ts';
import { AgXToneMapping, BufferAttribute, BufferGeometry, Fog, Mesh, Vector3 } from 'three';


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
    resolution: 128,
    width: 10,
    depth: 10,
    posX: 0,
    posZ: 0,
    renderDistance: 5,
  }

  RENDERER.toneMapping = AgXToneMapping;
  addSky(70, 120);
  SCENE.fog = new Fog(0xd3dde2, 4, args.renderDistance * 10 - 2);
  CAMERA.position.set(-3, 4, 8);
  CAMERA.rotation.x -= 0.4;
  CAMERA.rotation.y -= 0.2;
  CAMERA.rotation.z -= 0.06;

  addOrbitControle(new Vector3(-3, 4, 8));


  createUi(args);




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

  addFrameCallback(() => {
    generateNearbyChunksParallel();
  })


  const scheduledKeys: Set<string> = new Set();

  const w = new Worker(new URL('../generators/terrainworker.ts', import.meta.url), {type: 'module'});

  w.onmessage = (e) => {
    const {positions, normals, index, gridKey} = e.data;
    const terrainGeometry = new BufferGeometry();

    terrainGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(positions), 3)
    );
    terrainGeometry.setAttribute(
      'normal',
      new BufferAttribute(new Float32Array(normals), 3)
    );
    terrainGeometry.setIndex(new BufferAttribute(new Uint32Array(index), 1));

    const newTerrain = new Mesh(terrainGeometry, material);
    newTerrain.position.x = +gridKey.split(',')[0] * 10;
    newTerrain.position.z = +gridKey.split(',')[1] * 10;
    terrainGrid.set(gridKey, {mesh: newTerrain, resolution: args.resolution});
    SCENE.add(newTerrain);
    scheduledKeys.delete(gridKey);
  };

  function generateNearbyChunksParallel() {
    const camPosInGrid = CAMERA.position.clone().multiplyScalar(0.1);
    camPosInGrid.y = 0;

    const renderDistance = Math.floor(args.renderDistance);

    for (const gridKey of getNearbyKeys(camPosInGrid, renderDistance)) {
      if (!terrainGrid.has(gridKey) && !scheduledKeys.has(gridKey)) {
        scheduledKeys.add(gridKey);
        args.posX = +gridKey.split(',')[0] * .4;
        args.posZ = +gridKey.split(',')[1] * .4;
        w.postMessage({terrainArgs: args, gridKey});
      }
    }

    for (const gridKey of terrainGrid.keys()) {
      const iX = +gridKey.split(',')[0];
      const iZ = +gridKey.split(',')[1];
      const distanceToCamera = camPosInGrid.distanceTo(new Vector3(iX, 0, iZ));
      if (distanceToCamera > renderDistance) {
        SCENE.remove(terrainGrid.get(gridKey)!.mesh);
        terrainGrid.delete(gridKey);
      }
    }
  }

  function createUi(args: TerrainArgs) {
    const regenerate = () => {
      for (const terrainKv of terrainGrid) {
        SCENE.remove(terrainKv[1].mesh);
        terrainGrid.delete(terrainKv[0]);
      }

      SCENE.fog = new Fog(0xd3dde2, 4, args.renderDistance * 10 - 2);
      generateNearbyChunksParallel();
    }

    const argSlider = (name: string, min: number, max: number, type: 'range' | 'number' = 'range', isInt = false) => {
      addSlider(name, min, max, (args as any)[name], (value) => {
        (args as any)[name] = value;
        regenerate();
      }, type, isInt);
    }

    argSlider('seed', -99999999, 99999999, 'number', true);
    argSlider('frequency', 0, 0.3);
    argSlider('amplitude', 0, 3);
    argSlider('falloff', 0, 1);
    argSlider('erosion', 0, 0.7);
    argSlider('erosionSoftness', 0, 1);
    argSlider('rivers', 0, 0.8);
    argSlider('riversSeed', -99999999, 99999999, 'number', true);
    argSlider('riverWidth', 0, 1);
    argSlider('altitude', -1, 1);
    argSlider('offset', 0, 1);
    argSlider('renderDistance', 2, 10);
    argSlider('resolution', 32, 256);
  }


}
