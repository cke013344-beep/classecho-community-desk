import {createRequire} from 'node:module';
const {build}=createRequire(import.meta.resolve('drizzle-kit'))('esbuild');
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const result=await build({entryPoints:['local-entry.tsx'],bundle:true,minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},write:false});
const css=readFileSync('app/globals.css','utf8');
const js=result.outputFiles[0].text.replaceAll('</script','<\\/script');
const directory=process.argv[2];if(!directory)throw Error('Pass an absolute output directory');mkdirSync(directory,{recursive:true});
writeFileSync(directory+'/ClassEcho-本地备用版.html','<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ClassEcho 社群运营工作台 · 本地备用版</title><style>'+css+'</style></head><body><div id="root"></div><script>'+js+'</script></body></html>');
