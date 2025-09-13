import { FbmNoiseBuilder } from 'src/generators/noise.ts';
import { displaceY } from 'src/operations/displacements.ts';
import { MathUtils, PlaneGeometry } from 'three';

export type TerrainArgs = {
  seed: number,
  gain: number,
  lacunarity: number,
  frequency: number,
  amplitude: number,
  altitude: number,
  falloff: number,
  erosion: number,
  erosionSoftness: number,
  rivers: number,
  riversSeed: number,
  riverWidth: number,
  offset: number,
  octaves: number,
  width: number,
  depth: number,
  resolution: number,
  posX: number,
  posZ: number,
}

export function generateTerrain(args: TerrainArgs) {
  let fbm = new FbmNoiseBuilder()
    .octaves(args.octaves)
    .lacunarity(args.lacunarity)
    .gain(args.gain)
    .seed(args.seed)
    .offset(args.offset)
    .amplitude(args.amplitude)
    .frequency(args.frequency)
    .build();

  let fbmErosion = new FbmNoiseBuilder()
    .octaves(3)
    .lacunarity(1.8)
    .seed(args.seed + 1)
    .offset(.3)
    .amplitude(.2)
    .frequency(args.frequency)
    .build();

  let fbmRivers = new FbmNoiseBuilder()
    .octaves(4)
    .lacunarity(2)
    .seed(args.riversSeed)
    .amplitude(.2)
    .frequency(args.frequency * 0.7)
    .build();

  const geometry = new PlaneGeometry(args.width, args.depth, args.resolution, args.resolution);
  geometry.rotateX(-Math.PI / 2);

  const strengthFn = (x: number, y: number, z: number) => {
    let val = terrainFalloff(args.width, args.depth, args.falloff)(x,y,z);
    val *= y * 0.45;
    return val;
  }

  displaceY(geometry, (x, z) => {
    let terrainNoise = fbm(x + args.posX * 25, z + args.posZ * 25);

    let erosion = fbmErosion(x + args.posX * 25, z + args.posZ * 25);

    erosion = MathUtils.smoothstep(erosion, 0, 1);
    erosion = Math.pow(erosion, 1 + args.erosionSoftness);
    erosion = MathUtils.clamp(MathUtils.pingpong(erosion * 2, 1) - 0.3, 0, 100);

    terrainNoise *= MathUtils.lerp(1, erosion, args.erosion * terrainNoise);

    let rivers = fbmRivers(x + args.posX * 25, z + args.posZ * 25);
    rivers = Math.pow(MathUtils.pingpong(rivers, 0.25) * 3, 4);
    const riverWidth = MathUtils.mapLinear(args.riverWidth, 0, 1, 0.3, 0.25)
    rivers = Math.abs(MathUtils.clamp(rivers, 0, riverWidth) * 3);

    rivers = MathUtils.smoothstep(MathUtils.mapLinear(rivers, .36, .95, 0, .8), 0, 1);
    return terrainNoise + args.altitude - rivers * args.rivers;
  }, 2.5, strengthFn)

  return geometry;
}

function terrainFalloff(width: number, depth: number, fallOff: number) {
  return (x: number, _: number, z: number) => {
    let xRel = (x / width) + 0.5 ;
    let zRel = (z / depth) + 0.5 ;

    let pingpongX = MathUtils.smoothstep(MathUtils.mapLinear(MathUtils.pingpong(xRel, 0.5), 0, .3, 0, 1), 0, 1);

    let pingpongZ = MathUtils.smoothstep(MathUtils.mapLinear(MathUtils.pingpong(zRel, 0.5), 0, .3, 0, 1), 0, 1);

    return MathUtils.lerp(1, pingpongX * pingpongZ, fallOff);
  }
}
