"""Prepare production website. Booking stays telephone-only until explicit release."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import shutil, re, json, os

root = Path.cwd()
release = root / "release"
if release.exists():
    shutil.rmtree(release)
release.mkdir()
pages = ["index.html", "salon/index.html", "leistungen/index.html", "kontakt/index.html", "impressum/index.html", "termin/index.html"]
shutil.copytree(root / "assets", release / "assets")
# The preview booking client is never shipped to production during phase 1.
for path in (release / "assets/js").glob("booking-*.js"):
    path.unlink()
# Preview-only visual layer is excluded from the public release.
(release / "assets/css/booking-pilot.css").unlink(missing_ok=True)

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.h1 = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "h1": self.h1 += 1
        for key in ("src", "href", "poster"):
            if a.get(key): self.links.append(a[key])

def validate(base, page, html):
    parser = Links()
    parser.feed(html)
    assert parser.h1 == 1, (page, "expected one h1", parser.h1)
    for link in parser.links:
        url = urlsplit(link)
        if url.scheme or url.netloc or not url.path: continue
        target = (base / page).parent / unquote(url.path)
        if url.path.startswith("/"): target = base / unquote(url.path.lstrip("/"))
        if target.is_dir(): target /= "index.html"
        assert target.exists(), (page, link, "missing asset")

for page in pages:
    html = (root / page).read_text(encoding="utf-8")
    validate(root, page, html)
    assert "editorial-v10.css" in html, page
    # Preview is noindex; production normal pages are indexable.
    html = re.sub(r'<meta\s+name="robots"\s+content="noindex,nofollow"\s*/?>', "", html)
    if page == "index.html":
        html = html.replace('<div class="mobile-actions"><a href="./termin/" data-preview-home>Termin buchen</a><a href="tel:079559268671">Anrufen</a></div>', '<div class="mobile-actions"><a href="tel:079559268671">Anrufen</a><a href="https://wa.me/4917614624149" target="_blank" rel="noopener">WhatsApp</a></div>')
        assert 'data-preview-home' not in html
    if page == "termin/index.html":
        html = re.sub(r'<main class="av-booking">[\s\S]*?</main>', '''<main class="contact-editorial"><section class="ct-hero container"><div class="ct-intro"><span class="section-label">Dein Termin bei Avanti</span><h1>Dein Haar.<br><em>Dein Termin.</em></h1><p>Unsere Online-Terminbuchung wird vorbereitet. Bis dahin vereinbare deinen Termin gerne telefonisch oder per WhatsApp.</p><div class="ct-actions"><a class="btn btn--dark" href="tel:079559268671">07955 9268671 anrufen</a><a class="ct-textlink" href="https://wa.me/4917614624149" target="_blank" rel="noopener">WhatsApp schreiben</a></div></div><figure class="ct-hero-image"><img src="../assets/img/hero-salon.webp" alt="Avanti Haarstudio"></figure></section></main>''', html, count=1)
        html = re.sub(r'<script\b[^>]*src="[^"]*booking-[^"]+"[^>]*>[\s\S]*?</script>', '', html)
        html = re.sub(r'<link\s+[^>]*href="[^"]*booking-pilot\.css[^"]*"[^>]*>', '', html)
        html = html.replace('<a href="#booking-live-app" data-preview-mobile>Termin auswählen</a><a href="tel:079559268671">Anrufen</a>', '<a href="tel:079559268671">Anrufen</a><a href="https://wa.me/4917614624149" target="_blank" rel="noopener">WhatsApp</a>')
        html = html.replace('</head>', '<link rel="stylesheet" href="../assets/css/contact-v10.1.css?v=101"></head>')
        html = html.replace('data-page="termin"', 'data-page="kontakt"')
        assert 'booking-live-app' not in html and 'booking-pilot.js' not in html and 'booking-pilot.css' not in html and 'data-preview-mobile' not in html
    dest = release / page
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
# Neutralize previous pilot route if an older version exists on the server.
(release / "termin/pilot.html").write_text('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./"><title>Terminbuchung</title></head><body><a href="./">Termin vereinbaren</a></body></html>', encoding="utf-8")
for page in pages:
    validate(release, page, (release / page).read_text(encoding="utf-8"))
(release / "build-info.json").write_text(json.dumps({"commit": os.environ.get("GITHUB_SHA", "local"), "booking": "telephone-only"}) + "\n", encoding="utf-8")
print("Six pages and linked local assets validated; public booking is disabled in release.")
