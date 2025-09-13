import { simpleScene } from "src/scenes/0-simple";
import { lightScene } from 'src/scenes/1-light.ts';
import { terrainScene } from 'src/scenes/3-terrain.ts';
import { wireBridgesScene } from "./scenes/2-wirebridges";
import { initThree, resetScene } from "./setup-scene";
import "./style.css";

initThree();

const scenes = [
  simpleScene,
  lightScene,
  wireBridgesScene,
  terrainScene,
];


let currentSceneId = sceneIndexFromUrl();

scenes[currentSceneId]();
updateTitle();

// -------- scene switcher --------------------

document
  .querySelector(".previous")
  ?.addEventListener("click", () => stepScenes(-1));
document
  .querySelector(".next")
  ?.addEventListener("click", () => stepScenes(1));

document.addEventListener('keyup', (e) => {
  if (e.key == "ArrowLeft") stepScenes(-1);
  if (e.key == "ArrowRight") stepScenes(1);
}, false);

function stepScenes(step: number) {
  currentSceneId = sceneIndexFromUrl();
  if (currentSceneId + step < 0) currentSceneId = scenes.length - 1;
  else if (currentSceneId + step > scenes.length - 1) currentSceneId = 0;
  else currentSceneId += step;
  window.history.pushState({}, "", window.location.origin + "/" + currentSceneId);
  resetScene();
  scenes[currentSceneId]();
  updateTitle();
}

function updateTitle() {
  let title = scenes[currentSceneId].name.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
  title = title.replace("scene", "")
  document.querySelector("#scene-name")!.innerHTML = title;
  document.title = "ThreeJS Examples | " + title;
}

function sceneIndexFromUrl() {
  return Number(window.location.pathname.substring(1));
}

