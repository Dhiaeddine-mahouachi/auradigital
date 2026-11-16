const channels = new Map();
const subscribers = new Set();

function channel(scope) {
 if (!channels.has(scope)) channels.set(scope,{active:new Map(), outcome:'idle', timer:null});
 return channels.get(scope);
}

function notify(scope) {
 const state=channel(scope);
 const phase=[...state.active.values()].at(-1)?.phase||state.outcome;
 for (const subscriber of subscribers) subscriber(scope,phase);
}

export function watchAuri(scope, listener) {
 const subscriber=(key,phase)=>{if(key===scope)listener(phase);};
 subscribers.add(subscriber);
 notify(scope);
 return ()=>subscribers.delete(subscriber);
}

export function pulseAuri(scope, phase, duration=1800) {
 const state=channel(scope);
 clearTimeout(state.timer);
 state.outcome=phase;
 notify(scope);
 state.timer=setTimeout(()=>{
  state.outcome='idle';
  notify(scope);
  if(!state.active.size)channels.delete(scope);
 },duration);
}

export async function runAuri(scope,phase,operation,success='success') {
 const state=channel(scope);
 const token=Symbol();
 const job={phase,completed:false};
 const latest=()=>[...state.active.keys()].at(-1)===token;
 state.active.set(token,job);
 clearTimeout(state.timer);
 state.outcome='idle';
 const typing=phase==='working'?setTimeout(()=>{
  if(!job.completed){job.phase='typing';notify(scope);}
 },420):null;
 notify(scope);
 try {
  const result=await operation();
  if(latest())pulseAuri(scope,success);
  return result;
 } catch(error) {
  if(latest())pulseAuri(scope,'error');
  throw error;
 } finally {
  job.completed=true;
  clearTimeout(typing);
  state.active.delete(token);
  notify(scope);
  if(!state.active.size&&state.outcome==='idle')channels.delete(scope);
 }
}
