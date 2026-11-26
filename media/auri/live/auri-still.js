import { AURI_LAYERS } from '../studio-v1/layers.js';

export const AURI_ART = '/media/auri/studio-v1/';
const HEAD_VIEW = '55 15 290 186';
const BODY_VIEW = '0 0 400 460';
const parts = Object.values(AURI_LAYERS);
const left = Math.min(...parts.map(([x]) => x));
const top = Math.min(...parts.map(([, y]) => y));
const right = Math.max(...parts.map(([x, , width]) => x + width));
const bottom = Math.max(...parts.map(([, y, , height]) => y + height));
const fullBounds = [left, top, right - left, bottom - top];

export function displayLevel(level, variant) {
  if (variant === 'face' || variant === 'avatar') return 1;
  const value = Number.isInteger(level) && level >= 1 && level <= 7 ? level : 1;
  return variant === 'login' || variant === 'guide' ? Math.max(6, value) : value;
}

export const auriViewBox = level => level === 1 ? HEAD_VIEW : BODY_VIEW;

function image(name, [x, y, width, height]) {
  return `<image href="${AURI_ART}${name}.webp" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`;
}

function stillParts(level) {
  if (level >= 3) return image('full', fullBounds);
  const avatar = image('avatar', AURI_LAYERS.head);
  return level === 2 ? image('body', AURI_LAYERS.body) + avatar : avatar;
}

export function auriStill(level) {
  return `<svg class="auri-still" width="40" height="40" viewBox="${auriViewBox(level)}" aria-hidden="true" focusable="false">${stillParts(level)}</svg>`;
}

export function updateAuriStill(svg, level) {
  if (!svg) return;
  svg.setAttribute('viewBox', auriViewBox(level));
  svg.innerHTML = stillParts(level);
}
