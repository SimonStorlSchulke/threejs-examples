import { terrainScene } from 'src/scenes/3-terrain.ts';
import { terrainInfiniteScene } from 'src/scenes/4-terrain-infinite.ts';
import { initThree, resetScene } from "./setup-scene";
import "./style.css";

initThree();

const scenes = [
  terrainInfiniteScene,
  terrainScene,
];


let currentSceneId = sceneIndexFromUrl();

stepScenes(0)

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
  console.log(window.location.pathname + "?scene=" + currentSceneId)
  window.history.pushState({}, "", window.location.pathname + "?scene=" + currentSceneId);
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
  return Number(window.location.search.split('scene=')[1] ?? 0);
}

