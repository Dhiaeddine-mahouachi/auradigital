import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export function stagingConfig(production,{databaseId,hostname},root) {
 if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(databaseId||'')||production.d1_databases.some(d=>d.database_id===databaseId))throw new Error('Supply a distinct staging D1 database ID; production IDs are forbidden.');
 if(!/^[a-z0-9-]*staging[a-z0-9-]*\.auradigitalworks\.com$/.test(hostname||''))throw new Error('Supply an explicitly designated staging subdomain of auradigitalworks.com.');
 const config=structuredClone(production);
 config.name='auradigital-growth-staging';config.main=resolve(root,production.main);config.assets.directory=root;
 config.d1_databases=production.d1_databases.map(d=>({...d,database_id:databaseId,database_name:'auradigital-growth-staging-db',migrations_dir:resolve(root,d.migrations_dir)}));
 config.routes=[{pattern:hostname,custom_domain:true}];config.workers_dev=false;config.preview_urls=false;
 config.ratelimits=config.ratelimits.map(r=>({...r,namespace_id:String(Number(r.namespace_id)+1000000)}));
 config.vars={GROWTH_OS_ENABLED:'true',CUSTOMER_IDENTITY_ENABLED:'true',CUSTOMER_AUTH_ORIGIN:'https://'+hostname,GOOGLE_LOGIN_ENABLED:'false',CUSTOMER_EMAIL_ENABLED:'false',AI_PROVIDER:'disabled'};
 delete config.ai;delete config.triggers;config.build={...config.build,cwd:root};
 return config;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const args=process.argv.slice(2),get=key=>args[args.indexOf(key)+1];
 if(!args.includes('--database-id')||!args.includes('--hostname'))throw new Error('Required: --database-id <distinct staging UUID> --hostname <staging subdomain>. This command only writes a local config.');
 const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),production=JSON.parse(await readFile(resolve(root,'wrangler.jsonc'),'utf8'));
 const config=stagingConfig(production,{databaseId:get('--database-id'),hostname:get('--hostname')},root);
 await mkdir(resolve(root,'.wrangler'),{recursive:true});await writeFile(resolve(root,'.wrangler/growth-staging.json'),JSON.stringify(config,null,2)+'\n',{mode:0o600});
 console.log('Prepared local staging config in .wrangler/growth-staging.json. No database, domain or deployment was changed. Verify the staging account, database and backups before using it.');
}
