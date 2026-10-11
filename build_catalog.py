"""Build the anime catalog from Bangumi's public subject search API."""
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
import html
import json
import re
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).parent
OUTPUT = ROOT / 'dist' / 'anime.json'
CACHE = ROOT / '.bangumi-api-cache-all-rated'
CACHE.mkdir(exist_ok=True)
API = 'https://api.bgm.tv/v0/search/subjects'
PAGE_SIZE = 20
FIRST_YEAR = 1900
LAST_YEAR = date.today().year
HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'AnimeAtlas/2.0 (+https://tuotuogehh.github.io/anime-archive/)',
}

GENRE_RULES = {
    'Action': ['动作', '热血', '战斗', '格斗', '武侠'],
    'Adventure': ['冒险', '旅行', '旅程'],
    'Fantasy': ['奇幻', '魔法', '异世界', '魔幻'],
    'Sci-Fi': ['科幻', '机甲', '机器人', '赛博', '宇宙', '未来'],
    'Romance': ['恋爱', '爱情', '纯爱', '百合', '后宫'],
    'Comedy': ['搞笑', '喜剧', '恶搞'],
    'Drama': ['剧情', '致郁', '感人', '催泪'],
    'Slice of Life': ['日常', '治愈', '生活'],
    'Mystery': ['悬疑', '推理', '侦探', '解谜'],
    'Sports': ['运动', '体育', '足球', '篮球', '排球'],
    'Supernatural': ['超自然', '妖怪', '灵异', '鬼怪'],
    'Horror': ['恐怖', '惊悚'],
    'Mecha': ['机甲', '机器人', '高达'],
    'Music': ['音乐', '偶像', '乐队', '歌'],
    'School': ['校园', '学园', '学生'],
    'Historical': ['历史', '古装', '战国', '时代剧'],
    'Kids': ['子供向', '亲子', '儿童', '幼年'],
    'Workplace': ['职场', '社会人', '工作'],
    'Psychological': ['心理', '智斗', '黑暗', '犯罪'],
    'Shoujo': ['少女向', '少女漫画'],
    'Shounen': ['少年向', '少年漫画'],
    'Seinen': ['青年向', '青年漫画'],
    'Josei': ['女性向', '女性漫画'],
}


def api_page(year, offset):
    cache_path = CACHE / f'{year}-{offset}.json'
    if cache_path.exists():
        try:
            return json.loads(cache_path.read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError):
            cache_path.unlink(missing_ok=True)

    end = date(year + 1, 1, 1)
    if year == LAST_YEAR:
        end = min(end, date.today() + timedelta(days=1))
    payload = {
        'keyword': '',
        'sort': 'heat',
        'filter': {
            'type': [2],
            'air_date': [f'>={year}-01-01', f'<{end.isoformat()}'],
            'rating_count': ['>=1'],
            'nsfw': False,
        },
    }
    url = API + '?' + urlencode({'limit': PAGE_SIZE, 'offset': offset})
    request = Request(url, data=json.dumps(payload).encode('utf-8'), headers=HEADERS, method='POST')
    for attempt in range(6):
        try:
            with urlopen(request, timeout=25) as response:
                page = json.load(response)
            cache_path.write_text(json.dumps(page, ensure_ascii=False), encoding='utf-8')
            return page
        except HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 5:
                raise
            time.sleep(min(20, (attempt + 1) * 2))
        except (URLError, TimeoutError):
            if attempt == 5:
                raise
            time.sleep(min(15, (attempt + 1) * 1.5))


def fetch_year(year):
    first = api_page(year, 0)
    total = first.get('total', 0)
    items = list(first.get('data') or [])
    for offset in range(PAGE_SIZE, total, PAGE_SIZE):
        page = api_page(year, offset)
        items.extend(page.get('data') or [])
    return year, items, total


def clean_summary(summary):
    summary = re.sub(r'<[^>]*>', ' ', html.unescape(summary or ''))
    return re.sub(r'\s+', ' ', summary).strip()


def normalized(raw):
    year_match = re.match(r'(\d{4})', raw.get('date') or '')
    if not year_match or not raw.get('id'):
        return None
    year = int(year_match.group(1))
    if year < FIRST_YEAR or year > LAST_YEAR:
        return None
    summary = clean_summary(raw.get('summary'))
    image = (raw.get('images') or {}).get('common') or (raw.get('images') or {}).get('large') or raw.get('image')
    rating = raw.get('rating') or {}
    if not summary or not image or int(rating.get('total') or 0) < 1:
        return None
    if len(summary) > 500:
        summary = summary[:497] + '…'

    tags = raw.get('tags') or []
    tag_names = [tag.get('name', '') if isinstance(tag, dict) else str(tag) for tag in tags]
    tag_text = ' '.join(tag_names)
    platform = (raw.get('platform') or '').strip().upper()
    if platform in ('MOVIE', '劇場版', '剧场版', 'ANIME MOVIE'):
        format_ = 'MOVIE'
    elif platform in ('OVA', 'OAD', 'OAV'):
        format_ = 'OVA'
    elif platform in ('WEB', 'ONA', 'WEB动画'.upper(), '网络动画'.upper()):
        format_ = 'ONA'
    elif platform in ('SP', 'SPECIAL', 'TV SPECIAL'):
        format_ = 'SPECIAL'
    elif platform in ('MUSIC', '音乐动画'.upper()):
        format_ = 'MUSIC'
    elif platform in ('TV SHORT', 'TV_SHORT', '短篇动画'.upper()):
        format_ = 'TV_SHORT'
    elif platform in ('动态漫画'.upper(),):
        format_ = 'DYNAMIC_COMIC'
    elif platform and platform not in ('OTHER', '其他'):
        format_ = 'TV'
    elif any(word in tag_text for word in ('剧场版', '动画电影')):
        format_ = 'MOVIE'
    elif 'OVA' in tag_text or 'OAD' in tag_text:
        format_ = 'OVA'
    elif any(word in tag_text for word in ('WEB', 'ONA', '网络动画')):
        format_ = 'ONA'
    elif any(word in tag_text for word in ('SP', '特别篇')):
        format_ = 'SPECIAL'
    elif any(word in tag_text for word in ('音乐动画', 'MUSIC', 'MV')):
        format_ = 'MUSIC'
    elif any(word in tag_text for word in ('短篇动画', '短片', '泡面番')):
        format_ = 'TV_SHORT'
    elif platform in ('动态漫画'.upper(),):
        format_ = 'DYNAMIC_COMIC'
    elif platform in ('OTHER', '其他'):
        format_ = 'OTHER'
    else:
        format_ = 'TV'

    genres = [name for name, words in GENRE_RULES.items() if any(word in tag_text for word in words)]
    if not genres:
        genres = ['Drama']
    image = image if image.startswith('http') else 'https:' + image if image.startswith('//') else ''
    if not image:
        return None
    return {
        'id': raw['id'],
        'cn': raw.get('name_cn') or '',
        'title': {'english': '', 'romaji': raw.get('name') or '', 'native': raw.get('name') or ''},
        'startDate': {'year': year},
        'coverImage': {'large': image},
        'bannerImage': None,
        'genres': genres,
        'format': format_,
        'episodes': int(raw.get('total_episodes') or raw.get('eps') or 0),
        'averageScore': round(float(rating.get('score') or 0) * 10),
        'ratingCount': int(rating.get('total') or 0),
        'popularity': int((raw.get('collection') or {}).get('collect') or 0),
        'siteUrl': f"https://bgm.tv/subject/{raw['id']}",
        'description': summary,
    }


def main():
    years = range(FIRST_YEAR, LAST_YEAR + 1)
    print(f'Fetching anime with at least one Bangumi rating, cover, and summary, {FIRST_YEAR}-{LAST_YEAR}…', flush=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        responses = list(pool.map(fetch_year, years))
    raw_items = [item for _, items, _ in responses for item in items]
    catalog = [item for item in map(normalized, raw_items) if item]
    unique = {item['id']: item for item in catalog}
    catalog = sorted(unique.values(), key=lambda item: (-item['popularity'], item['id']))

    # Keep the covers already included in the repository local; load the expanded catalog's covers from Bangumi.
    for item in catalog:
        local_cover = ROOT / 'dist' / 'covers' / f"{item['id']}.jpg"
        if local_cover.exists():
            item['coverImage']['large'] = f"covers/{item['id']}.jpg"

    OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    fetched_count = sum(total for _, _, total in responses)
    print(f'Fetched {fetched_count} qualifying entries; kept {len(catalog)} with cover and summary.', flush=True)
    print(f'Wrote {OUTPUT} ({OUTPUT.stat().st_size:,} bytes).', flush=True)


if __name__ == '__main__':
    main()
