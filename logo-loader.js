// The original GD animation uses these SVG masks, paths, easing and 24-unit join.
// Scale its 4-second reveal to 3 seconds for the homepage loading screen.
(() => {
  const loader = document.getElementById("landingLoader");
  const find = selector => loader.querySelector(selector);
  const pD = find("[data-d-stroke]");
  const pG = find("[data-g-stroke]");
  const fD = find("[data-d-fill]");
  const fG = find("[data-g-fill]");
  const D = find("[data-d-part]");
  const G = find("[data-g-part]");
  const offset = 24;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const clamp = value => Math.max(0, Math.min(1, value));
  const start = performance.now();
  function frame(now) {
    if (!loader.isConnected || loader.classList.contains("is-done")) return;
    const t = Math.min(4000, (now - start) * (4 / 3));
    pD.style.strokeDashoffset = 1 - ease(clamp(t / 1400));
    pG.style.strokeDashoffset = 1 - ease(clamp((t - 1400) / 1400));
    fD.setAttribute("opacity", clamp((t - 1200) / 200));
    fG.setAttribute("opacity", clamp((t - 2600) / 200));
    const join = t < 3100 ? 0 : back(clamp((t - 3100) / 900));
    D.setAttribute("transform", `translate(0,${offset - offset * join})`);
    G.setAttribute("transform", `translate(0,${-offset + offset * join})`);
    if (t < 4000) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
