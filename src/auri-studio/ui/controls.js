import { icon, paintIcons } from "./icons.js";
import { cases } from "../scenes/context.js";

const modes = {
  turnaround:{name:"Turnaround",title:"Camera presets",icon:"orbit",default:"quarter",items:[
    ["front","Front","front"],["quarter","3/4","quarter"],["side","Side","side"],["back","Back","back"]
  ]},
  expressions:{name:"Expressions",title:"Facial expressions",icon:"smile",default:"happy",items:[
    ["happy","Happy","smile"],["thinking","Thinking","bubble"],["excited","Excited","spark"],
    ["surprised","Surprised","face"],["confident","Confident","target"],["winking","Winking","face"]
  ]},
  poses:{name:"Poses",title:"Key poses",icon:"poses",default:"welcome",items:[
    ["welcome","Welcome","hand"],["explaining","Explaining","bubble"],["growth","Growth","chart"],
    ["working","Working","laptop"],["support","Support","headset"],["idea","Idea","bulb"]
  ]},
  motion:{name:"Motion states",title:"Animation presets",icon:"pulse",default:"idle",items:[
    ["idle","Idle","face"],["greeting","Greeting","hand"],["thinking","Thinking","bulb"],
    ["talking","Talking","bubble"],["listening","Listening","headset"],["working","Working","laptop"],
    ["processing","Processing","pulse"],["celebrating","Celebrating","spark"],["pointing","Pointing","target"],
    ["floating","Floating showcase","orbit"]
  ]},
  cases:{name:"Use cases",title:"Business scenes",icon:"layers",default:"website",items:
    Object.entries(cases).map(([id,scene]) => [id,scene.name,scene.icon])
  }
};

const byId=id=>document.getElementById(id);
const stageState=byId("stage-state");
const engineStatus=byId("engine-status");
const tabs=byId("mode-tabs");
const content=byId("mode-content");
const cover=byId("scene-cover");
const overlay=byId("case-overlay");
const lighting=byId("lighting");
const pauseButton=byId("motion-toggle");
const reset=byId("reset");
const capture=byId("capture");
const zoomIn=byId("zoom-in");
const zoomOut=byId("zoom-out");
const presentation=byId("presentation");
const fullscreen=byId("fullscreen");
const canvasHost=byId("canvas-host");

export function createStudioControls(reducedMotion) {
  let scene;
  let available=false;
  let paused=reducedMotion;
  let spin=false;
  let displayMode="turnaround";
  let toastTimer;
  const selections=Object.fromEntries(Object.entries(modes).map(([id,mode])=>[id,mode.default]));
  const stage = byId("stage");
  const studio = byId("studio");
  paintIcons();
  tabs.setAttribute("role","tablist");
  content.setAttribute("role","tabpanel");
  tabs.innerHTML=Object.entries(modes).map(([id,mode])=>`<button type="button" class="mode-tab" role="tab" id="mode-${id}" data-mode="${id}" aria-controls="mode-content"><span>${icon(mode.icon)}</span>${mode.name}</button>`).join("");
  // Match the icon wrappers used elsewhere, including their selected color.
  tabs.querySelectorAll(".mode-tab > span").forEach(span=>span.setAttribute("data-icon",""));

  function toast(message){
    const el=byId("toast");
    el.textContent=message;
    el.hidden=false;
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{el.hidden=true;},3400);
  }

  function setStatus(message,live=false){
    engineStatus.innerHTML="<span></span>";
    engineStatus.append(message);
    engineStatus.classList.toggle("live",live);
  }

  function setStageState(left,right){
    const dot=document.createElement("b");
    stageState.replaceChildren(left,dot,right);
  }

  function updatePause(){
    pauseButton.setAttribute("aria-pressed",String(paused));
    pauseButton.innerHTML=`<span data-icon>${icon(paused?"play":"pause")}</span><span>${paused?"Play motion":"Pause motion"}</span>`;
  }

  function render(){
    const mode=modes[displayMode];
    const selection=selections[displayMode];
    tabs.querySelectorAll("button").forEach(tab=>{
      const active=tab.dataset.mode===displayMode;
      tab.setAttribute("aria-selected",String(active));
      tab.tabIndex=active ? 0 : -1;
      tab.disabled=!available;
    });
    content.setAttribute("aria-labelledby",`mode-${displayMode}`);
    content.innerHTML=`<h3 class="mode-title">${mode.title}</h3>
      <div class="preset-grid" data-mode="${displayMode}">${mode.items.map(([id,name,glyph])=>
        `<button type="button" class="preset${selection===id?" active":""}" data-choice="${id}" aria-pressed="${selection===id}" ${available?"":"disabled"}><span data-icon>${icon(glyph)}</span><span>${name}</span></button>`
      ).join("")}</div>${displayMode==="turnaround"?`<button type="button" class="switch-row" role="switch" aria-checked="${spin}" ${available?"":"disabled"} id="spin"><span class="switch-label"><span data-icon>${icon("repeat")}</span>Auto spin</span><span class="switch-track"></span></button>`:""}`;
    [reset,capture,zoomIn,zoomOut,pauseButton,lighting].forEach(element=>element.disabled=!available);
    updatePause();
  }

  function apply(){
    const value=selections[displayMode];
    const name=modes[displayMode].items.find(([id])=>id===value)?.[1];
    const useCase=displayMode==="cases"?cases[value]:null;
    const performance=useCase?.performance ?? (displayMode==="turnaround" ? {mode:"motion",value:"idle"} : {mode:displayMode,value});
    scene?.setPerformance(performance,useCase ? value : undefined);
    if (useCase) {
      overlay.innerHTML=`<span data-icon>${icon(useCase.icon)}</span><span class="case-kind">Business scene</span><strong>${useCase.title}</strong><p>${useCase.summary}</p><div class="case-detail">${useCase.detail}</div>`;
    }
    overlay.hidden=!useCase;
    setStageState(useCase?"Use case":"Showroom",displayMode==="turnaround"?"Idle":name);
    render();
  }

  function chooseMode(mode){
    if(displayMode===mode) return;
    displayMode=mode;
    apply();
  }

  tabs.addEventListener("click",event=>{
    const key=event.target.closest("[data-mode]")?.dataset.mode;
    if(key && available) chooseMode(key);
  });
  tabs.addEventListener("keydown",event=>{
    const keys=Object.keys(modes);
    const index=keys.indexOf(displayMode);
    const next={ArrowRight:(index+1)%keys.length,ArrowDown:(index+1)%keys.length,ArrowLeft:(index+keys.length-1)%keys.length,ArrowUp:(index+keys.length-1)%keys.length,Home:0,End:keys.length-1}[event.key];
    if(next===undefined || !available) return;
    event.preventDefault();
    chooseMode(keys[next]);
    byId(`mode-${keys[next]}`).focus();
  });

  content.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(!button || !available) return;
    if(button.id==="spin"){
      spin=!spin;
      scene.setSpin(spin);
      render();
      byId("spin").focus();
      return;
    }
    const choice=button.dataset.choice;
    if(!choice) return;
    selections[displayMode]=choice;
    if(displayMode==="turnaround"){
      spin=false;
      scene.setSpin(false);
      scene.setCamera(choice);
    }
    apply();
    content.querySelector(`[data-choice="${choice}"]`)?.focus();
  });

  function resetCamera(){
    spin=false;
    selections.turnaround="quarter";
    scene.setSpin(false);
    scene.setCamera("quarter",true);
    render();
  }
  reset.addEventListener("click",resetCamera);
  zoomIn.addEventListener("click",()=>scene.zoom(.85));
  zoomOut.addEventListener("click",()=>scene.zoom(1.18));
  lighting.addEventListener("change",()=>scene.setLighting(lighting.value));

  pauseButton.addEventListener("click",()=>{
    paused=!paused;
    scene.setPaused(paused);
    updatePause();
  });

  function togglePresentation(){
    const showing=studio.classList.toggle("is-presentation");
    presentation.setAttribute("aria-pressed",String(showing));
    presentation.title=showing?"Return to motion lab":"Enter presentation mode";
    presentation.setAttribute("aria-label",presentation.title);
    presentation.querySelector(".presentation-label").textContent=showing?"Motion lab":"Presentation";
  }
  presentation.setAttribute("aria-label","Enter presentation mode");
  presentation.addEventListener("click",togglePresentation);
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&studio.classList.contains("is-presentation")) togglePresentation();
  });
  fullscreen.addEventListener("click",async()=>{
    try{
      if(document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }catch{
      if(!studio.classList.contains("is-presentation")) togglePresentation();
      toast("Presentation mode active. Fullscreen is unavailable here.");
    }
  });
  document.addEventListener("fullscreenchange",()=>{
    const active=Boolean(document.fullscreenElement);
    fullscreen.title=active?"Exit fullscreen":"Fullscreen";
    fullscreen.setAttribute("aria-label",fullscreen.title);
    fullscreen.innerHTML=`<span data-icon>${icon(active?"minimize":"maximize")}</span>`;
  });

  capture.addEventListener("click",async()=>{
    capture.disabled=true;
    try{
      const blob=await scene.capture();
      if(!blob) throw new Error("Capture unavailable");
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=url;
      link.download="Auri-Studio-Capture.png";
      link.click();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
      toast("PNG captured");
    }catch{
      toast("The capture could not be saved.");
    }finally{
      capture.disabled=!available;
    }
  });

  function fallback(message){
    available=false;
    overlay.hidden=true;
    canvasHost.hidden=true;
    cover.hidden=false;
    cover.classList.add("fallback");
    const image=document.createElement("img");
    image.src="./assets/auri-poster.webp";
    image.alt="Auri standing on the showroom platform";
    const title=document.createElement("strong");
    title.textContent="Static showroom preview";
    const text=document.createElement("p");
    text.textContent=message;
    cover.replaceChildren(image,title,text);
    byId("stage-help").hidden=true;
    setStatus("Reference view");
    setStageState("Showroom","Reference");
    render();
  }

  function ready(value){
    scene=value;
    available=true;
    canvasHost.hidden=false;
    cover.hidden=true;
    byId("stage-help").hidden=false;
    setStatus("WebGL live",true);
    apply();
  }

  render();
  return {
    ready,
    fallback,
    onOrbit(){
      if (selections.turnaround===null) return;
      selections.turnaround=null;
      content.querySelectorAll(".preset.active").forEach(button=>{
        if(displayMode!=="turnaround") return;
        button.classList.remove("active");
        button.setAttribute("aria-pressed","false");
      });
    },
    resetCamera:()=>available&&resetCamera(),
    restore:()=>scene&&ready(scene),
    lost:()=>fallback("The graphics context was interrupted. The studio will restore when WebGL is available.")
  };
}
