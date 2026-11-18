import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../chatgpt-auth';
import { today } from '../core.mjs';

const headers = { 'Cache-Control': 'private, no-store' };
const cutoff = (date: string) => new Date(Date.parse(date+'T00:00:00Z') - 6*86400000).toISOString().slice(0,10);
const tools = [
 {name:'classecho_daily_context',description:'读取新加坡当天日期、已有日更状态和近期发布标题。每次准备前调用。',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'classecho_save_daily_draft',description:'把一条待人工审核的 ClassEcho 群消息保存到今天首页。若今日已有草稿则保留它。',inputSchema:{type:'object',required:['date','title','body','why'],properties:{
  date:{type:'string'},title:{type:'string'},body:{type:'string'},why:{type:'string'},
  sourceUrl:{type:'string'},publishDate:{type:'string'},eventDate:{type:'string'},sourceName:{type:'string'}
 },additionalProperties:false}},
 {name:'classecho_daily_failure',description:'记录当天准备失败的原因，供首页显示。',inputSchema:{type:'object',required:['date','reason'],properties:{date:{type:'string'},reason:{type:'string'}},additionalProperties:false}}
];
const content = (value: unknown, isError = false) => ({
 content:[{type:'text',text:JSON.stringify(value)}],...(isError?{isError:true}:{})
});
const clean=(s: unknown,max:number)=>typeof s==='string'?s.trim().slice(0,max):'';
const day = (value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;

export async function POST(request: Request) {
 let msg:any;
 try { msg=await request.json(); } catch { return Response.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Invalid JSON'}},{status:400,headers}); }
 const response=(result:unknown)=>Response.json({jsonrpc:'2.0',id:msg?.id??null,result},{headers});
 if(msg?.method==='server/discover')return response({supportedVersions:['2026-07-28'],capabilities:{tools:{}}});
 if(msg?.method==='tools/list')return response({tools});
 if(msg?.method!=='tools/call')return Response.json({jsonrpc:'2.0',id:msg?.id??null,error:{code:-32601,message:'Method not found'}},{headers});
 const user=await getChatGPTUser();
 if(!user||!env.DB)return response(content({error:!user?'登录身份缺失':'数据库未连接'},true));
 const db=env.DB;
 const date=today();
 const draftId='ce-daily-'+date;
 const failureId='ce-daily-failure-'+date;
 const args=msg.params?.arguments??{};
 const name=msg.params?.name;
 try {
  if(name==='classecho_daily_context'){
   const {results}=await db.prepare(`SELECT payload FROM records WHERE owner=?
     AND json_extract(payload,'$.deleted') IS NOT 1
     AND json_extract(payload,'$.type')='content'
     AND (id=? OR json_extract(payload,'$.data.status') IN ('已发布','已复盘'))
     ORDER BY updated DESC LIMIT 31`).bind(user.userId,draftId).all<{payload:string}>();
   const rows=results.map(r=>JSON.parse(r.payload));
   const existing=rows.find(r=>r.id===draftId);
   return response(content({date,timezone:'Asia/Singapore',savedDraft:existing?{id:draftId,title:existing.data.title,status:existing.data.status}:null,
    recentPublished:rows.filter(r=>r.id!==draftId).map(r=>({title:r.data.title,date:r.data.date,sourceUrl:r.data.sourceUrl||''}))}));
  }
  if(!tools.some(t=>t.name===name)||args.date!==date)return response(content({error:'操作或日期无效',date},true));
  const stamp=new Date().toISOString();
  if(name==='classecho_daily_failure'){
   const reason=clean(args.reason,300);
   if(!reason)return response(content({error:'请提供失败原因'},true));
   const record={id:failureId,type:'dailyStatus',data:{title:'今日草稿准备失败',date,reason}};
   await db.prepare(`INSERT INTO records(owner,id,payload,rev,mutation,updated) VALUES(?,?,?,1,?,?)
    ON CONFLICT(owner,id) DO UPDATE SET payload=excluded.payload,rev=records.rev+1,mutation=excluded.mutation,updated=excluded.updated`)
    .bind(user.userId,failureId,JSON.stringify(record),crypto.randomUUID(),stamp).run();
   return response(content({saved:true,date,status:'失败原因已保存'}));
  }
  const title=clean(args.title,120), body=clean(args.body,500), why=clean(args.why,240);
  const length=[...body.replace(/\s/gu,'')].length;
  if(!title||length<150||length>200||!why)return response(content({error:'需填写标题、理由及 150–200 字正文'},true));
  const sourceUrl=clean(args.sourceUrl,2000), publishDate=clean(args.publishDate,10), eventDate=clean(args.eventDate,10),sourceName=clean(args.sourceName,150);
  if(sourceUrl){
   let link:URL;
   try{link=new URL(sourceUrl);}catch{return response(content({error:'来源链接无效'},true));}
   if(link.protocol!=='https:'||link.username||link.password||!day(publishDate)||publishDate<cutoff(date)||publishDate>date||!sourceName||eventDate&&!day(eventDate))
    return response(content({error:'资讯需有 HTTPS 原文、来源名称及近七天发布日，事件日期可留空'},true));
  }else if(publishDate||eventDate||sourceName){
   return response(content({error:'来源字段应与原文链接一起填写；常青文案请留空'},true));
  }
  const data={title,body,why,date,timezone:'Asia/Singapore',groups:'三个微信群',origin:'每日准备',
   status:'草稿',kind:'日常话题',recommended:true,sourceUrl,sourceName,publishDate,eventDate,preparedAt:stamp,
   basis:sourceUrl?'近期热点':'运营假设',confirmation:'群消息需人工确认'};
  const record={id:draftId,type:'content',data};
  const result=await db.prepare('INSERT INTO records(owner,id,payload,rev,mutation,updated) VALUES(?,?,?,1,?,?) ON CONFLICT(owner,id) DO NOTHING')
    .bind(user.userId,draftId,JSON.stringify(record),crypto.randomUUID(),stamp).run();
  const stored=await db.prepare('SELECT payload FROM records WHERE owner=? AND id=?').bind(user.userId,draftId).first<{payload:string}>();
  if(!stored)return response(content({error:'保存后无法读回记录',date},true));
  const saved=JSON.parse(stored.payload);
  return response(content({saved:true,created:result.meta.changes>0,date,id:draftId,title:saved.data.title,status:saved.deleted?'已移除':saved.data.status}));
 }catch{return response(content({error:'写入或读取失败，请检查站点数据库后重试',date},true));}
}
