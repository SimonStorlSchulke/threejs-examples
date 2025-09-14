import { generateTerrain } from 'src/generators/terrain.ts';

self.onmessage = (m) => {
    const geometry = generateTerrain(m.data.terrainArgs);

    // Extract attributes into transferable objects
    const index = geometry.index?.array; // keep full TypedArray, not just buffer

    const iX = +m.data.gridKey.split(',')[0];
    const iZ = +m.data.gridKey.split(',')[1];

    postMessage(
      {
          positions: geometry.attributes.position.array,
          normals: geometry.attributes.normal.array,
          uvs: geometry.attributes.uv?.array,
          index,
          meshPosX: iX * 10,
          meshPosZ: iZ * 10,
          gridKey: m.data.gridKey,
      },
    );
};
