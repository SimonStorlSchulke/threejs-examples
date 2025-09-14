import { generateTerrain } from 'src/generators/terrain.ts';

self.onmessage = (m) => {
    const geometry = generateTerrain(m.data.terrainArgs);

    // Extract attributes into transferable objects
    const index = geometry.index?.array; // keep full TypedArray, not just buffer

    postMessage(
      {
          positions: geometry.attributes.position.array,
          normals: geometry.attributes.normal.array,
          uvs: geometry.attributes.uv?.array,
          index,
          gridKey: m.data.gridKey,
      },
    );
};
