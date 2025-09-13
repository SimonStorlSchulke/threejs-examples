import { addFrameCallback, SCENE } from 'src/setup-scene.ts';
import * as THREE from "three";

export function simpleScene(this: any) {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
  const cube = new THREE.Mesh(geometry, material);
  SCENE.add(cube);

  addFrameCallback((delta: number) => {
    cube.rotation.x += delta * 0.5;
    cube.rotation.y += delta * 0.5;
  });
}
