import { addFrameCallback } from "./setup-scene";

export function drawFps() {
  const fpsDisplay = document.createElement("span");
  fpsDisplay.classList.add("fps");
  document.body.append(fpsDisplay);
  
    let lastUpdate = 0;

  addFrameCallback((delta: number) => {
    lastUpdate -= delta;

    if(lastUpdate < 0) {
        lastUpdate = 0.2;
        const fps = (1 / delta).toFixed();
        fpsDisplay.innerText = `FPS: ${fps}`;
    }

  });
}
