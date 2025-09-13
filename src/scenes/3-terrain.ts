import { FbmNoiseBuilder } from 'src/generators/noise.ts';
import { addSky } from 'src/generators/sky.ts';
import { displaceY } from 'src/operations/displacements.ts';
import { addOrbitControle } from 'src/scene-utils.ts';
import { addFrameCallback, CAMERA, RENDERER, SCENE } from 'src/setup-scene.ts';
import { TerrainMaterial } from 'src/shaders/terrain-material.ts';
import { addButton, addSlider } from 'src/ui.ts';
import { AgXToneMapping, BufferGeometry, MathUtils, Mesh, PlaneGeometry, Vector3 } from 'three';

export function terrainScene(this: any) {
  RENDERER.toneMapping = AgXToneMapping;
  addSky(70, 120);
  CAMERA.position.set(-3, 4, 8);
  CAMERA.rotation.x -= 0.4;
  CAMERA.rotation.y -= 0.2;
  CAMERA.rotation.z -= 0.06;

  addOrbitControle(new Vector3(-3, 4, 8));

  const args: Record<string, number> = {
    gain: 0.5,
    lacunarity: 2,
    frequency: 0.07,
    amplitude: 0.8,
    altitude: 0.1,
    falloff: 0.0,
    erosion: 0.5,
    rivers: 0.0,
    riverWidth: 0.5,
    offset: 0.6,
    octaves: 8,
    resolution: 256,
    posX: 0,
    posZ: 0,
  }

  let seed = 0;

  let geometry = generateTerrain(true);
  let terrain = new Mesh(geometry, new TerrainMaterial());
  SCENE.add(terrain);

  createUi();

  addFrameCallback((delta: number) => {
    //terrain.rotation.y += delta * 0.05;
  });

  function generateTerrain(randomSeed: boolean): BufferGeometry {
    const dimensions = 12;

    seed = randomSeed ? Math.random() : seed


    let fbm = new FbmNoiseBuilder()
      .octaves(args.octaves)
      .lacunarity(args.lacunarity)
      .gain(args.gain)
      .seed(seed)
      .offset(args.offset)
      .amplitude(args.amplitude)
      .frequency(args.frequency)
      .build();

    let fbmErosion = new FbmNoiseBuilder()
      .octaves(3)
      .lacunarity(1.8)
      .seed(seed + 1)
      .offset(.3)
      .amplitude(.2)
      .frequency(args.frequency)
      .build();

    let fbmRivers = new FbmNoiseBuilder()
      .octaves(4)
      .lacunarity(2)
      .seed(seed + 2)
      .offset(.3)
      .amplitude(.2)
      .frequency(args.frequency * 0.7)
      .build();


    const geometry = new PlaneGeometry(dimensions, dimensions, args.resolution, args.resolution);
    geometry.rotateX(-Math.PI / 2);

    const strengthFn = (x: number, y: number, z: number) => {
      let val = terrainFalloff(dimensions, dimensions, args.falloff)(x,y,z);
      val *= y * 0.45;
      return val;
    }

    displaceY(geometry, (x, z) => {
      let terrainNoise = fbm(x + args.posX * 25, z + args.posZ * 25);

      let erosion = fbmErosion(x + args.posX * 25, z + args.posZ * 25);

      erosion = MathUtils.smoothstep(erosion, 0, .85);
      erosion = MathUtils.pingpong(erosion * 2, 1) - 0.3;


      terrainNoise *= MathUtils.lerp(1, erosion, args.erosion * terrainNoise);

      let rivers = fbmRivers(x + args.posX * 25, z + args.posZ * 25);
      rivers = Math.pow(MathUtils.pingpong(rivers, 0.25) * 3, 4);
      const riverWidth = MathUtils.mapLinear(args.riverWidth, 0, 1, 0.3, 0.25)
      rivers = Math.abs(MathUtils.clamp(rivers, 0, riverWidth) * 3);


      rivers = MathUtils.smoothstep(MathUtils.mapLinear(rivers, .36, .95, 0, .8), 0, 1);
      return terrainNoise + args.altitude - rivers * args.rivers;
      return rivers;
    }, 2.5, strengthFn)

    return geometry;
  }


  function createUi() {
    const regenerate = (randomSeed: boolean) => {
      geometry = generateTerrain(randomSeed);
      terrain.geometry = geometry;
    }

    addButton("randomize", () => regenerate(true));

    const argSlider = (name: string, min: number, max: number, type: 'range' | 'number' = 'range') => {
      addSlider(name, min, max, args[name], (value) => {
        args[name] = value;
        regenerate(false);
      }, type);
    }

    argSlider('gain', 0, 1);
    argSlider('lacunarity', 0, 10);
    argSlider('frequency', 0, 0.3);
    argSlider('amplitude', 0, 2);
    //argSlider('falloff', 0, 2);
    argSlider('erosion', 0, 0.8);
    argSlider('rivers', 0, 0.8);
    argSlider('riverWidth', 0, 1);
    argSlider('altitude', 0, 1);
    argSlider('offset', 0, 1);
    argSlider('octaves', 1, 16);
    argSlider('resolution', 8, 512);
    argSlider('posX', 0, 2);
    argSlider('posZ', 0, 2);
  }


  function terrainFalloff(width: number, depth: number, fallOff: number) {
    return (x: number, _: number, z: number) => {
      let xRel = x / (width * 0.5);
      let heightX = MathUtils.mapLinear(xRel, -1, 1, 0, 1);

      let zRel = z / (depth * 0.5);
      let heightZ = MathUtils.mapLinear(zRel, -1, 1, 0, 1);

      return Math.pow(heightX * heightZ, fallOff);
    }
  }
}



