# hwtomy.github.io

Tiou Wang's academic homepage — live at <https://hwtomy.github.io>.

## How it works

There is no build step. GitHub Pages serves the repository verbatim, so whatever is
committed is what ships. `index.html` is a static shell of placeholder elements;
at load time `static/js/scripts.js` runs and:

1. Fetches `contents/config.yml`, parses it with js-yaml, and for every top-level key
   writes the value into the element whose `id` equals that key.
2. Fetches one `contents/<name>.md` per entry in its `section_names` array, renders it
   with marked, and injects the HTML into the element with `id="<name>-md"`.
3. Clamps injected headings to `<h3>` so the outline under each section's `<h2>` does
   not skip a level. `contents/*.md` write `####`, which marked would otherwise emit
   as `<h4>`; `.prose h3` and `.prose h4` are styled identically, so this is invisible.
4. Scans the *rendered* HTML for TeX and, only if it finds any, appends the MathJax
   script from `cdn.jsdelivr.net` and lets it typeset the whole document at startup.
5. Hides the sidebar's visitor badge if its third-party image fails to load.

Because content is fetched at runtime, editing a `.md` file is enough to change the page.

## Layout

The page is a centred **sheet** (`max-width` 1440px) on a slightly darker shell, with
hairline left/right borders. Inside it: masthead, a two-column grid, footer.

The grid has **three** direct children of `<main class="layout">`, and they are grid
*regions*, not content:

| Element | Holds | Desktop position |
| --- | --- | --- |
| `<div class="rail rail--id">` | photo slot, name, affiliation, Email/CV/GitHub | left column, row 1 |
| `<div class="content">` | About + bio, Publications | right column, both rows |
| `<aside class="rail rail--meta">` | News, visitor badge | left column, row 2 |

DOM order is identity → content → news, and that is also the reading order and the tab
order at every width. Below **960px** (60rem) the grid becomes a plain stack in the same
order, so the first screen of a phone is the person and News is the last block on the
page. No `order:` property and no reversed flex direction is used anywhere in the
stylesheet.

There are two structural breakpoints, both `min-width`: at **960px** the grid turns on
with a 320px rail, and at **1200px** (75rem) the rail steps to 400px and body type from
17px to 18px. (Two smaller steps exist for type and padding only: 560px and 432px.)

Only the News rail is an `<aside>`. The identity rail is a plain `<div>`, because it
holds the page's `<h1>` and an `<aside>` would file the site's subject under a
*complementary* landmark, outside `<main>`.

The two rails share one background, so on desktop they read as a single continuous
band from the masthead rule to the footer rule.

## Third-party requests

This site used to make **zero** external requests. That is deliberately no longer true.
It now makes exactly two kinds, both on every page load, and both visible in
`index.html`:

| What | Host | When | If it is unreachable |
| --- | --- | --- | --- |
| Two webfonts (Source Serif 4, Inter) | `fonts.googleapis.com`, `fonts.gstatic.com` | every page load | The page renders in its fallback stacks (Charter / Sitka Text / Georgia, and Segoe UI / Helvetica / Arial) and never upgrades. Nothing blocks: the stylesheet link uses the `media="print"` + `onload` pattern precisely so a blocked font host cannot hold up first paint. Nothing moves sideways either — the measure, the grid tracks and the rail widths are identical in both font states, and the one place a font swap *used* to reflow the page (the masthead's one-row / two-row threshold, which sits at 390px in the fallback and 408px in Inter) is now pinned by a media query at 432px so the row count is the same either way. The page is a little taller in the blocked state, because fewer characters fit per line. This is the state the site owner sees from China. |
| Visitor-map badge | `mapmyvisitors.com` | every page load | The `<img>` fails, `static/js/scripts.js` sets `hidden` on the whole `.side-tracker` block, and the page looks exactly as it does with the tracker removed. No broken-image glyph, no reserved hole, no layout shift, no console error that stops anything else. |

MathJax is unchanged and is still opt-in: it is fetched from `cdn.jsdelivr.net` only
when a `.md` file actually contains TeX, which today none does.

### The visitor badge

The markup sits in `index.html` inside `<aside class="rail rail--meta">` and is **live**.
To switch it off, wrap the `<div class="side-tracker">` block in an HTML comment or
delete it outright; the CSS (`main.css` §10) and the JavaScript failure handler both
match nothing when it is absent, so nothing else has to change.

**Know what it is.** It is a third-party tracker. Every
visitor's browser fetches an image from mapmyvisitors.com, so mapmyvisitors
receives every visitor's **IP address**, and the response was observed to carry a
`set-cookie: PHPSESSID` header, i.e. it also sets a third-party cookie where the
browser allows one. For a site aimed at an EU/Swedish academic audience, that is
non-essential processing of the kind that normally requires a consent notice *before*
it happens. No consent notice ships. This is stated as a fact to weigh, not as advice.

The account id in that block is the site owner's; the dashboard is at
<https://mapmyvisitors.com/web/1c6v1>.

Two details of the snippet that are deliberate and easy to "fix" wrongly:

- It is the **static image** form, not the `map.js` widget. The widget loads jQuery
  1.12.4 from a fourth host, `eval()`s a JSONP response, and injects its own stylesheet
  containing a saturated red gradient button with a green hover — which cannot be
  overridden safely and contradicts this page's palette. With `w=a` it also skips its
  own 180–300px clamp and writes a fixed pixel width taken from the parent at load time
  (704px at a 768px viewport), and reserves a 139px min-height hole.
- The badge is loaded **eagerly at low fetch priority**, not with `loading="lazy"`,
  because lazy-loading an element at the foot of the sidebar would only count visitors
  who scroll to the bottom. Add `loading="lazy"` if you would rather count fewer people.

Please do not "restore" a `<script src>` MathJax tag to `<head>`: that reinstates a
~1 MB render-blocking request on every visit for a page that usually has no math.
If `cdn.jsdelivr.net` ever becomes unreachable and math stops rendering, the fix is
to vendor the bundle back — `git restore --source=17e223f static/js/tex-svg.js` — and
point the `script.src` in `scripts.js` at the local path.

The shields.io badge that used to sit in `contents/home.md` was removed on purpose; it
was the only external image reference the content files ever had. Do not restore it.

## Updating the content

| What you want to change | File to edit |
| --- | --- |
| Bio, contact, education, research interests | `contents/home.md` |
| Publication list | `contents/publications.md` |
| News entries | `contents/news.md` (rendered into the sidebar) |
| The portrait | `static/assets/img/photo.png`; the slot is switched on by uncommenting **one line** in `index.html`, inside `<div class="rail rail--id">` |
| Browser tab title, header name, page headings, copyright | `contents/config.yml` — seven keys, one per element id |
| CV linked from the nav and the sidebar | replace `contents/TiouWang_CV.pdf` |
| Layout, navigation links, page structure | `index.html` |
| Typography, colour, spacing | `static/css/main.css` |
| Contact details appear twice on purpose | the sidebar carries Email / CV / GitHub; `contents/home.md` also has a `#### Contact` block. If you want it once, delete `#### Contact` and the `Email:` line from `contents/home.md` — the sidebar already carries the address. Nothing in the layout depends on either copy. |

Two rules are easy to break and fail silently (the errors only reach the browser console):

**`config.yml` keys must equal element ids.** The key `home-subtitle` is written into
`<h1 id="home-subtitle">`; renaming one without the other leaves the element showing
its fallback text. Seven elements carry fallback text — `#title`, `#page-top-title`,
`#home-subtitle`, `#about-subtitle`, `#publications-subtitle`, `#news-subtitle` and
`#copyright-text` — so that the served HTML has a title, an accessible link name and
non-empty headings for consumers that never run JavaScript. Each must be byte-identical
to its value in `config.yml`; `#title` in particular is `Tiou Wang's Homepage`, not
`Tiou Wang`. That text is a *fallback*, not a second source of truth — `config.yml`
overwrites it — but if any of it changes, change it in both places.

**Adding a section takes several edits, not one:**

> **Where sections go.** The three direct children of `<main class="layout">` —
> `<div class="rail rail--id">`, `<div class="content">` and
> `<aside class="rail rail--meta">` — are **grid regions**, not content. A new
> `<section>` added as a direct child of `<main>` becomes a fourth grid item and lands
> in the sidebar column. Put it inside `<div class="content">`.

1. create `contents/<name>.md`;
2. add the section to `index.html`, **inside `<div class="content">`**, copying the
   classes exactly:

   ```html
   <section class="section" id="<name>">
     <h2 class="section-label" id="<name>-subtitle">Label Text</h2>
     <div class="prose" id="<name>-md"></div>
   </section>
   ```

   `section` supplies the measure and the divider above it, `section-label` the
   uppercase heading, `prose` every text style. A bare `<div id="<name>-md">` renders
   full-width in the browser's default type. There is no `.container` inside sections
   any more — the content column supplies its own gutters;
3. add `'<name>'` to `const section_names` in `static/js/scripts.js`;
4. add `<name>-subtitle: Label Text` to `contents/config.yml`, matching the fallback
   text in step 2 byte for byte. The config key set is closed on purpose, so skipping
   this leaves a config-shaped id that nothing writes to;
5. optionally add `<a href="#<name>">Label Text</a>` to the `<nav>` in `header.masthead`.
   It wraps, so up to about five links need no further attention;
6. optionally add the new file to the `<noscript>` note in `index.html`, which lists
   the content sources for readers with JavaScript disabled.

Add `class="pubs"` alongside `prose` only if the new section is a bibliography
that wants hanging indents. No CSS change is ever required.

Removing a section requires undoing steps 1–6. Sections render in `index.html` order.

## Previewing locally

`scripts.js` uses `fetch()`, which browsers block for `file://` URLs, so double-clicking
`index.html` gives a blank page. Serve the directory over HTTP instead, then open
<http://localhost:8000>:

```
python -m http.server 8000
```

This is also the harness for checking the blocked-third-party cases: add
`127.0.0.1 fonts.googleapis.com` and `127.0.0.1 mapmyvisitors.com` to your hosts file,
or use DevTools → Network → Request blocking, which is reversible and needs no admin
rights. Both cases are expected to leave the layout untouched; see *Third-party
requests* above for exactly what each one degrades to.

## Directory structure

```
.
├── README.md                       this file
├── LICENSE                         MIT — two copyright notices, both required
├── .gitignore
├── index.html                      page shell (placeholder elements only)
├── contents/
│   ├── config.yml                  key = element id (7 keys)
│   ├── home.md                     rendered into #home-md   (content column)
│   ├── news.md                     rendered into #news-md   (sidebar)
│   ├── publications.md             rendered into #publications-md
│   └── TiouWang_CV.pdf
└── static/
    ├── assets/
    │   ├── favicon.ico
    │   └── img/photo.png           the portrait; the slot is empty until you
    │                               uncomment one line in index.html
    ├── css/main.css                the entire stylesheet
    └── js/
        ├── js-yaml.min.js          vendored
        ├── marked.min.js           vendored
        └── scripts.js              the runtime described above
```

## Credits

Forked from [senli1073/academic-homepage-template](https://github.com/senli1073/academic-homepage-template),
based on StartBootstrap's [New Age](https://github.com/StartBootstrap/startbootstrap-new-age) theme.
Built with [marked](https://github.com/markedjs/marked) and
[js-yaml](https://github.com/nodeca/js-yaml), both vendored under `static/js/`, plus
[MathJax](https://www.mathjax.org/), which is not vendored — it is loaded from a CDN on
demand, only when a page actually contains math.

Type is Source Serif 4 and Inter, served from Google Fonts. The visitor map is
mapmyvisitors.com. Neither is vendored; see *Third-party requests* above for what
happens when either is unreachable.

## License

MIT — see [LICENSE](LICENSE). That covers this site's code, markup and styling,
and it retains the original template author's copyright alongside mine.

The written material under `contents/` — the biography, the publication list and
the CV — is © Tiou Wang and is not covered by the MIT grant.
