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
  riversFrequency: number,
  riversSeed: number,
  riverWidth: number,
  riverFalloff: number,
  smoothLowerPlanes: number,
  octaves: number,
  width: number,
  depth: number,
  resolution: number,
  posX: number,
  posZ: number,
  renderDistance: number,
}

export function generateTerrain(args: TerrainArgs) {
  let fbm = new FbmNoiseBuilder()
    .octaves(args.octaves)
    .lacunarity(args.lacunarity)
    .gain(args.gain)
    .seed(args.seed)
    .offset(0.25)
    .amplitude(args.amplitude)
    .frequency(args.frequency)
    .build();

  let fbmBiomes = new FbmNoiseBuilder()
    .octaves(1)
    .seed(args.seed + 4)
    .frequency(0.012)
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
    .gain(0.35)
    .lacunarity(2)
    .seed(args.riversSeed)
    .amplitude(.2)
    .frequency(args.frequency * args.riversFrequency)
    .build();

  const geometry = new PlaneGeometry(args.width, args.depth, args.resolution, args.resolution);
  geometry.rotateX(-Math.PI / 2);

  const riverWidth = MathUtils.mapLinear(args.riverWidth, 0, 1, 0.5, 0.44);
  const riverFalloff = args.riverFalloff * 0.3;

  displaceY(geometry, (x, z) => {
    let terrainNoise = fbm(x + args.posX * 25, z + args.posZ * 25);

    const erosionNoise = fbmBiomes(x + 500 + args.posX * 25, z + 500 + args.posZ * 25) * 0.6 - .1;
    const erosionSoftness = erosionNoise + args.erosionSoftness;
    let erosion = fbmErosion(x + args.posX * 25, z + args.posZ * 25);

    erosion = MathUtils.smoothstep(erosion, 0, 1);
    erosion = Math.pow(erosion, 1 + erosionSoftness);
    erosion = MathUtils.clamp(MathUtils.pingpong(erosion * 2, 1) - 0.3, 0, 100);

    terrainNoise *= MathUtils.lerp(1, erosion, args.erosion * terrainNoise);

    let rivers = (Math.abs(fbmRivers(x + args.posX * 25, z + args.posZ * 25)) - 0.5) * 2;
    rivers = MathUtils.pingpong(rivers, 0.5);

    rivers = MathUtils.clamp(
      MathUtils.mapLinear(rivers, riverWidth, riverWidth + riverFalloff, 1, 0),
       0, 1);
       
    rivers = (1 - MathUtils.smoothstep(rivers, 0, 1)) * .5;

    const altitudeNoise = fbmBiomes(x + args.posX * 25, z + args.posZ * 25) * 1.4 - .75;
    const altitude = args.altitude + altitudeNoise;
    terrainNoise = terrainNoise + altitude;
    terrainNoise = MathUtils.lerp(terrainNoise * terrainNoise, terrainNoise * terrainNoise  * terrainNoise, args.smoothLowerPlanes);
    return terrainNoise - rivers * args.rivers;
  }, 2.8 * (1 - args.smoothLowerPlanes * 0.5));

  return geometry;
}

