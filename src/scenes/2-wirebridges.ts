import { Vector3, Object3D, AgXToneMapping, BoxGeometry, MeshPhongMaterial, Mesh, CubicBezierCurve3, TubeGeometry } from "three";
import {
  addFrameCallback,
  RENDERER,
  SCENE,
} from "../setup-scene";
import { addThreePointLightSetup } from "../scene-utils";

export function wireBridgesScene() {
  addThreePointLightSetup();
  RENDERER.toneMapping = AgXToneMapping;

  const helperGeometry = new BoxGeometry(1, 0.1, 1);
  const helperMaterial = new MeshPhongMaterial({color: 0x888888});

  const p1a = new Mesh(helperGeometry, helperMaterial);
  const p1b = new Mesh(helperGeometry, helperMaterial);
  p1a.position.set(-1, 0, -4);
  p1b.position.set(6, 2, 0);
  p1b.rotateX(Math.PI * 0.5);

  const p2a = new Mesh(helperGeometry, helperMaterial);
  const p2b = new Mesh(helperGeometry, helperMaterial);
  p2a.position.set(2, 2, -1);
  p2b.position.set(-6, 2, 0);
  p2b.rotateX(Math.PI * 0.5);

  const geometry1 = createCurvedTube(p1a, p1b, 0.1);
  const material1 = new MeshPhongMaterial({color: 0xff4444});
  const wireBridge1 = new Mesh(geometry1, material1);

  const geometry2 = createCurvedTube(p2a, p2b, 0.1);
  const material2 = new MeshPhongMaterial({color: 0x44ff44});
  const wireBridge2 = new Mesh(geometry2, material2);

  SCENE.add(p1a, p1b, p2a, p2b, wireBridge1, wireBridge2);

  addFrameCallback((delta: number, time: number) => {
    p1a.rotateZ(delta);
    p1b.rotateX(delta);
    p1a.translateY(Math.cos(delta * 0.4) * 0.05);
    p1b.translateZ(Math.sin(delta * 2.7) * 2);
    const curvature1 = (Math.sin(time) + 1.5) / 2;

    p2a.rotateZ(delta * 0.5);
    p2b.rotateX(delta * 0.2);
    p2a.translateY(Math.cos(delta * -0.4) * -0.05);
    p2b.translateZ(Math.sin(delta * 2.7) * 0.5);
    const curvature2 = (Math.cos(time) + 1.7) / 2;

    wireBridge1.geometry = createCurvedTube(p1a, p1b, curvature1);
    wireBridge2.geometry = createCurvedTube(p2a, p2b, curvature2);

  });
}


function createCurvedTube(start: Object3D, end: Object3D, curvature: number, thickness = 0.15, segments = 48) {
  const distance = start.position.distanceTo(end.position);

  const startDir = new Vector3(0, 1, 0).applyEuler(start.rotation);
  const endDir = new Vector3(0, -1, 0).applyEuler(end.rotation);

  const controlLength = distance * curvature;
  const control1 = new Vector3().copy(start.position).add(startDir.multiplyScalar(controlLength));
  const control2 = new Vector3().copy(end.position).add(endDir.multiplyScalar(-controlLength));

  const curve = new CubicBezierCurve3(start.position, control1, control2, end.position);

  return new TubeGeometry(curve, segments, thickness, 6, false);
}
