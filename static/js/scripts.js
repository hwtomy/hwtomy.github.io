

const content_dir = 'contents/'
const config_file = 'config.yml'
// INV-2: adding a section requires ALL THREE of a name here, a contents/<name>.md
// file that EXISTS (even if it holds nothing but a comment), and a
// <div id="<name>-md"> in index.html. Any one missing fails SILENTLY.
const section_names = ['home', 'publications', 'news']

// Sections are excluded from the TeX scan below (INV-3) by putting a `data-nomath`
// attribute on their target element in index.html. #news-md carries it: a future
// entry like "awarded a $50,000 grant, and later a $2M one" puts two dollar signs
// on one line, matches the inline-math pattern, and would inject the ~1 MB MathJax
// bundle from a CDN for a section that will never contain mathematics.
//
// `data-nomath` and MathJax's `ignoreHtmlClass: 'news'` (index.html) are two
// HALVES of the same protection and neither is sufficient alone: this attribute
// stops News from being the REASON the bundle is fetched; ignoreHtmlClass stops
// MathJax typesetting News if some OTHER section pulls the bundle in, since
// MathJax 3 typesets the whole document at startup. Markdown's \$ escape does not
// help either way: index.html sets processEscapes: false.


window.addEventListener('DOMContentLoaded', event => {

    // Yaml
    fetch(content_dir + config_file)
        .then(response => {
            // fetch() does not reject on 4xx/5xx. Without this check a missing
            // or misnamed file makes the server's 404 page the response body,
            // which jsyaml would then try to parse — failing far from the cause.
            if (!response.ok) throw new Error(response.status + ' ' + response.url);
            return response.text();
        })
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({
        mangle: false, headerIds: false,
        // contents/*.md use `####`, which marked emits as <h4>. Each section's
        // own title in index.html is an <h2>, so h2 -> h4 would skip a level in
        // the document outline. Clamp injected headings to h3. This is visually
        // inert: main.css §6 styles `.prose h3` and `.prose h4` with one
        // identical rule block, so the h4 selectors there stay useful for
        // hand-written HTML and this needs no CSS change and no content edit.
        walkTokens: token => {
            if (token.type === 'heading' && token.depth > 3) token.depth = 3;
        }
    })

    // TeX detection, run against the RENDERED HTML rather than the raw markdown,
    // because that is what MathJax will actually scan. The distinction matters:
    // `(`, `)`, `[`, `]` are escapable punctuation in markdown, so marked turns
    // \(x\) into (x) and \[x\] into [x] — those two delimiter forms can never
    // reach MathJax through this pipeline no matter what index.html configures.
    // The forms that DO survive are $...$, $$...$$ and \begin{...}, so those are
    // the three matched here. A closing delimiter is required for the dollar
    // forms: a lone `$` in prose (a price, a $PATH in a code span) cannot
    // produce math, and must not pull down a ~1 MB bundle for nothing.
    const math_pattern = /\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\begin\{/;
    let needs_math = false;

    const sections_loaded = section_names.map(name =>
        fetch(content_dir + name + '.md')
            .then(response => {
                // Same reason as above, with a worse failure mode: marked passes
                // raw HTML through (INV-5), so a 404 page would be injected into
                // the live page as content instead of erroring.
                if (!response.ok) throw new Error(response.status + ' ' + response.url);
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                // `target` is resolved BEFORE the math test so the opt-out
                // attribute can be read. See the note on data-nomath above.
                const target = document.getElementById(name + '-md');

                // INV-3, narrowed.
                if (!target.hasAttribute('data-nomath') && math_pattern.test(html)) needs_math = true;

                target.innerHTML = html;
                // `list-style: none` (main.css §7 and §10) makes WebKit drop the
                // implicit list/listitem roles, so VoiceOver stops announcing the
                // publication list — and now the news list — as a list. Re-assert
                // them on the generated elements; a no-op in Chrome and Firefox,
                // where the roles hold.
                target.querySelectorAll('ul, ol').forEach(l => l.setAttribute('role', 'list'));

                // Empty-section hook, consumed by main.css §10:
                //   #news-md[data-empty="false"] ~ .news-empty { display: none }
                // CSS :empty CANNOT do this. Per MDN it matches an element holding
                // only comments but NOT one holding whitespace (the Selectors L4
                // change is unimplemented everywhere), and marked passes raw HTML
                // through (INV-5), so a comment-only .md renders to a comment node
                // PLUS a trailing text node. Strip comments, then trim, then decide.
                // The attribute is set on every section; only #news-md is styled
                // from it, but the mechanism is generic for any future block.
                const solid = html.replace(/<!--[\s\S]*?-->/g, '').trim() !== '';
                target.setAttribute('data-empty', solid ? 'false' : 'true');
            })
            .catch(error => console.log(error))
    );

    // MathJax (INV-3), loaded on demand. The bundle is ~1 MB and render-blocking
    // if placed in <head>, so it is fetched only when some section actually
    // contains TeX — today, none does, so this request is never made. (It is no
    // longer the page's ONLY potential third-party request: see README.md.)
    // Waiting for every section first is what makes one pass enough: MathJax 3
    // typesets the whole document at startup, so arriving after the markdown is
    // injected covers all sections without any per-section chaining.
    Promise.all(sections_loaded).then(() => {
        if (!needs_math) return;
        if (document.getElementById('MathJax-script')) return;   // already requested
        const script = document.createElement('script');
        script.id = 'MathJax-script';
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        document.head.appendChild(script);
    });


    // The visitor badge (index.html, .side-tracker) is a third-party image.
    // If mapmyvisitors.com is slow, blocked or down the <img> fails and the
    // browser paints a broken-image glyph plus the alt text — a visible failure
    // in the corner of the sidebar. Hide the whole block instead, so a blocked
    // tracker is indistinguishable from no tracker.
    //
    // The block is LIVE in index.html. If it is ever deleted or commented out
    // again, the querySelector below simply finds nothing and this is a no-op,
    // so switching the badge off stays an index.html-only change.
    //
    // The `complete && naturalWidth === 0` check is not belt-and-braces: this
    // script is DEFERRED, so on a fast failure (a hosts-file block, an
    // extension, a closed port) the error event fires long before the listener
    // could attach, and an addEventListener-only version would silently never
    // run. That is exactly the case this handler exists for.
    //
    // Hiding removes 178px from the foot of the sidebar (measured: 112px image
    // + 32px padding-top + the 34px "Visitors" label and its margin). On the
    // grid layout that changes nothing — the band's height is driven by
    // whichever column is taller (main.css §3, grid row 2 is 1fr), and the page
    // height was measured identical with the host reachable and blocked: 1419px
    // at 1440x900. When stacked it removes those 178px from the very bottom of
    // the page, below the fold (1980 -> 1802 at 768px, 2376 -> 2198 at 375px).
    // No layout shift either way, and nothing above the badge moves in any
    // case. `.side-tracker__img` is the <img> INSIDE the <picture>;
    // <source> elements never fire `error` and never expose `complete`, so
    // querying the img is correct for both colour schemes.
    //
    // Deliberately NOT wired into the fetch() promise chain above: it must run
    // whether or not config.yml and the markdown files load, and it must not be
    // able to reject that chain.
    const badge = document.querySelector('.side-tracker__img');
    if (badge) {
        const hideTracker = () => {
            const block = badge.closest('.side-tracker');
            if (block) block.hidden = true;
        };
        badge.addEventListener('error', hideTracker);
        if (badge.complete && badge.naturalWidth === 0) hideTracker();
    }

});
