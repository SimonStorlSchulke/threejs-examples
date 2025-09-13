import { addFrameCallback, SCENE } from 'src/setup-scene.ts';
import { DirectionalLight, HemisphereLight, MathUtils, Vector3 } from 'three';
import { Sky } from 'three-stdlib';

export function addSky(
  altitudeDegrees: number,
  yDegrees: number,
  turbidity = 1.1,
  rayleigh = 0.7,
  mieCoefficient = 0.005,
  mieDirectionalG = 0.8,
  animationSpeed = 0,
  ) {
  const sky = new Sky()
  sky.scale.setScalar( 50000 );

  let phi = MathUtils.degToRad(altitudeDegrees);
  let theta = MathUtils.degToRad( yDegrees );
  let sunPosition = new Vector3().setFromSphericalCoords( 1, phi, theta );

  let lightMultiplier = MathUtils.mapLinear(altitudeDegrees, 0, 80, 1, 0);

  const sunLight = new DirectionalLight(0xdfcdbf, 25 * lightMultiplier);
  sunLight.position.setFromSphericalCoords( 1, phi, theta );

  const ambientLight = new HemisphereLight(0xcfefff, 0x000000, 5 * lightMultiplier)

  sky.material.uniforms.sunPosition.value = sunPosition;
  sky.material.uniforms.turbidity.value = turbidity;
  sky.material.uniforms.rayleigh.value = rayleigh;
  sky.material.uniforms.mieCoefficient.value = mieCoefficient;
  sky.material.uniforms.mieDirectionalG.value = mieDirectionalG;

  SCENE.add(sky, sunLight, ambientLight);

  if(animationSpeed != 0) {
    addFrameCallback((delta) => {
      phi += delta * animationSpeed / 2;
      const lightMultiplier = MathUtils.clamp(MathUtils.mapLinear(MathUtils.radToDeg(phi), 0, 100, 1, 0.05), 0.05, 1);
      sunLight.intensity = lightMultiplier;
      ambientLight.intensity = lightMultiplier;
      theta += delta * animationSpeed;
      sunPosition = new Vector3().setFromSphericalCoords( 1, phi, theta );
      sunLight.position.setFromSphericalCoords( 1, phi, theta );
      sky.material.uniforms.sunPosition.value = sunPosition;
    })
  }
}
