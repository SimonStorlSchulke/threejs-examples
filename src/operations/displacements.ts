import * as THREE from 'three';
import { BufferGeometry } from 'three';

export function displaceY(
  geometry: BufferGeometry,
  yFunction: (x: number, z: number) => number,
  strength: number,
) {
  const position = geometry.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    let newY = yFunction(x, z) * strength;
    position.setY(i, newY );
  }
  position.needsUpdate = true;

  geometry.computeVertexNormals();
}
