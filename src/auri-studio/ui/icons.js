const paths = {
  layout:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M6.5 8h5"/>',
  maximize:'<path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/>',
  minimize:'<path d="M4 8h4V4m12 4h-4V4M8 20v-4H4m12 4v-4h4"/>',
  camera:'<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.5"/>',
  cube:'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5M3 7l9 5v10"/>',
  reset:'<path d="M3 12a9 9 0 1 1 2.5 6.2M3 12V5m0 7h7"/>',
  hand:'<path d="M7.5 12V6a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v5-2a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-2a5 5 0 0 1-4-2l-4-5a1.5 1.5 0 0 1 2.2-2Z"/>',
  minus:'<path d="M5 12h14"/>',
  plus:'<path d="M5 12h14m-7-7v14"/>',
  sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="2" fill="currentColor" stroke="none"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  face:'<rect x="3" y="5" width="18" height="14" rx="5"/><path d="M8 10v2m8-2v2m-6 3q2 2 4 0M3 10H1m20 0h2"/>',
  orbit:'<ellipse cx="12" cy="12" rx="10" ry="4.6" transform="rotate(-34 12 12)"/><circle cx="12" cy="12" r="3"/><circle cx="19.4" cy="6.6" r="1.5" fill="currentColor" stroke="none"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 10h.01m8-.01h.01M8 14a4.8 4.8 0 0 0 8 0"/>',
  poses:'<circle cx="12" cy="4.5" r="2"/><path d="M4.5 8 8 12l4-2 4 2 3.5-4M12 10v5m0 0-4 5m4-5 4 5"/>',
  pulse:'<path d="M2 12h5l3-7 4 14 3-7h5"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  front:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/>',
  quarter:'<path d="m12 3 8 4v10l-8 4-8-4V7l8-4Zm0 0v18m0-11 8-3"/>',
  side:'<rect x="7" y="4" width="10" height="16" rx="2"/><path d="M11 8v8"/>',
  back:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 12h6"/>',
  repeat:'<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/>',
  spark:'<path d="M12 2c0 6-3 9-9 10 6 1 9 4 9 10 1-6 4-9 9-10-5-1-8-4-9-10Z"/>',
  bubble:'<path d="M20 15a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M7 11h.01m4.99 0h.01m4.99 0h.01"/>',
  chart:'<path d="M4 4v16h16M8 16v-3m4 3V9m4 7V6"/>',
  laptop:'<rect x="5" y="4" width="14" height="12" rx="2"/><path d="M2 17h20l-1 3H3l-1-3Z"/>',
  headset:'<path d="M4 13v-2a8 8 0 0 1 16 0v6a3 3 0 0 1-3 3h-3"/><rect x="3" y="10" width="4" height="7" rx="1.5"/><rect x="17" y="10" width="4" height="7" rx="1.5"/>',
  bulb:'<path d="M9 18h6m-5 3h4M8 15c0-1-3-2-3-6a7 7 0 1 1 14 0c0 4-3 5-3 6"/>',
  heart:'<path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6l1.2 1.2 7.6 7.6 7.6-7.6 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  window:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 7h.01m2.99 0h.01"/>',
  pause:'<path d="M9 5v14m6-14v14"/>',
  play:'<path d="m9 5 11 7-11 7V5Z"/>',
};

export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.cube}</svg>`;
}

export function paintIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(element => {
    element.innerHTML = icon(element.dataset.icon);
  });
}
