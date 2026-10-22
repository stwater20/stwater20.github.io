#!/usr/bin/env python3
"""Sync the resume from https://sectools.tw/about/sean and render index.html.

Pipeline: WordPress REST API -> sanitized sections (data/resume.json) -> index.html.

If the source is unreachable or the content looks incomplete, the script exits
non-zero without touching any file, so the last good version stays online.

Usage:
    python3 scripts/sync_resume.py            # fetch + render
    python3 scripts/sync_resume.py --render   # re-render from data/resume.json only
"""

import argparse
import hashlib
import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "resume.json"
TEMPLATE_FILE = ROOT / "templates" / "index.html"
OUTPUT_FILE = ROOT / "index.html"
AVATAR_FILE = ROOT / "assets" / "avatar.jpg"
EN_DATA_FILE = ROOT / "data" / "resume_en.json"
EN_OUTPUT_FILE = ROOT / "en" / "index.html"

SOURCE_PAGE = "https://sectools.tw/about/sean"
API_URL = "https://sectools.tw/wp-json/wp/v2/pages?slug=sean&_fields=id,modified_gmt,title,content,link"
SITE_URL = "https://stwater20.github.io/"
USER_AGENT = "stwater20.github.io resume sync (+https://github.com/stwater20/stwater20.github.io)"

# Sections that must exist, otherwise the fetched page is considered broken.
REQUIRED_SECTIONS = ["學經歷", "著作"]
MIN_TEXT_LENGTH = 3000

ALLOWED_TAGS = {"p", "br", "a", "strong", "b", "em", "i", "sup", "sub", "ul", "ol", "li", "h2", "h3", "img"}
VOID_TAGS = {"br", "img"}
DROP_CONTENT_TAGS = {"script", "style", "iframe", "noscript"}

TZ_TAIPEI = timezone(timedelta(hours=8))

# Stable anchors for sections the menu links to; others get s<index>.
SECTION_IDS = {"學經歷": "experience", "著作": "publications", "其他資訊": "links"}


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json, */*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        if resp.status != 200:
            raise RuntimeError("HTTP %s for %s" % (resp.status, url))
        return resp.read()


BARE_URL_RE = re.compile(r"https?://[^\s<>\"'，。、；]+")


class Sanitizer(HTMLParser):
    """Keeps a small allowlist of tags/attributes and drops everything else."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip_depth = 0
        self.images = []
        self.link_stack = []  # whether each open <a> was kept, so dropped links lose their </a> too

    def handle_starttag(self, tag, attrs):
        if tag in DROP_CONTENT_TAGS:
            self.skip_depth += 1
            return
        if self.skip_depth or tag not in ALLOWED_TAGS:
            return
        attrs = dict(attrs)
        if tag == "a":
            href = attrs.get("href", "")
            keep = bool(re.match(r"^(https?:|mailto:)", href))
            self.link_stack.append(keep)
            if not keep:
                return
            self.out.append('<a href="%s" target="_blank" rel="noopener">' % html.escape(href, quote=True))
        elif tag == "img":
            src = attrs.get("src", "")
            if src.startswith("https://"):
                self.images.append(src)
        elif tag == "ol" and attrs.get("start"):
            self.out.append('<ol start="%s">' % html.escape(attrs["start"], quote=True))
        else:
            self.out.append("<%s>" % tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in DROP_CONTENT_TAGS:
            self.skip_depth = max(0, self.skip_depth - 1)
            return
        if self.skip_depth or tag not in ALLOWED_TAGS or tag in VOID_TAGS:
            return
        if tag == "a" and not (self.link_stack.pop() if self.link_stack else False):
            return
        self.out.append("</%s>" % tag)

    def handle_data(self, data):
        if self.skip_depth:
            return
        if any(self.link_stack):  # already inside a link
            self.out.append(html.escape(data, quote=False))
            return
        # Turn bare URLs (e.g. a DOI pasted as plain text) into links.
        pos = 0
        for m in BARE_URL_RE.finditer(data):
            url = m.group(0).rstrip(".,;:)]）」")
            self.out.append(html.escape(data[pos:m.start()], quote=False))
            self.out.append('<a href="%s" target="_blank" rel="noopener">%s</a>' % (
                html.escape(url, quote=True), html.escape(url, quote=False)))
            pos = m.start() + len(url)
        self.out.append(html.escape(data[pos:], quote=False))


def sanitize(raw_html):
    s = Sanitizer()
    s.feed(raw_html)
    s.close()
    cleaned = "".join(s.out)
    cleaned = cleaned.replace("\xa0", " ")
    cleaned = re.sub(r"<(strong|em|b|i)>\s*</\1>", "", cleaned)
    cleaned = re.sub(r"<strong><strong>(.*?)</strong></strong>", r"<strong>\1</strong>", cleaned)
    return cleaned, s.images


def strip_tags(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


TIMELINE_RE = re.compile(r"^\s*([0-9]{4}(?:/[0-9]{2})?(?:\s*[–—-]\s*(?:[0-9]{4}(?:/[0-9]{2})?|Present))?)\s*\|\s*(.+)$", re.S)
LINK_LINE_RE = re.compile(r"^\s*([^：:<]+)[：:]\s*(.+)$", re.S)


def split_blocks(fragment):
    """Split a section body into paragraphs / lists / sub-headings."""
    blocks = []
    pattern = re.compile(r"<(p|ul|ol|h3)\b[^>]*>.*?</\1>", re.S)
    for m in pattern.finditer(fragment):
        blocks.append((m.group(1), m.group(0)))
    return blocks


def inner(tag_html):
    return re.sub(r"^<[^>]+>|</[^>]+>$", "", tag_html.strip(), flags=re.S).strip()


def parse_section_body(fragment):
    """Turn a section body into a list of typed items the template understands."""
    items = []
    for tag, block in split_blocks(fragment):
        if tag == "h3":
            title = strip_tags(block)
            m = re.match(r"^(.*?)\s*\((\d+)\)\s*$", title)
            items.append({"type": "subheading", "text": m.group(1) if m else title, "count": int(m.group(2)) if m else None})
        elif tag in ("ul", "ol"):
            lis = [inner(li).strip() for li in re.findall(r"<li>.*?</li>", block, re.S)]
            items.append({"type": "list", "ordered": tag == "ol", "items": lis})
        else:
            body = inner(block)
            lines = [l.strip() for l in re.split(r"<br>", body) if strip_tags(l)]
            # "Pending Publications" is a bold-only paragraph acting as a heading.
            if len(lines) == 1 and re.fullmatch(r"<strong>[^<]+</strong>", lines[0]):
                items.append({"type": "subheading", "text": strip_tags(lines[0]), "count": None})
                continue
            timeline = [TIMELINE_RE.match(l) for l in lines]
            if all(timeline):
                items.append({"type": "timeline", "entries": [
                    {"date": re.sub(r"\s*[–—-]\s*", " – ", m.group(1).strip()), "html": m.group(2).strip()} for m in timeline
                ]})
                continue
            links = [LINK_LINE_RE.match(l) for l in lines]
            if all(links) and all("<a " in m.group(2) for m in links):
                items.append({"type": "links", "entries": [
                    {"label": strip_tags(m.group(1)), "html": m.group(2).strip()} for m in links
                ]})
                continue
            items.append({"type": "paragraph", "html": "<br>".join(lines)})
    return merge_adjacent_timelines(items)


def merge_adjacent_timelines(items):
    merged = []
    for it in items:
        if merged and it["type"] == "timeline" and merged[-1]["type"] == "timeline":
            merged[-1]["entries"].extend(it["entries"])
        else:
            merged.append(it)
    return merged


def parse_resume(page):
    raw = page["content"]["rendered"]
    cleaned, images = sanitize(raw)
    parts = re.split(r"<h2>(.*?)</h2>", cleaned, flags=re.S)
    # parts = [before_first_h2, title1, body1, title2, body2, ...]
    sections = []
    for i in range(1, len(parts), 2):
        title = strip_tags(parts[i])
        sections.append({"title": title, "items": parse_section_body(parts[i + 1])})

    if not sections:
        raise ValueError("no <h2> sections found")

    # The first h2 is the name heading; its paragraphs are the intro.
    header = sections.pop(0)
    intro = [it["html"] for it in header["items"] if it["type"] == "paragraph"]

    return {
        "name": header["title"],
        "intro": intro,
        "avatar_source": images[0] if images else None,
        "sections": sections,
        "source": {"url": page.get("link") or SOURCE_PAGE, "id": page.get("id"), "modified_gmt": page.get("modified_gmt")},
        "_text_length": len(strip_tags(cleaned)),
    }


def validate(resume):
    titles = [s["title"] for s in resume["sections"]]
    missing = [t for t in REQUIRED_SECTIONS if t not in titles]
    if missing:
        raise ValueError("missing required sections: %s (got %s)" % (missing, titles))
    if resume["_text_length"] < MIN_TEXT_LENGTH:
        raise ValueError("content too short (%d chars), refusing to overwrite" % resume["_text_length"])
    if not resume["name"]:
        raise ValueError("empty name heading")


def sync_avatar(url):
    if not url:
        return
    try:
        data = fetch(url)
    except Exception as e:  # keep the existing avatar if the image is unreachable
        print("warning: avatar download failed, keeping existing file: %s" % e, file=sys.stderr)
        return
    if not data.startswith(b"\xff\xd8"):
        print("warning: avatar is not a JPEG, skipped", file=sys.stderr)
        return
    if AVATAR_FILE.exists() and AVATAR_FILE.read_bytes() == data:
        return
    AVATAR_FILE.parent.mkdir(parents=True, exist_ok=True)
    AVATAR_FILE.write_bytes(data)
    print("avatar updated")


# ---------- rendering ----------

def render_item(it):
    t = it["type"]
    if t == "subheading":
        count = ' <span class="count">%d</span>' % it["count"] if it.get("count") else ""
        return '<h3 class="resume-sub">%s%s</h3>' % (html.escape(it["text"]), count)
    if t == "timeline":
        rows = "".join(
            '<li><span class="tl-date">%s</span><span class="tl-body">%s</span></li>' % (html.escape(e["date"]), e["html"])
            for e in it["entries"]
        )
        return '<ul class="timeline">%s</ul>' % rows
    if t == "list":
        rows = "".join("<li>%s</li>" % li for li in it["items"])
        return '<ol class="pubs">%s</ol>' % rows
    if t == "links":
        rows = "".join(
            '<li><span class="tl-date">%s</span><span class="tl-body">%s</span></li>' % (html.escape(e["label"]), e["html"])
            for e in it["entries"]
        )
        return '<ul class="timeline links">%s</ul>' % rows
    return "<p>%s</p>" % it["html"]


LANGS = {
    "zh": {
        "html_lang": "zh-Hant-TW",
        "og_locale": "zh_TW",
        "path": "",
        "title": "陳勝舢 ｜ Sheng-Shan Chen",
        "keywords": "陳勝舢, Sheng-Shan Chen, Sean, 資安研究員, 網路威脅情資, CyCraft, 奧義智慧",
        "nav_experience": "學經歷",
        "nav_publications": "著作",
        "switch_path": "/en/",
        "switch_lang": "en",
        "switch_label": "English",
        "toc_label": "段落",
        "to_top_label": "回到頂端",
        "print_source": "來源：",
        "print_date_label": "列印於",
        "sync_note": '資料同步自 <a href="%(source)s" target="_blank" rel="noopener">SecTools.tw</a> · 最後更新 %(updated)s',
    },
    "en": {
        "html_lang": "en",
        "og_locale": "en_US",
        "path": "en/",
        "title": "陳勝舢 ｜ Sheng-Shan Chen",
        "keywords": "Sheng-Shan Chen, 陳勝舢, Sean Chen, cybersecurity researcher, cyber threat intelligence, CyCraft",
        "nav_experience": "Experience",
        "nav_publications": "Publications",
        "switch_path": "/",
        "switch_lang": "zh-Hant",
        "switch_label": "中文",
        "toc_label": "Sections",
        "to_top_label": "Back to top",
        "print_source": "Source: ",
        "print_date_label": "printed",
        "sync_note": 'Last updated %(updated)s · Publications synced from <a href="%(source)s" target="_blank" rel="noopener">SecTools.tw</a>',
    },
}


def build_english(resume):
    """English page: hand-written sections plus publications copied from the synced Chinese data."""
    en = json.loads(EN_DATA_FILE.read_text(encoding="utf-8"))
    zh_sections = {sec["title"]: sec for sec in resume["sections"]}
    for sec in en["sections"]:
        if "from_zh" in sec:
            sec["items"] = zh_sections[sec["from_zh"]]["items"]
    en["source"] = resume["source"]
    # Remind (in the sync log / PR) when the Chinese page gained entries the English page lacks.
    def count(sec):
        return sum(len(it.get("entries", [])) for it in sec["items"])
    zh_counts = [count(sec) for sec in resume["sections"] if sec["title"] != "著作"]
    en_counts = [count(sec) for sec in en["sections"] if "from_zh" not in sec]
    if zh_counts != en_counts:
        print("warning: data/resume_en.json may be outdated (entries per section zh=%s en=%s)" % (zh_counts, en_counts))
    return en


def render(resume, lang):
    cfg = LANGS[lang]
    toc = []
    body = []
    for idx, sec in enumerate(resume["sections"], 1):
        sid = sec.get("id") or SECTION_IDS.get(sec["title"], "s%d" % idx)
        toc.append('<a href="#%s">%s</a>' % (sid, html.escape(sec["title"])))
        inner_html = "\n".join(render_item(it) for it in sec["items"])
        body.append('<section class="resume-section" id="%s">\n<h2>%s</h2>\n%s\n</section>' % (sid, html.escape(sec["title"]), inner_html))

    if lang == "en":
        updated = resume["updated"]
    else:
        modified = resume["source"].get("modified_gmt")
        if modified:
            dt = datetime.strptime(modified, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc).astimezone(TZ_TAIPEI)
            updated = dt.strftime("%Y-%m-%d")
        else:
            updated = "—"

    intro_text = strip_tags(resume["intro"][-1]) if resume["intro"] else ""
    profiles = []
    for sec in resume["sections"]:
        for it in sec["items"]:
            if it["type"] == "links":
                profiles += re.findall(r'href="([^"]+)"', "".join(e["html"] for e in it["entries"]))
    page_url = SITE_URL + cfg["path"]
    person = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Sheng-Shan Chen",
        "alternateName": ["陳勝舢", "Sean"],
        "url": page_url,
        "image": SITE_URL + "assets/avatar.jpg",
        "description": intro_text,
        "sameAs": profiles + [resume["source"]["url"]],
    }

    tpl = Template(TEMPLATE_FILE.read_text(encoding="utf-8"))
    return tpl.substitute(
        cfg,
        name=html.escape(resume["name"].strip()),
        name_plain=html.escape(resume["name"].strip(), quote=True),
        description=html.escape(intro_text, quote=True),
        intro="\n".join("<p>%s</p>" % p for p in resume["intro"]),
        toc="\n".join(toc),
        sections="\n".join(body),
        sync_note=cfg["sync_note"] % {"source": html.escape(resume["source"]["url"], quote=True), "updated": updated},
        page_url=page_url,
        home_path="/" + cfg["path"],
        title=html.escape(cfg["title"]),
        jsonld=json.dumps(person, ensure_ascii=False).replace("</", "<\\/"),
        year=datetime.now(TZ_TAIPEI).year,
    )


def write_if_changed(path, text):
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--render", action="store_true", help="only re-render the pages from data/*.json")
    args = ap.parse_args()

    if args.render:
        resume = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    else:
        try:
            pages = json.loads(fetch(API_URL))
            if not pages:
                raise ValueError("API returned no page for slug=sean")
            resume = parse_resume(pages[0])
            validate(resume)
        except Exception as e:
            print("sync aborted, keeping the existing site: %s" % e, file=sys.stderr)
            return 1
        resume.pop("_text_length", None)
        sync_avatar(resume.get("avatar_source"))
        data_text = json.dumps(resume, ensure_ascii=False, indent=2) + "\n"
        if write_if_changed(DATA_FILE, data_text):
            print("data/resume.json updated (sha1 %s)" % hashlib.sha1(data_text.encode()).hexdigest()[:8])

    outputs = [(OUTPUT_FILE, render(resume, "zh")), (EN_OUTPUT_FILE, render(build_english(resume), "en"))]
    changed = [str(path.relative_to(ROOT)) for path, text in outputs if write_if_changed(path, text)]
    print("updated: %s" % ", ".join(changed) if changed else "no changes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
