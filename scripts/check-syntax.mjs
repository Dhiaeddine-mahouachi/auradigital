import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const excluded=new Set(['node_modules','.git','.wrangler','.vscode']);
let count=0;async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(excluded.has(entry.name))continue;const path=dir+'/'+entry.name;if(entry.isDirectory())await walk(path);else if(/\.(js|mjs)$/.test(entry.name)){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status){console.error(result.stderr);process.exitCode=1;}count++;}}}await walk('.');console.log(`Syntax checked ${count} JavaScript files.`);
