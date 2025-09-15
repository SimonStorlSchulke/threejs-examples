import { FbmNoiseBuilder, normalizeFbmRange } from "src/generators/noise.ts";
import { displaceY } from "src/operations/displacements.ts";
import { closeTo, mapRangeSmooth } from "src/operations/math-operators";
import { MathUtils, PlaneGeometry } from "three";
import { mapLinear } from "three/src/math/MathUtils.js";

export type TerrainArgs = {
  seed: number;
  gain: number;
  lacunarity: number;
  frequency: number;
  amplitude: number;
  altitude: number;
  falloff: number;
  erosion: number;
  erosionSoftness: number;
  rivers: number;
  riversFrequency: number;
  riverWidth: number;
  lakes: number;
  lakesFalloff: number;
  riverFalloff: number;
  smoothLowerPlanes: number;
  octaves: number;
  width: number;
  depth: number;
  resolution: number;
  posX: number;
  posZ: number;
  renderDistance: number;
};

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

  let fbmValiation = new FbmNoiseBuilder()
    .octaves(1)
    .seed(args.seed + 4)
    .frequency(0.012)
    .build();

  let fbmBiomes = new FbmNoiseBuilder()
    .octaves(2)
    .seed(args.seed + 4)
    .frequency(0.004)
    .build();

  let fbmErosion = new FbmNoiseBuilder()
    .octaves(3)
    .lacunarity(1.8)
    .seed(args.seed + 1)
    .offset(0.3)
    .amplitude(0.2)
    .frequency(args.frequency)
    .build();

  const geometry = new PlaneGeometry(
    args.width,
    args.depth,
    args.resolution,
    args.resolution
  );
  geometry.rotateX(-Math.PI / 2);

  const defaultTerrain = (x: number, z: number) => {
    let terrainNoise = fbm(x + args.posX * 25, z + args.posZ * 25);

    const erosionNoise =
      fbmValiation(x + 500 + args.posX * 25, z + 500 + args.posZ * 25) * 0.6 - 0.1;
    const erosionSoftness = erosionNoise + args.erosionSoftness;
    let erosion = fbmErosion(x + args.posX * 25, z + args.posZ * 25);

    erosion = MathUtils.smoothstep(erosion, 0, 1);
    erosion = Math.pow(erosion, 1 + erosionSoftness);
    erosion = MathUtils.clamp(MathUtils.pingpong(erosion * 2, 1) - 0.3, 0, 100);

    terrainNoise *= MathUtils.lerp(1, erosion, args.erosion);

    const altitudeNoise =
    fbmValiation(x + args.posX * 25, z + args.posZ * 25) * 1.4 - 0.75;
    const altitude = args.altitude + altitudeNoise;
    terrainNoise = terrainNoise + altitude;
    
    let rivers = mapRangeSmooth(terrainNoise, -(1-args.lakes), -(1-args.lakes) + args.lakesFalloff, 3, 0) * .2;

    terrainNoise = MathUtils.lerp(
      terrainNoise * terrainNoise,
      terrainNoise * terrainNoise * terrainNoise,
      args.smoothLowerPlanes
    );

    return {y: MathUtils.lerp(terrainNoise, -3, MathUtils.clamp(rivers * args.rivers * 3, 0, 1)), water: rivers};
  };

  let fbmCanyons= new FbmNoiseBuilder()
  .octaves(args.octaves)
  .lacunarity(args.lacunarity)
  .gain(args.gain)
  .seed(args.seed)
  .offset(0.25)
  .amplitude(args.amplitude * 1.5)
  .frequency(args.frequency * 0.3)
  .build();


  const desertTerrain = (x: number, z: number) => {
    let terrainNoise = normalizeFbmRange(Math.abs(fbmCanyons(x + args.posX * 25, z + args.posZ * 25) - 0.25));
    const riverWidthVariation = normalizeFbmRange(fbmValiation(x + 1000 + args.posX * 25, z + 1000 + args.posZ * 25));
    const riversEdge1 = mapLinear(args.riverWidth, 0, 1, .2, .45) * mapLinear(riverWidthVariation, 0, 1, 0.75, 1.15);
    const riversEdge2 = mapLinear(args.riverWidth, 0, 1, .3, .55) * mapLinear(riverWidthVariation, 0, 1, 0.75, 1.15);
    const rivers = mapRangeSmooth(terrainNoise, riversEdge1, riversEdge2, 1, 0) * .2;
    const cliffs = mapRangeSmooth(terrainNoise, 0.5, .8, 0, 1);
    return {y: cliffs - rivers, water: rivers * 5};
  };

  displaceY(geometry, 
    (x: number, z: number) => {

      let biome = normalizeFbmRange(fbmBiomes(x + 500 + args.posX * 25, z + 500 + args.posZ * 25));
      biome = mapRangeSmooth(biome, 0.65, 0.8, 0, 1)
      if (closeTo(biome, 0, 0.004)) {
        const t = desertTerrain(x, z);
        return {y: t.y, biome: [biome, t.water, 0]};
      } 
      if (closeTo(biome, 1, 0.004)) {
        const t = defaultTerrain(x, z);
        return {y: t.y, biome: [biome, t.water, 0]};
      } 
       else {
        const tDesert = desertTerrain(x, z);
        const tDefault = defaultTerrain(x, z)
        const y = MathUtils.lerp(tDesert.y, tDefault.y, biome);
        const water = MathUtils.lerp(tDesert.water, tDefault.water, biome);
        return {y, biome: [biome, water, 0]}
      }
      
    }, 2.8 * (1 - args.smoothLowerPlanes * 0.5));

  return geometry;
}
