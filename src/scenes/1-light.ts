import * as THREE from "three";
import {
  addFrameCallback,
  RENDERER,
  SCENE,
} from "../setup-scene";

export function lightScene() {
  const geometry = new THREE.TorusGeometry(2.5, 0.8, 22);
  const material = new THREE.MeshPhongMaterial({ color: 0xeeff00 });
  const cube = new THREE.Mesh(geometry, material);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.rotateX(Math.PI / 4);
  light.rotateY(Math.PI / 4);
  light.rotateZ(Math.PI / 4);

  const light2 = new THREE.PointLight(0xffffff, 10);
  light.rotateX(Math.PI / 4);
  light.rotateY(Math.PI / 4);
  light.rotateZ(Math.PI / 4);

  light2.translateY(-5);
  light2.translateY(2);

  RENDERER.toneMapping = THREE.AgXToneMapping;

  SCENE.add(cube, light, light2);

  addFrameCallback((delta: number) => {
    cube.rotation.x += delta * 0.5;
    cube.rotation.y += delta * 0.5;
  });
}
