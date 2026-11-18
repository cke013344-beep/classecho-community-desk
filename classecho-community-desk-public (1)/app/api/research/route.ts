import { getChatGPTUser } from '../../chatgpt-auth';
import { searchResearch } from '../../news.mjs';

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!await getChatGPTUser()) return Response.json({error:'请先登录'}, {status:401,headers});
  try {
    const result = await searchResearch(new URL(request.url).searchParams.get('topic'));
    return Response.json(result, {headers});
  } catch {
    return Response.json({error:'暂时无法读取公开研究来源。可录入已核实链接，或继续生成常青方案。'}, {status:503,headers});
  }
}
