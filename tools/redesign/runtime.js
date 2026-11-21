// Minimal renderer for AuraDigital redesign pages.
// Templates are pre-parsed at build time into [tag, attrs, children] trees;
// each component class supplies renderVals() exactly as in the design files.
import { h, Component, Fragment } from 'preact';

export const registry = {};

export class DCLogic extends Component {
  render() {
    const vals = this.renderVals ? this.renderVals() : {};
    return h(Fragment, null, ...buildAll(this.constructor.__tree, vals));
  }
}

export function def(name, tree, factory) {
  const cls = factory(DCLogic);
  cls.__tree = tree;
  cls.displayName = name;
  registry[name] = cls;
  return cls;
}

const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
const WHOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;

function lookup(path, scope) {
  if (path === 'true') return true;
  if (path === 'false') return false;
  if (path === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  if (/^'.*'$/.test(path)) return path.slice(1, -1);
  let cur = scope;
  for (const part of path.split('.')) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function interp(str, scope) {
  const whole = str.match(WHOLE);
  if (whole) return lookup(whole[1], scope);
  return str.replace(HOLE, (_, p) => { const v = lookup(p, scope); return v == null ? '' : String(v); });
}

const BOOL = new Set(['autoplay', 'muted', 'loop', 'playsinline', 'novalidate', 'checked', 'disabled', 'hidden', 'required', 'open', 'readonly', 'multiple', 'selected']);
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function buildAll(nodes, scope) {
  const out = [];
  for (const n of nodes || []) {
    const r = build(n, scope);
    if (Array.isArray(r)) out.push(...r); else if (r != null && r !== false) out.push(r);
  }
  return out;
}

function build(node, scope) {
  if (typeof node === 'string') {
    const v = interp(node, scope);
    return v == null || v === false ? null : String(v);
  }
  const [tag, attrs, children] = node;
  if (tag === 'helmet') return null;
  if (tag === 'sc-if') return interp(attrs.value || '', scope) ? buildAll(children, scope) : null;
  if (tag === 'sc-for') {
    const list = interp(attrs.list || '', scope) || [];
    const as = attrs.as || 'item';
    const out = [];
    list.forEach((item, i) => out.push(...buildAll(children, { ...scope, [as]: item, $index: i })));
    return out;
  }
  if (tag === 'dc-import') {
    const C = registry[attrs.name];
    if (!C) return null;
    const props = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'name' || k.startsWith('hint-')) continue;
      props[camel(k)] = interp(v, scope);
    }
    return h(C, props);
  }
  const props = {};
  const formField = tag === 'input' || tag === 'textarea';
  for (const [k, raw] of Object.entries(attrs)) {
    let v = interp(raw, scope);
    let name = k;
    if (/^on[A-Z]/.test(k)) {
      if (k === 'onChange' && formField && attrs.type !== 'checkbox' && attrs.type !== 'radio') name = 'onInput';
      if (typeof v !== 'function') continue;
    } else if (BOOL.has(k.toLowerCase())) {
      if (raw === '' || raw === k) v = true;
      else v = !!v && v !== 'false';
      if (!v) continue;
    }
    props[name] = v;
  }
  return h(tag, props, ...buildAll(children, scope));
}
