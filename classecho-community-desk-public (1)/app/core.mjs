import { OPERATING_TIMEZONE } from './news.mjs';
export { OPERATING_TIMEZONE };
export const TYPES=['task','content','knowledge','followup','group','member','result','reward','script','column','hotspot','review','day','dailyStatus'];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:OPERATING_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const uid=()=>crypto.randomUUID();
export function validRecord(r){return !!r&&typeof r==='object'&&typeof r.id==='string'&&/^[\w-]{1,100}$/.test(r.id)&&!['__proto__','constructor','prototype'].includes(r.id)&&TYPES.includes(r.type)&&r.data&&typeof r.data==='object'&&!Array.isArray(r.data)&&typeof r.data.title==='string'&&r.data.title.trim().length>0&&r.data.title.length<=1000&&Object.values(r.data).every(v=>v===null||typeof v==='boolean'||(typeof v==='number'&&Number.isFinite(v))||(typeof v==='string'&&v.length<=20000))}
export function parseBackup(text){if(text.length>10000000)throw Error('备份超过10MB，请拆分或联系维护者');const v=JSON.parse(text);if(v.version!==1||!Array.isArray(v.records)||v.records.length>20000||!v.records.every(validRecord)||new Set(v.records.map(x=>x.id)).size!==v.records.length)throw Error('不是有效的 ClassEcho v1 备份');return v}
export const live=(rows,t)=>Object.values(rows).filter(r=>!r.deleted&&r.type===t);
export const seed=()=>[
 ...[1,2,3].map(n=>({id:'group-'+n,type:'group',data:{title:'微信群 '+n,platform:'微信',position:'待补充定位',timezone:OPERATING_TIMEZONE,notes:'现有社群占位；请填写实际名称、成员特征和主要时区。'}})),
 {id:'product-initial',type:'knowledge',data:{title:'产品初步价值（待核实上线范围）',category:'产品功能',body:'实时双语字幕、课堂记录、总结及复习辅助。具体上线范围、使用条件、套餐及活动权益尚待最新资料确认。',source:'用户提供的初始需求',status:'待确认',scope:'仅供内部规划',date:today()}},
 ...['每周资讯','使用技巧','课堂闲聊','答疑','反馈进展'].map((title,i)=>({id:'column-'+i,type:'column',data:{title,status:'启用',notes:'按需排期，不要求每日发布'}})),
 ...[
 ['欢迎','欢迎加入～这里会分享听课、复习和学习生活的实用内容。我是 ClassEcho 团队运营，有问题可以群里聊，也可以私下提交。潜水、只阅读都没关系，不需要自我介绍或打卡。'],
 ['使用答疑','可以先说一下使用设备、想完成的步骤和卡住的位置；请遮住姓名、课程及其他个人信息。我会先核对已确认教程，无法确认的地方带给团队处理。'],
 ['问题跟进','想跟进一下上次的问题：现在解决了吗？不方便回复也没关系，我会把当前进展记录下来，有新消息再联系你。'],
 ['自然接话','谢谢你把不顺手的地方说出来，这类反馈也很有价值。方便的话可以私下补充具体步骤，我会去标识后整理给团队。'],
 ['福利说明','福利需要以团队确认的活动规则为准。目前未确认的名额、权益和有效期，我先不作领取承诺，确认后再说明。'],
 ['套餐沟通','先看看你近期有没有课程、预计怎么使用，再核对最新套餐和适用条件；我会发已确认的入口，不急着作决定。']
 ].map(([title,body],i)=>({id:'script-'+i,type:'script',data:{title,category:title,body,notes:'建议话术，可编辑；不代表官方规则'}}))
];
const BANK=[
 ['课后先留三个关键词','整理课堂记录时，不一定要马上重写整节课。可以先留三个关键词，再各用一句话说清它们的关系；说不清的部分就是下次复习的入口。今天如果很累，只标出一个没听明白的地方也可以，留给之后慢慢补。'],
 ['把笔记变成一个小问题','复习时可以试试：从今天的笔记里选一个概念，改写成一个能用自己的话回答的小问题。先合上笔记说一遍，再回去查缺的部分。只做这一题也算一次有效整理，不用把整节课重新抄一遍。'],
 ['听漏一段，先做个标记','课堂上漏掉一段时，可以先记下当时的关键词或时间位置，继续跟上后面的内容。课后再对照允许使用的课程资料补上这一处，避免为了追一个句子又漏掉下一段。今天只需要挑一个最想弄懂的点就好。'],
 ['复习从最困惑的一处开始','打开一份很长的课堂笔记时，可以先圈出最困惑的一处，写下自己目前的理解，再对照课程资料核实。整理不必一次做完：把一个模糊概念说清楚，也是在往前走。需要帮忙梳理的话，可以只发去掉个人信息的关键词。'],
 ['下节课前，给自己一个入口','下一节课前留三分钟，看看上次笔记的标题，再写下一件想在课堂上弄清的事。听课时有一个小入口，记录也更容易找到重点。不用预习完全部材料，先选最相关的一小段就可以。'],
 ['给复习留一个结束点','今天复习前，可以先定一个很小的结束点：解释一个概念，或补齐一段没听懂的记录。完成之后就停下来休息。任务不一定越长越有效，把问题拆小，也方便下次接着做。']
];
const CHATS=[
 ['给今天的学习留一点空白','课表很满的时候，学习之外留一点空白也很正常。吃顿热饭、走一小段路，或者今天只安静看群，都可以。这里不需要每天交作业，也不用把每一次状态都变成成果。希望这条消息刚好给你一点缓冲。'],
 ['课间的小小充电时间','课间那几分钟，偶尔把视线从屏幕上挪开，喝口水、看看窗外，也是很好的暂停。如果今天不想聊天，读到这里就可以了。这个群也留给安静休息的人，不需要为了参与而勉强自己发言。'],
 ['学习生活里的一点小确幸','有时让一天好过一点的，是很小的事情：找到安静座位、吃到喜欢的饭，或者终于看懂一个概念。如果你想聊，欢迎随手留下一件小事；也可以把它留给自己，不需要整理成完整的分享。']
];
export function freshSources(rows,date=today()){
 const end=Date.parse(date+'T00:00:00+08:00');
 return live(rows,'hotspot').filter(({data:d})=>{
  const age=(end-Date.parse(d.publishDate+'T00:00:00+08:00'))/86400000;
  return d.verified==='已核实'&&age>=0&&age<7&&d.publishDate<=date&&d.eventDate&&d.queried
   &&/^https:\/\//.test(d.url||'')&&d.summary?.trim();
 }).sort((a,b)=>b.data.publishDate.localeCompare(a.data.publishDate));
}
export function blockers(rows){const k=live(rows,'knowledge');const confirmed=k.filter(x=>x.data.status==='已确认'&&(!x.data.validUntil||x.data.validUntil>=today()));const map={};for(const x of confirmed.filter(x=>/套餐|活动/.test(x.data.category||''))){const key=x.data.category+':'+x.data.title; (map[key]??=[]).push(x)}return Object.values(map).filter(xs=>new Set(xs.map(x=>x.data.body)).size>1).map(xs=>xs[0].data.title)}
export function generate(rows,date=today(),budget=75){
 const published=live(rows,'content').filter(x=>['已发布','已复盘'].includes(x.data.status));
 const history=published.map(x=>x.data.title);
 const source=freshSources(rows,date).find(x=>!published.some(post=>post.data.sourceUrl===x.data.url));
 const sourceLabel=source?'已核实线索：'+source.data.title:'今日无需追热点 · 可先使用常青建议';
 const ordinal=Math.floor(new Date(date+'T00:00:00Z').getTime()/86400000);
 const choose=(bank)=>[...bank.slice(ordinal%bank.length),...bank.slice(0,ordinal%bank.length)]
  .find(x=>!history.includes(x[0])&&!published.some(p=>p.data.body===x[1]))
  ||['待补充：换一个具体课堂场景','现有模板已用过。请补充一个尚未分享的学习卡点，再编写本条。'];
 const [at,ab]=choose(BANK),[bt,bb]=choose(CHATS);
 const issues=live(rows,'followup').filter(x=>x.data.status!=='已完成');
 const feedback=live(rows,'knowledge').find(x=>x.data.status==='已确认'&&(!x.data.validUntil||x.data.validUntil>=date)&&x.data.category==='用户痛点');
 const target=live(rows,'group').map(x=>x.data.title).join('、')||'现有微信群';
 const confirmed=live(rows,'knowledge').filter(x=>x.data.status==='已确认'&&(!x.data.validUntil||x.data.validUntil>=date)&&x.data.category==='产品功能');
 const safeFact=confirmed[0];
 const cases=[['在下一次真实使用前，先核对条件','准备把课堂辅助工具用到下一次课之前，先核对三件事：课程是否允许、设备和语言是否适配、课后希望留下什么。先选一个具体任务，再按已确认教程试一次。卡住时可以私下提交问题；公开分享完全自愿，合理批评也欢迎。'],['需要帮助时，从一个具体步骤开始','想判断工具能不能帮上忙，可以先说清一个具体任务，比如课后想找回哪个知识点。遇到问题不需要写长篇体验，只说卡住的步骤就够了。可以私下提交、通过已配置的匿名入口反馈，或自愿公开交流；不必为了参与而分享个人经历。']];
 const [ct,cb]=choose(cases);
 const lastAction=live(rows,'result').filter(x=>x.data.date<date&&x.data.next?.trim())
  .sort((a,b)=>b.data.date.localeCompare(a.data.date)||String(b.updated||'').localeCompare(String(a.updated||'')))[0];
 const base={date,time:'18:00',timezone:OPERATING_TIMEZONE,groups:target,status:'草稿',goal:'帮助成员解决一个具体学习问题',kind:'日常话题',minutes:Math.min(15,Math.floor(budget/4)),audience:'近期有课程或需要整理课堂记录的成员；发布前核对各群定位',basis:feedback?'真实反馈':'运营假设',basisDetail:feedback?'已确认痛点：'+feedback.data.title:'常青学习建议；尚未验证本群需求',why:issues.length?'有未完成跟进，优先给问题留出回复时间':'尚无已记录的高频问题，先提供低成本、可选择阅读的帮助',need:'让学习任务更具体，减少额外参与负担',product:'无需提产品',image:'不必配图；有人需要时再做单页步骤图',participation:'阅读即可；也可私下提交去标识反馈，公开分享自愿。匿名入口需先配置。',complaint:'听起来这一点确实让你很困扰，谢谢你直说；我们可以先把卡住的地方弄清楚。',help:'可以先说一个卡住的步骤吗？不方便公开的话可以私下提交，我会核对后跟进。',share:'谢谢你补充具体做法；如果要整理给其他成员，我会先征求你的同意。',silence:'无需追问或补福利；保留内容，按约定时段查看问题，无反馈记为结果未知。',entry:'无；出现相关求助后再提供已确认教程入口',measure:'具体求助、问题解决确认及真实使用；无反馈不等于无价值',confirmation:'无需团队审批的日常建议；发布前人工核对',reuse:'三群共用文案，只按反馈调整；小红书仅作为素材复用草稿'};
 const c=[{...base,title:at,category:'A · 实用价值',body:ab},{...base,title:bt,category:'B · 轻松交流',body:bb,product:'不提产品',goal:'提供低压力交流空间'}, {...base,title:ct,category:'C · 适用时机',body:cb,product:safeFact?'仅供内部核对已确认功能：'+safeFact.data.title+'；文案不自动扩展功能承诺':'产品上线范围未确认，不写成功案例或功能承诺'}];
 const reminders=['下次上课前，想提前核对音源或入口的话，可以来找我～','近期有课、正好想试试课堂字幕的话，有卡点可以找我。','如果下节课正好需要字幕或回看，欢迎来问我怎么开始。'];
 c.forEach((draft,i)=>{
  draft.reminder=reminders[i];
  if (draft.title.startsWith('待补充：')) {draft.confirmation='模板已用完，先补充新场景再发布';return;}
  if (source) {
   const summary=source.data.summary.trim();
   const angles=[
    '如果这条资讯刚好对应你的课堂场景，可以挑一个具体步骤试试，课后记下哪里省时间。',
    '这类变化跟每个人的距离不一样。看看它适用的学校和课程，有关系再存起来就好～',
    '先看这件事对自己的课程有没有用。如果下节课确实需要字幕或课后回看，可以先确认课程规则和使用入口。'
   ];
   draft.body=summary+'\n\n'+angles[i];
   draft.basis='近期热点';draft.basisDetail=source.data.title+' · '+source.data.publishDate;
   draft.sourceUrl=source.data.url;draft.eventDate=source.data.eventDate;draft.publishDate=source.data.publishDate;draft.queried=source.data.queried;
   draft.why='这条链接在近期窗口内，发布前请核对摘要和适用人群。';
   draft.confirmation='请核对资讯原文与适用人群，来源链接另附。';
  }
  if ([...draft.body.replace(/\s+/gu,''),...draft.reminder].length<=150) draft.body+='\n\n'+draft.reminder;
 });
 const firstTaskSteps=lastAction?.data.member?'查看昨日有后续安排的成员记录；优先回应已有求助和回访。':'一次集中查看三个群；优先回复求助与已承诺回访；把无法确认的问题交给团队。';
 return {goal:issues.length||lastAction?'先完成已有跟进，再安排一条内容':'让有需要的人，轻松解决一个学习小问题',candidates:c,recommended:0,backup:c[1].title,history:history.length,hotspot:sourceLabel,next:lastAction?.data.next||'',tasks:[
 {title:issues.length?'处理未完成问题与回访':'查看三个群的近期问题',minutes:Math.max(1,Math.round(budget*.3)),steps:firstTaskSteps,done:'已回应需要帮助的人；未知信息已进入待确认事项',audience:'有明确求助或已约定回访的成员',channel:'三个微信群 / 自愿私下提交'},
 {title:'人工核对并发布一条共用内容',minutes:Math.max(1,Math.round(budget*.4)),steps:'检查是否已有自然讨论；有则取消额外话题。否则编辑一条推荐文案，核对后手动发布。',done:'发布或明确取消；不为完成排期刷屏',audience:'适合选题的群成员',channel:'三个微信群，按群反馈小幅调整'},
 {title:'记录结果，为明天留一句建议',minutes:Math.max(1,budget-Math.max(1,Math.round(budget*.3))-Math.max(1,Math.round(budget*.4))),steps:'在固定时段查看回复；记录具体结果、来源和下一步；无法确认的结果记未知。',done:'录入真实结果或结果未知，并留下跟进事项',audience:'发生具体反馈或行动的重点成员',channel:'工作台 / 结果记录'}
 ]};
}
export function review(rows,start,end){
 const within=x=>(x.data.date||'')>=start&&(x.data.date||'')<=end;
 const results=live(rows,'result').filter(within),posts=live(rows,'content').filter(within).filter(x=>['已发布','已复盘'].includes(x.data.status));
 const tasks=live(rows,'task').filter(within).filter(x=>x.data.status==='已完成');
 const known=results.filter(x=>x.data.source&&!['无反馈／结果未知','有人求助','有人提供具体反馈'].includes(x.data.outcome));
 const time=results.filter(x=>x.data.minutes!==''&&x.data.minutes!=null).reduce((s,x)=>s+Number(x.data.minutes||0),0);
 const cost=results.filter(x=>x.data.cost!==''&&x.data.cost!=null).reduce((s,x)=>s+Number(x.data.cost||0),0);
 return `观察周期：${start} 至 ${end}（Asia/Singapore）\n实际工作：已发布 ${posts.length} 条内容；完成 ${tasks.length} 项任务；录入 ${results.length} 条结果记录。\n帮助线索：${results.filter(x=>x.data.outcome==='有人确认问题解决').map(x=>x.data.notes||x.data.title).join('；')||'尚无解决确认记录'}。\n可确认结果：${known.map(x=>x.data.outcome+'（'+(x.data.source||'来源未填')+'）').join('；')||'暂无可确认的使用或付费结果'}。\n归因限制：以上为手动记录的关联结果，不代表由社群单独导致；无反馈与未知不填零。\n投入：已记录耗时 ${results.some(x=>x.data.minutes!==''&&x.data.minutes!=null)?time+' 分钟':'未知'}，奖励成本 ${results.some(x=>x.data.cost!==''&&x.data.cost!=null)?'¥'+cost.toFixed(2):'未知'}；未记录部分未知。\n下周继续：${known.length?'继续跟进有明确结果记录的内容':'继续提供一条低负担的实用帮助并记录证据'}。\n下周调整：${results.some(x=>x.data.outcome==='有人求助')?'优先回应现有求助，再安排新内容':'先收集具体问题，再调整选题'}。\n下周暂停：自然讨论已发生时暂停额外话题；无证据的热点与未确认福利不发布。\n负责人简报：本周期实际发布 ${posts.length} 条内容，保留 ${results.length} 条结果记录；已确认结果与未知部分如上。下一周期优先解决具体问题，持续核实使用价值，不以消息量衡量成效。`;
}
export function csv(records){const keys=[...new Set(records.flatMap(x=>Object.keys(x.data)))];const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';const safe=v=>/^[=+\-@\t\r]/.test(String(v??''))?"'"+v:v;return '\ufeff'+[['id',...keys],...records.map(x=>[x.id,...keys.map(k=>safe(x.data[k]))])].map(row=>row.map(quote).join(',')).join('\r\n')}
