import { DirectionalLight, Vector3 } from "three";
import { OrbitControls } from 'three-stdlib';
import { addFrameCallback, CAMERA, RENDERER, SCENE } from "./setup-scene";

export function addThreePointLightSetup() {
  const keyLight = new DirectionalLight(0xffeac9, 3);
  keyLight.position.x = 200;
  keyLight.position.y = -33;
  keyLight.position.z = 200;

  const rimLight = new DirectionalLight(0xccddff, 1);
  rimLight.position.y = 6;
  rimLight.position.z = -20;

  const fillLight = new DirectionalLight(0xffffff, 0.4);
  fillLight.position.y = -6;
  fillLight.position.z = -2;

  SCENE.add(keyLight, rimLight, fillLight)
}

export function addOrbitControle(startPosition: Vector3 = new Vector3()) {
  CAMERA.position.copy(startPosition);
  const controls = new OrbitControls( CAMERA, RENDERER.domElement );
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 1;
  controls.maxDistance = 50;

  controls.maxPolarAngle = Math.PI / 2;

  addFrameCallback(() => {
  controls.update();
  })
}

