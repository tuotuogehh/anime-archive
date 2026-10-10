"""Build a compact anime directory from Bangumi's publicly attributed snapshots."""
import concurrent.futures
import html
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
BASE = "https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master"
ids_by_year = json.loads(Path('/tmp/anime-atlas-anime-ids.json').read_text())
EARLY = [806, 28287, 28288, 50, 10393, 10404, 24274, 10389, 10392,
         5487, 11189, 10390, 314, 9565]
selected = set(EARLY)
for year in range(1981, 2024):
    selected.update(ids_by_year.get(str(year), [])[:6])

cache = ROOT / '.bangumi-cache'
cache.mkdir(exist_ok=True)
def fetch_snapshot(subject_id):
    path = cache / f'{subject_id}.json'
    if path.exists():
        try: return json.loads(path.read_text())
        except Exception: pass
    url = f'{BASE}/data/{subject_id // 100}/{subject_id}.json'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'AnimeAtlas/1.0'})
        with urllib.request.urlopen(req, timeout=14) as response:
            data = json.load(response)
        path.write_text(json.dumps(data, ensure_ascii=False))
        return data
    except Exception:
        return None

genre_rules = {
    'Action':['动作','热血','战斗','格斗','武侠'],
    'Adventure':['冒险','旅行','旅程'],
    'Fantasy':['奇幻','魔法','异世界','魔幻'],
    'Sci-Fi':['科幻','机甲','机器人','赛博','宇宙','未来'],
    'Romance':['恋爱','爱情','纯爱','百合'],
    'Comedy':['搞笑','喜剧','恶搞'],
    'Drama':['剧情','致郁','感人','催泪'],
    'Slice of Life':['日常','治愈','生活'],
    'Mystery':['悬疑','推理','侦探','解谜'],
    'Sports':['运动','体育','足球','篮球','排球'],
    'Supernatural':['超自然','妖怪','灵异','鬼怪'],
}
def normalize(raw):
    if not raw or raw.get('type') != 2:
        return None
    date = raw.get('date') or ''
    match = re.match(r'(19\d\d|20\d\d)', date)
    if not match or int(match[1]) > 2026:
        return None
    rating = raw.get('rating') or {}
    if not raw.get('image') or (rating.get('total') or 0) < 25:
        return None
    summary = re.sub(r'\s+', ' ', html.unescape(raw.get('summary') or '')).strip()
    if len(summary) > 330: summary = summary[:327] + '…'
    if not summary:
        return None
    tags = raw.get('tags') or []
    tag_text = ' '.join(tag.get('name','') for tag in tags[:30])
    genres = [category for category, words in genre_rules.items() if any(word in tag_text for word in words)]
    if not genres: genres = ['Drama']
    info = raw.get('info') or ''
    format_ = 'MOVIE' if ('剧场版' in tag_text[:200] or '上映' in info[:1000]) else 'OVA' if 'OVA' in tag_text[:200] else 'TV'
    image_url = 'https:' + raw['image'] if raw['image'].startswith('//') else raw['image']
    episodes = len([ep for ep in (raw.get('eps') or []) if ep.get('type') == 0])
    return {
        'id': raw['id'], 'cn': raw.get('name_cn') or '',
        'title': {'english': '', 'romaji': raw.get('name') or '', 'native': raw.get('name') or ''},
        'startDate': {'year': int(match[1])},
        'coverImage': {'large': image_url}, 'bannerImage': None,
        'genres': genres, 'format': format_, 'episodes': episodes,
        'averageScore': round(float(rating.get('score') or 0) * 10),
        'ratingCount': rating.get('total') or 0,
        'popularity': (raw.get('collection') or {}).get('collect') or 0,
        'siteUrl': f"https://bgm.tv/subject/{raw['id']}",
        'description': summary,
    }

print(f'Fetching {len(selected)} candidate snapshots', flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    snapshots = list(pool.map(fetch_snapshot, sorted(selected)))
items = [item for item in map(normalize, snapshots) if item]
items.sort(key=lambda item: item['popularity'], reverse=True)
output = ROOT / 'dist' / 'anime.json'
output.write_text(json.dumps(items, ensure_ascii=False, separators=(',',':')))
print(f'Kept {len(items)} anime, {output.stat().st_size} bytes', flush=True)
from collections import Counter
print(Counter(item['startDate']['year']//10*10 for item in items), flush=True)

cover_dir = ROOT / 'dist' / 'covers'
cover_dir.mkdir(exist_ok=True)
def fetch_cover(item):
    image_url = item['coverImage']['large']
    image_path = cover_dir / f"{item['id']}.jpg"
    if image_path.exists() and image_path.stat().st_size > 1500:
        return True
    try:
        proxy = 'https://images.weserv.nl/?' + urllib.parse.urlencode({'url': image_url, 'w': 360, 'output': 'jpg'})
        req = urllib.request.Request(proxy, headers={'User-Agent':'AnimeAtlas/1.0'})
        with urllib.request.urlopen(req, timeout=18) as response:
            image = response.read()
        if len(image) < 1500: return False
        image_path.write_bytes(image)
        return True
    except Exception:
        return False

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    success = list(pool.map(fetch_cover, items))
items = [item for item, ok in zip(items, success) if ok]
for item in items:
    item['coverImage']['large'] = f"covers/{item['id']}.jpg"
output.write_text(json.dumps(items, ensure_ascii=False, separators=(',',':')))
print(f'Covers downloaded: {sum(success)}/{len(items)}', flush=True)
