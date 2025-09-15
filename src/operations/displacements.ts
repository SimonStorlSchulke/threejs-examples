import * as THREE from 'three';
import { BufferGeometry } from 'three';

export function displaceY(
  geometry: BufferGeometry,
  yFunction: (x: number, z: number) => {y: number, biome: number[]},
  strength: number,
) {
  const position = geometry.attributes.position as THREE.BufferAttribute;

  const biome = new Float32Array(position.count * 3);

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const result = yFunction(x, z);

    biome[i * 3 + 0] = result.biome[0];
    biome[i * 3 + 1] = result.biome[1];
    biome[i * 3 + 2] = result.biome[2];

    let newY = result.y * strength;
    position.setY(i, newY );
  }

  geometry.setAttribute("biome", new THREE.Float32BufferAttribute(biome, 3));
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
