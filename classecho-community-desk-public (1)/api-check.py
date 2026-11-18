"""Two independent cookie sessions, local preview only; never writes production."""
import json, urllib.request, urllib.error, http.cookiejar, uuid
BASE='http://127.0.0.1:5173'
def session():
 jar=http.cookiejar.CookieJar();o=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));o.open(BASE+'/signin-with-chatgpt?return_to=/').read();return o
def call(o,path,body=None):
 req=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json'})
 try:
  with o.open(req) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
a=session();b=session();rid='api-test-'+str(uuid.uuid4());row={'id':rid,'type':'task','data':{'title':'独立会话验收记录','date':'2026-11-01'}}
status,v=call(a,'/api/records',{'record':row,'base':0,'mutation':str(uuid.uuid4())});assert status==200,(status,v);assert v['record']['rev']==1
assert any(x['id']==rid for x in call(b,'/api/records')[1]['records'])
row['data']['title']='第二会话更新';status,v=call(b,'/api/records',{'record':row,'base':1,'mutation':str(uuid.uuid4())});assert status==200 and v['record']['rev']==2,(status,v)
assert next(x for x in call(a,'/api/records')[1]['records'] if x['id']==rid)['data']['title']=='第二会话更新'
status,v=call(a,'/api/records',{'record':row,'base':1,'mutation':str(uuid.uuid4())});assert status==409 and v['remote']['rev']==2
row['deleted']=True;status,v=call(b,'/api/records',{'record':row,'base':2,'mutation':str(uuid.uuid4())});assert status==200
assert next(x for x in call(a,'/api/records')[1]['records'] if x['id']==rid)['deleted']
status,_=call(urllib.request.build_opener(),'/api/records');assert status==401
print('PASS: 本地两个独立会话 A写B读/B改A读、乐观并发冲突409、删除墓碑、匿名拒绝。不是云端验收。')
