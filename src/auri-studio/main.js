import { createShowroom } from "./scenes/showroom.js";
import { createStudioControls } from "./ui/controls.js";

const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ui=createStudioControls(reduceMotion);
const viewport=document.getElementById("canvas-host");

async function launch() {
  try {
    const showroom=await createShowroom(viewport,{
      reducedMotion:reduceMotion,
      onLost:ui.lost,
      onRestored:ui.restore,
      onOrbit:ui.onOrbit,
      onReset:ui.resetCamera
    });
    ui.ready(showroom);
  } catch (error) {
    console.warn("Auri 3D initialization:",error);
    ui.fallback("Live 3D needs WebGL 2. Open the studio in a browser with hardware acceleration enabled.");
  }
}

launch();
