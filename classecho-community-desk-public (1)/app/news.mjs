export const OPERATING_TIMEZONE = 'Asia/Singapore';

const dateInZone = (date) => new Intl.DateTimeFormat('en-CA', {
  timeZone: OPERATING_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit'
}).format(date);

const TOPICS = {
  classroom: ['lecture classroom student', /lectur|classroom|caption|transcript|note.tak/i],
  study: ['student learning higher education', /student|learn|educat|stud(y|ies)|universit/i],
  ai: ['artificial intelligence higher education student', /artificial intelligence|generative ai|language model|chatgpt|education/i]
};

export async function searchResearch(topic, now = new Date(), request = fetch) {
  const [query, match] = TOPICS[topic] ?? TOPICS.classroom;
  const today = dateInZone(now);
  const queried = Intl.DateTimeFormat('sv-SE', {timeZone: OPERATING_TIMEZONE, dateStyle:'short', timeStyle:'short'}).format(now) + ' SGT';
  for (const window of [3, 7]) {
    const start = dateInZone(new Date(now.getTime() - (window - 1) * 864e5));
    const url = new URL('https://api.crossref.org/works');
    url.search = new URLSearchParams({
      'query.title': query,
      filter: 'from-pub-date:' + start + ',until-pub-date:' + today + ',type:journal-article',
      select: 'DOI,title,published,container-title', rows: '15'
    }).toString();
    const response = await request(url, {signal: AbortSignal.timeout(5500), headers:{Accept:'application/json'}});
    if (!response.ok) throw Error('Crossref 暂时无法响应');
    const payload = await response.json();
    if (!Array.isArray(payload?.message?.items)) throw Error('Crossref 返回格式有误');
    const seen = new Set();
    const items = [];
    for (const item of payload.message.items) {
      const title = item.title?.[0];
      const doi = item.DOI;
      const parts = item.published?.['date-parts']?.[0];
      if (typeof title !== 'string' || !match.test(title) || typeof doi !== 'string' ||
          !/^10\.\d+\/[\w.()/:;+-]+$/i.test(doi) || seen.has(doi.toLowerCase()) || parts?.length !== 3) continue;
      const publishDate = parts.map((n, i) => String(n).padStart(i === 0 ? 4 : 2, '0')).join('-');
      if (publishDate < start || publishDate > today) continue;
      seen.add(doi.toLowerCase());
      items.push({title, url:'https://doi.org/' + doi, publishDate, queried,
        verified:'待核实', notes:'期刊：' + (item['container-title']?.[0] || '待核实') +
          '。Crossref 登记的是出版日期。请读原文并补录事件日期、适用人群和中文摘要。'});
    }
    if (items.length || window === 7) return {window, queried, items:items.slice(0,6)};
  }
}
