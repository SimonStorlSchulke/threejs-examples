import './style.css'
import * as THREE from 'three';
export type FrameCallback = (delta: number, time: number) => void;

export let SCENE = new THREE.Scene();
export let CAMERA: THREE.PerspectiveCamera;
export let RENDERER = new THREE.WebGLRenderer();

export let clock = new THREE.Clock();

let frameCallbacks: FrameCallback[] = [];
let sceneSwitchCallBacks: (() => void)[] = [];


export function resetScene() {
    frameCallbacks = [];
    for (const callback of sceneSwitchCallBacks) {
        callback();
    }
    SCENE.clear();
    CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    CAMERA.position.z = 10;
    RENDERER.toneMapping = THREE.NoToneMapping;
    RENDERER.setClearColor(0x111111);
    clock.start();
    document.querySelector('#ui-elements')!.innerHTML = '';
}

resetScene();

export function initThree() {
    updateRendererSize();
    window.addEventListener("resize", updateRendererSize)
    RENDERER.setAnimationLoop(animate);
    document.body.appendChild(RENDERER.domElement);
}

export function addFrameCallback(callback: FrameCallback) {
    frameCallbacks.push(callback);
}

export function addSceneSwitchCallback(callback: () => void) {
    sceneSwitchCallBacks.push(callback);
}

function animate() {
    const delta = clock.getDelta();
    for (const callback of frameCallbacks) {
        callback(delta, clock.getElapsedTime());
    }
    RENDERER.render(SCENE, CAMERA);
}


function updateRendererSize() {
    RENDERER.setSize( window.innerWidth, window.innerHeight );
    RENDERER.setPixelRatio(0.3)
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
}
