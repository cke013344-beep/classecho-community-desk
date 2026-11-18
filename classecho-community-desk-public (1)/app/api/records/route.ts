import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {validRecord} from '../../core.mjs';
const headers={'Cache-Control':'no-store'};
const json=(v:unknown,status=200)=>Response.json(v,{status,headers});
export async function GET(){
 const user=await getChatGPTUser();if(!user)return json({error:'请先登录'},401);
 if(!env.DB)return json({error:'数据库未连接'},503);
 const rows=await env.DB.prepare('SELECT id,payload,rev,updated FROM records WHERE owner=?').bind(user.userId).all();
 return json({records:rows.results.map((r:any)=>({...JSON.parse(r.payload),id:r.id,rev:r.rev,updated:r.updated}))});
}
export async function POST(req:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'请先登录'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'来源不符'},403);
 if(!env.DB)return json({error:'数据库未连接'},503);
 if(Number(req.headers.get('content-length')||0)>120000)return json({error:'记录过大'},413);
 let body:any;try{body=await req.json()}catch{return json({error:'无效 JSON'},400)}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'无效 JSON'},400);
 const {record,base,mutation}=body;
 if(!validRecord(record)||JSON.stringify(record).length>100000||!Number.isSafeInteger(base)||base<0||typeof mutation!=='string'||mutation.length>100)return json({error:'记录格式不正确'},400);
 const old:any=await env.DB.prepare('SELECT payload,rev,mutation,updated FROM records WHERE owner=? AND id=?').bind(user.userId,record.id).first();
 if(old?.mutation===mutation)return json({record:{...JSON.parse(old.payload),rev:old.rev,updated:old.updated}});
 if(!old&&base!==0)return json({remote:{id:record.id,type:record.type,data:{title:'远端暂无此记录'},rev:0,deleted:true}},409);
 const payload=JSON.stringify({id:record.id,type:record.type,data:record.data,deleted:!!record.deleted});
 const now=new Date().toISOString();
 // Compare-and-swap prevents a concurrent writer from silently replacing another version.
 const row:any=await env.DB.prepare('INSERT INTO records(owner,id,payload,rev,mutation,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(owner,id) DO UPDATE SET payload=excluded.payload,rev=excluded.rev,mutation=excluded.mutation,updated=excluded.updated WHERE records.rev=excluded.rev-1 RETURNING payload,rev,updated').bind(user.userId,record.id,payload,base+1,mutation,now).first();
 if(!row){
  const remote:any=await env.DB.prepare('SELECT payload,rev,mutation,updated FROM records WHERE owner=? AND id=?').bind(user.userId,record.id).first();
  if(!remote)return json({error:'远端记录已变化，请重新同步'},409);
  const current={...JSON.parse(remote.payload),rev:remote.rev,updated:remote.updated};
  return remote.mutation===mutation?json({record:current}):json({remote:current},409);
 }
 return json({record:{...JSON.parse(row.payload),rev:row.rev,updated:row.updated}});
}
