<!-- =====================================================================
     NEWS. This file is intentionally EMPTY. While it holds nothing but
     this comment, the sidebar shows the NEWS label and the line
     "No updates yet." and nothing else.

     TO ADD AN ENTRY, delete this comment block and write one markdown
     list item per item, NEWEST FIRST. These two lines are a FORMAT
     DEMONSTRATION, not real entries; they are deliberately not factual:

         - **Mon YYYY** One sentence describing the update.
         - **Mon YYYY** One sentence describing an older update.

     CONVENTIONS

     * Date first, in bold, then a space, then the sentence. No dash, no
       colon and no long dash after the date: the stylesheet puts the
       bold run on its own line above the entry text (main.css section
       10, `.news li > strong:first-child`). An entry written without a
       bold date still renders correctly, just inline.

     * Date format is a three letter month followed by a four digit
       year, written as "Mon YYYY" in the demonstration above. No day.
       Academic news is month granular and the day is noise in a 250 to
       310px column.

     * Newest at the top, always.

     * THERE IS NO HEIGHT LIMIT AND NOTHING IS EVER CLIPPED. The rail
       has no max-height, no overflow and no sticky box, so a long list
       just makes the page longer. Keeping the list short is EDITORIAL,
       not technical.

     * Recommended length: about six entries. Move older ones into the
       ARCHIVE comment at the bottom of this file. HTML comments pass
       through the markdown renderer untouched and render nothing, so
       the text is kept but not shown.

     * HOW MUCH IS VISIBLE WITHOUT SCROLLING, measured in a browser on
       a 1366x768 laptop (about 628px of usable viewport). One entry is
       one date line plus about two lines of text: measured 79px
       including its gap.
           photo slot EMPTY  - the NEWS label sits at 404px, leaving
                               about 224px: the label plus about 2
                               entries are on the first screen.
           photo slot FILLED - the NEWS label sits at 620px, i.e. just
                               below the fold: 0 entries on the first
                               screen.
       At 1440x900 (about 760px usable) the figures are about 4 entries
       and about 1 entry respectively. These are VISIBILITY numbers, not
       capacity limits. Nothing beyond them is hidden, only scrolled to,
       and nothing is ever clipped: measured with 20 two line entries,
       the page grew from 1419px to 2397px at 1440 wide and from 2376px
       to 3926px at 375 wide, and the band still ended exactly on the
       footer rule at both. How much a given list adds depends on how
       long the entries are, so treat those two numbers as the shape of
       the effect rather than as a constant.

     * DO NOT put two dollar signs on one line, e.g. "a $50,000 grant
       and a $2M award". Two of them look like inline TeX. This section
       is protected in two places that are halves of one job: the
       `data-nomath` attribute in index.html keeps News out of the math
       SCAN in static/js/scripts.js, and MathJax's `ignoreHtmlClass`
       option in index.html keeps News from being TYPESET if some other
       section ever pulls the bundle in. Neither alone is sufficient.
       Even so, keep entries plain and write "USD 50,000" instead. Note
       that a backslash before the dollar sign does NOT escape it here:
       index.html sets processEscapes to false.

     * THE PHOTO SLOT is not in this file. It is in index.html, in the
       first rail (the div with class "rail" plus the id modifier),
       above the name, with its own instructions. The News block is in
       the SECOND rail, with the content column between them in the
       source order.
     ===================================================================== -->

<!-- ARCHIVE, not displayed. Move old entries here rather than deleting
     them:

     ===================================================================== -->
