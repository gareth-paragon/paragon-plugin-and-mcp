# Paragon Markdown style rules

This document defines how we write and format Markdown for Paragon technical documentation: structure (headings, lists, code fences, and so on) and prose (plain English, punctuation, and terminology). It is the authoritative guide for contributors here.

Numbered sections (§1–§16) are deliberate: cite them in PRs, issues, reviews, and chat so reviewers and authors mean the same rule without pasting long excerpts. Use the heading anchor links in this file when you need a stable URL (for example `#3-line-length`).

## Contents

---

  - [How this relates to tooling:](#how-this-relates-to-tooling)
  - [Syntax vs. prose](#syntax-vs-prose)
- [How to read these rules](#how-to-read-these-rules)
- [Goals](#goals)
- [Minimum viable documentation](#minimum-viable-documentation)
- [Review culture (“better is better than best”)](#review-culture-better-is-better-than-best)
- [1. capitalization (product names)](#1-capitalization-product-names)
- [2. document layout](#2-document-layout)
  - [2.1 thematic breaks (horizontal rules)](#21-thematic-breaks-horizontal-rules)
- [4. trailing whitespace](#4-trailing-whitespace)
- [5. Headings](#5-headings)
  - [5.1 ATX headings](#51-atx-headings)
  - [5.2 unique, descriptive names](#52-unique-descriptive-names)
  - [5.3 Spacing](#53-spacing)
  - [5.4 single H1](#54-single-h1)
  - [5.5 title capitalization](#55-title-capitalization)
  - [5.6 plain heading text (no bold)](#56-plain-heading-text-no-bold)
  - [5.7 numbered section prefixes (ATX)](#57-numbered-section-prefixes-atx)
- [6. Lists](#6-lists)
  - [6.1 ordered lists](#61-ordered-lists)
  - [6.2 nested list spacing](#62-nested-list-spacing)
  - [6.3 procedural instructions](#63-procedural-instructions)
- [7. code (inline and fenced)](#7-code-inline-and-fenced)
  - [7.1 inline code](#71-inline-code)
  - [7.2 fenced code blocks](#72-fenced-code-blocks)
- [8. Links](#8-links)
  - [8.1 reference links vs. in-line links](#81-reference-links-vs-in-line-links)
- [9. Images](#9-images)
- [10. Tables](#10-tables)
- [11. markdown vs HTML](#11-markdown-vs-html)
- [12. paragon prose for documentation](#12-paragon-prose-for-documentation)
  - [12.1 prefer the active voice](#121-prefer-the-active-voice)
  - [12.2 write with appropriate confidence](#122-write-with-appropriate-confidence)
  - [12.3 Contractions](#123-contractions)
  - [12.4 first person when speaking for Paragon](#124-first-person-when-speaking-for-paragon)
  - [12.5 challenge buzzwords and clichés](#125-challenge-buzzwords-and-clichés)
  - [12.6 show, don’t tell](#126-show-dont-tell)
  - [12.7 plain English](#127-plain-english)
- [13. editorial conventions](#13-editorial-conventions)
  - [13.1 abbreviations and acronyms](#131-abbreviations-and-acronyms)
  - [13.2 Ampersands](#132-ampersands)
  - [13.3 bold and italics](#133-bold-and-italics)
  - [13.4 Brackets](#134-brackets)
  - [13.5 capital letters](#135-capital-letters)
  - [13.6 colons and semicolons](#136-colons-and-semicolons)
  - [13.7 Dates](#137-dates)
  - [13.8 exclamation marks](#138-exclamation-marks)
  - [13.9 full stops and bullets](#139-full-stops-and-bullets)
  - [13.10 gender-inclusive language](#1310-genderinclusive-language)
  - [13.11 “global” vs “international”](#1311-global-vs-international)
  - [13.12 Hyphens](#1312-hyphens)
  - [13.13 Jargon](#1313-jargon)
  - [13.14 kilometres and kilograms](#1314-kilometres-and-kilograms)
  - [13.15 lists in prose](#1315-lists-in-prose)
  - [13.16 Money](#1316-money)
  - [13.17 Numbers](#1317-numbers)
  - [13.18 OK and “online”](#1318-ok-and-online)
  - [13.19 Percentages](#1319-percentages)
  - [13.20 Quotations](#1320-quotations)
  - [13.21 Regions](#1321-regions)
  - [13.22 Spelling](#1322-spelling)
  - [13.23 claims and evidence](#1323-claims-and-evidence)
  - [13.24 Websites](#1324-websites)
  - [13.25 Years](#1325-years)
- [14. enforcement in this repository](#14-enforcement-in-this-repository)
  - [14.1 rule mapping (`MDxxx`)](#141-rule-mapping-mdxxx)
  - [14.2 automation coverage by section](#142-automation-coverage-by-section)
- [15. sources and acknowledgements](#15-sources-and-acknowledgements)
- [16. document360 publishing](#16-document360-publishing)
- [Appendix A. reference quick sheet](#appendix-a-reference-quick-sheet)
  - [16.1 titles, slugs, and the H1](#161-titles-slugs-and-the-h1)
  - [16.2 YAML front matter (required schema)](#162-yaml-front-matter-required-schema)
  - [16.3 links and internal navigation](#163-links-and-internal-navigation)
  - [16.4 images and attachments](#164-images-and-attachments)
  - [16.5 ownership after publish](#165-ownership-after-publish)
  - [16.6 implementation reference](#166-implementation-reference)
- [Changelog of this document](#changelog-of-this-document)

### How this relates to tooling:

Structural rules align with practices exemplified by Google’s public [Markdown documentation guide][g-docguide].

### Syntax vs. prose

We use repository automation for structural checks and prose support.

Structural checks focus on Markdown syntax and layout (headings, fenced-code
languages, list indentation, and related rules). These checks run in editor and
CI workflows. Wrap prose for readability in review.

Where automation conflicts with this document or with UK English spelling,
follow this document and use judgment.


## How to read these rules

---

| Term       | Meaning                                                       |
| :--------- | :------------------------------------------------------------ |
| **MUST**   | Follow unless there is a documented project exception.        |
| **SHOULD** | Strong default; depart only with good reason and consistency. |
| **MAY**    | Optional or context-dependent.                                |

Where this repo uses automation and scripts, that is noted under
[§14 Enforcement in this repository](#14-enforcement-in-this-repository).

When you reference Paragon Markdown rules elsewhere, prefer § numbers or Anchors (`#section-anchor`) - they stay stable when wording inside a section changes slightly.


## Goals

---

You **SHOULD** balance all of the following:

1. Source text is readable and portable.
1. The Markdown corpus is maintainable over time and across teams.
1. The syntax is simple and easy to remember.


## Minimum viable documentation

---

- You **SHOULD** prefer a small set of fresh, accurate documents over a large, inconsistent corpus.
- You **SHOULD** strongly prefer markdown to HTML for body content.
- You **SHOULD** identify what documentation is actually needed (release docs, API docs, testing guidelines, and so on).
- You **SHOULD** delete obsolete content frequently and in small batches.


## Review culture (“Better is better than best”)

---

Documentation review is not the same as code review.

Reviewers **SHOULD**:

1. When reasonable, approve (LGTM) and trust follow-up fixes.
1. Prefer a concrete alternative over a vague complaint.
1. For large extra work, use a follow-up change instead of blocking with “you should also…”.
1. Rarely block only if the change clearly worsens the docs.

Authors **SHOULD**:

1. Avoid trivial arguments; concede and move on when reasonable.
1. Use the “Better/Best” mindset so small improvements can ship often.


## 1. Capitalization (product names)

---

- You **MUST** preserve official capitalization of product, tool, and binary names (for example `markdown` as a product name, not `markdown` in titles when referring to the product).
- For titles and headings, you **SHOULD** use sentence-style capitalization
  where [Google’s capitalization guidance][dev-cap-head] applies.


## 2. Document layout

---

You **SHOULD** structure pages in a consistent pattern, for example:

1. One H1  -  document title (ideally aligned with the filename). This heading is often used as the page title in hosting systems.
1. Short introduction  -  one to three sentences for newcomers (“what is this? why do I care?”).
1. Body sections  -  `##` and deeper for topics.
1. Optional “See also”  -  links at the end for readers who need more.

Table of contents (where to use it): for internal repository guides (`README.md`, `CONTRIBUTING.md`, the ParaDOCS and Paragon rules files, and similar), you **SHOULD** add a `## Contents` block near the top with anchor links to the main `##` / `###` headings (GitHub generates stable heading IDs). For customer-facing articles published through Document360, you **SHOULD NOT** duplicate that outline - rely on the portal navigation and host outline instead (do not add `[TOC]` or a second manual Contents list).

Optional author attribution under the title is allowed; revision history often makes it unnecessary.

### 2.1. Thematic breaks (horizontal rules)

- **Internal** repository guides (`README.md`, `CONTRIBUTING.md`,
  `docs/ParaDOCS/ParaDOCS_User_Guide.md`, `docs/Repo_Quickstart.md`, this file,
  and similar maintainer-facing markdown): you **SHOULD** insert a thematic
  break (`---` on its own line) **immediately after each `##` heading** (one
  blank line between the heading line and the `---` line is recommended), so
  each top-level section opens with a consistent divider. do not place extra
  thematic breaks immediately before `##` lines, because many markdown previews
  render an H2 underline and a following `---` as a double rule. use one marker
  style (`---`) throughout so structure stays consistent.

- **Customer-facing** articles (especially document360 publish paths): you **SHOULD NOT** rely on thematic breaks between sections-use headings and portal navigation instead; decorative rules render inconsistently in hosts and exports.

- You **MAY** still use a thematic break outside those defaults when a divider is genuinely needed and a heading would misrepresent the outline.

YAML front matter: the `---` lines that wrap YAML at the top of a file (§16) delimit metadata and are not thematic breaks.

Enforcement: review in PRs. Use a consistent marker when thematic breaks appear;
ParaDOCS structural passes may still strip `---` inside ripped article
bodies-do not confuse that behaviour with hand-authored internal guides above.


## 4. Trailing whitespace

---

- You **MUST NOT** rely on trailing spaces at end of line (CommonMark uses two spaces for a hard break, but many tools strip them).
- You **SHOULD** use a trailing backslash `\` at end of line for intentional line breaks inside a paragraph, sparingly.
- You **SHOULD** prefer blank lines (new paragraphs) over hard breaks when possible.

Enforcement in this repository:** `.editorconfig` trims trailing whitespace on `*.md`.


## 5. Headings

---

### 5.1. ATX headings

- You **MUST** use ATX headings (`#` … `######`), not setext underlines (`===` / `---`).

### 5.2. Unique, descriptive names

- You **MUST** use unique, descriptive heading text so generated anchors are clear (avoid repeating bare summary / example under different parents without disambiguation - prefer foo summary, foo example, and so on).

### 5.3. Spacing

- You **MUST** put exactly one space after the `#` characters and before the heading text (`## heading`, not `##heading`).
- You **SHOULD** put blank lines before and after headings.

### 5.4. Single H1

- You **MUST** use exactly one `#` heading per document as the title; subsequent headings **SHOULD** start at `##`.

### 5.5. Title capitalization

- You **SHOULD** follow [capitalization for titles and headings][dev-cap-head] in the google developer documentation style guide.

### 5.6. Plain heading text (no bold)

- You **MUST NOT** use markdown bold (`**`) or italic (`_` / `*`) markup on ATX heading lines. heading level (`#` … `######`) already signals importance; emphasis inside headings duplicates styling and renders inconsistently across git hosts and portals.

Enforcement in this repository: heading format and style are validated through
automated checks and review. `Paragon/HeadingNoBoldMarkup` flags the `**`
delimiter in ATX heading lines; italic (`_` / `*`) there is still review (§14.2).

### 5.7. Numbered section prefixes (ATX)

When a heading’s title includes a section or chapter number in the source (outlines, legal-style documents, or after ParaDOCS rip with auto-number ATX headings), the number and the rest of the title **MUST** be separated by a full stop (dot) and a space after the last segment of the section id - not by a space only.

- You **MUST** use: `## 5. clients`, `## 1.1. scope`, `### 2.3.1. details`
- You **MUST NOT** use: `## 5 clients`, `## 1.1 scope` (space but no dot after the section id), except for legacy material you are not yet normalising.

Rationale: the dot makes the section id unambiguous and matches common book/contract numbering; it also avoids confusion with year-first titles (`2024 review` is not confused with section `2024.`).

Enforcement: review in PRs; ParaDOCS auto-number headings emits this form when enabled (`rip_auto_number_atx_headings`).


## 6. Lists

---

### 6.1. Ordered lists

- For long or frequently edited ordered lists, you **SHOULD** use lazy numbering (`1.` repeated); renderers renumber correctly.
- For short, stable lists, you **MAY** use explicit numbering (`1. 2. 3.`) for readability in source.

### 6.2. Nested list spacing

- For nested lists, you **SHOULD** use consistent indentation (the reference guide uses four spaces of indent for nested levels and aligned continuation lines in examples).
- You **MUST NOT** use irregular nesting or single-space bullets that break continuation alignment for wrapped text.
- For small, single-line, non-nested lists, a single space after the marker **MAY** suffice.

### 6.3. Procedural instructions

Documentation that tells the reader what to do (install, configure, navigate the UI, run commands in sequence) **SHOULD** use numbered ordered lists (`1.` …), not long paragraph blocks that bury steps in prose.

- Sequential steps (do A, then B, then C) **MUST** be a single ordered list, with nested ordered or unordered lists when a step has sub-parts (see §3.2 for indenting sub-lists and §1.2 for fenced code inside list items).
- Optional paths or branches **SHOULD** use list items whose lead-in labels them explicitly - for example `(optional)`, `optional:`, or a short heading immediately above that optional sequence - so readers can skim for required versus optional work.
- Caveats, “if you see X, do Y instead”, and other negative or corrective guidance **SHOULD** sit in a blockquote (or a note line) after the numbered steps, not as runbook lines that are only “do not …”.
- Short conceptual explanations may remain as paragraphs between headings or before the procedure list; keep instructions themselves in list form where readers must follow an order.

Enforcement in this repository: list marker and indentation checks are
automated. Ordered-list style allows both lazy and explicit numbering. §3.3
(procedures) is review-driven - automated checks do not detect
“paragraph vs procedure”; cite §3.3 in PRs for how-to edits.


## 7. Code (inline and fenced)

---

### 7.1. Inline code

- You **MUST** use backticks for short literal fragments: commands, flags, API names, and generic file types (`README.md` as a type).
- You **MUST** put **input values** in code: anything the reader types, pastes, or enters into a field or form (paths, emails, IDs, example strings, literal option values). Use inline backticks for short values; use a fenced code block (§7.2) for multi-line input. Do not leave typed values as plain prose.
- On-screen **field labels** and other UI chrome use bold, not code - see §13.3.
- You **SHOULD** wrap fake paths, example URLs, or anything that would autolink wrongly in backticks.

### 7.2. Fenced code blocks

- For multi-line samples, you **MUST** use fenced code blocks (triple backticks), not indentation-only code blocks.
- You **MUST** specify a language identifier on the opening fence (for example ` ```python `, ` ```shell `) so highlighting and tooling behave consistently.
- You **SHOULD** escape newlines in shell snippets with `\` at end of line when the command is meant to be copied as one logical line.
- You **MUST** indent fenced blocks inside lists so list markup stays valid (or use equivalent consistent indentation per your parser).

Enforcement in this repository: fenced code language tags are checked by
automation.


## 8. Links

---

- You **SHOULD** keep link URLs short in prose; prefer reference-style links or root-relative paths for internal docs when it helps.
- For links to other markdown pages in the same site, you **SHOULD** use the explicit site path (for example `/path/to/page.md`) rather than a long absolute URL when your host supports it.
- You **SHOULD** use same-directory relative links (`other.md`) when appropriate; you **SHOULD** avoid fragile `./` chains across directories when a stable absolute path exists.
- Link text **MUST** be informative  -  not “click here,” “link,” or the raw URL duplicated as the visible text unless necessary.
- For long URLs or repeated destinations, you **SHOULD** use reference-style links.
- You **SHOULD** place reference link definitions near the end of the section where they first appear (before the next heading), or at the end of the document if used in multiple sections.

### 8.1. Reference links vs. in-line links

Reference-style links split the visible text from the URL. In the body you write a short label, and define the destination once elsewhere (usually under a heading or at the foot of the document). That keeps paragraphs readable, avoids repeating long URLs, and matches how many hosts render Markdown.

Where the definitions go: Lines such as `[g-md]: https://example.com/…` belong outside the prose paragraphs - typically at the bottom of the Markdown file, after the last section of article body, grouped in one block so every URL is easy to find and edit. For longer pages you **SHOULD** prefix that block with a small heading such as `## References` or `## Link references`. If a destination is used only inside one section, you **MAY** place its definitions immediately after that section (before the next heading at the same or higher level) instead of the file foot (§2 summary list).

In prose - link text plus a tag (second pair of brackets):

```markdown
See the [Google Markdown guide][g-md] for layout rules.
```

Definitions - one line per destination (tag in lower case is a common convention; labels are case-insensitive in CommonMark):

```markdown
[g-md]: https://google.github.io/styleguide/docguide/style.html
```

Implicit link text - when the visible words match the tag, you can shorten the body to `[g-md][]` (still requires a `[g-md]: …` definition).

Optional title (tooltip in many browsers), after the URL:

```markdown
[g-md]: https://google.github.io/styleguide/docguide/style.html "Google docguide"
```

Contrast: inline links put the URL in the paragraph - `[Google Markdown guide](https://google. github.io/…)` - which is fine for short targets; use reference-style when the URL is long or the same destination appears more than once.

Examples in this repository: reference blocks at the end of `README.md`, `docs/CONTRIBUTING.md`, and at the bottom of this file.


## 9. Images

---

- You **SHOULD** use images sparingly; prefer simple screenshots when a picture is clearer than text.
- You **MUST** provide meaningful alt text for accessibility.
- For image syntax details, follow your host’s markdown (see for example [gitiles image syntax][gitiles-img]).


## 10. Tables

---

- You **SHOULD** use tables only when data is genuinely tabular (quickly scannable across rows and columns).
- You **SHOULD** prefer lists when the content is really a list of items, not a matrix.
- You **SHOULD** keep tables small and readable; use reference links in cells when URLs would make table rows unwieldy.


## 11. Markdown vs HTML

---

- You **MUST** use standard markdown over raw HTML for content that markdown can express.
- You **SHOULD** avoid “HTML hacks” that harm readability or portability of the corpus; every exception makes plain-text and third-party tooling less useful.


## 12. Paragon prose for documentation

---

These rules apply to technical documentation (runbooks, product docs, repo guides). They favour clarity and accuracy over promotion.

### 12.1. Prefer the active voice

Active voice is direct and clear. Passive voice often reads distant or vague.

Avoid: A range of templates were created by the team.\ Prefer: The team created a range of templates.

### 12.2. Write with appropriate confidence

You **SHOULD** state what you know plainly. Avoid empty hedging (perhaps, maybe) unless uncertainty is the point. If a fact is unknown, say so or omit it.

Refer to people naturally: employees / staff can sound cold in Paragon copy - colleagues or people are often better.

### 12.3. Contractions

You **SHOULD** use contractions where they match spoken English and improve
flow.

| Formal   | Often better |
| -------- | ------------ |
| We are   | we’re        |
| You are  | you’re       |
| Will not | won’t        |
| Does not | doesn’t      |

### 12.4. First person when speaking for Paragon

When the document voice is Paragon as an organisation, you **MAY** use we / our instead of repeating the company name in every sentence - but **SHOULD** keep the subject clear (product name, team, or system when needed for precision).

### 12.5. Challenge buzzwords and clichés

You **SHOULD** replace vague promotional wording with specific facts, steps, or metrics. Watch especially for overused terms such as:

360 service / view · best-in-class · continuous improvement · cutting-edge · experienced _(as empty filler)_ · physical _(as vague filler)_ · going forward / moving forward · innovative _(when generic)_ · journey to · market leading · unprecedented · one-stop shop · unique _(when generic)_ · value add

### 12.6. Show, don’t tell

Avoid: We are market leaders in X.\ Prefer: Short, verifiable specifics (scale, scope, standards) that let readers judge for themselves. Avoid stacking empty adjectives (perfect, unique, dynamic) without evidence.

### 12.7. Plain English

You **SHOULD** prefer short, plain words. Examples:

| Instead of…     | Consider…      |
| --------------- | -------------- |
| Additional      | Extra          |
| Advise          | Tell, explain  |
| Allows          | Lets           |
| Beneficial      | Helpful, useful |
| Clarify         | Explain        |
| Commence        | Start          |
| Complete        | Fill in        |
| Consequently    | So             |
| Determine       | Find out       |
| Ensure          | Make sure      |
| In excess of    | More than      |
| In respect of   | For            |
| In the event of | If             |
| Key (important) | Main           |
| Prior to        | Before         |
| Purchase        | Buy            |
| Regarding       | About          |
| Terminate       | End            |
| Whilst          | While          |

Use judgment in legal, contractual, or quoted material where a fixed phrase is required.


## 13. Editorial conventions

---

### 13.1. Abbreviations and acronyms

- You **SHOULD NOT** use full stops in common abbreviations (ltd, inc, mr, mrs, dr).
- You **SHOULD** punctuate latin abbreviations correctly (i. e., e. g., etc.).
- You **MUST** spell out an acronym on first use in a document, then give the short form in brackets - e. g. direct mail (DM) - unless the audience is known to know it.

### 13.2. Ampersands

You **SHOULD NOT** use & except in brand names (e. g. M&S) or where and would be misleading.

### 13.3. Bold and italics

Bold follows the spirit of [Google’s developer documentation guide][dev-style] (emphasis and readability). In Markdown use `**` for bold; avoid `__`-double underscores are easy to confuse with emphasis in editors. Avoid raw `<b>` in ordinary repo Markdown unless your publish pipeline requires HTML.

**Where bold is required or allowed**

- **UI elements (required)** - You **MUST** bold text as it appears in the interface: menus, buttons, dialog titles, tabs, field labels, form options, toggles, and other on-screen chrome (match capitalization to the product). Example: Open **Settings**, then choose **Plugins**. Values typed into those controls use code (§7.1), not bold.
- **Company and product names** - where official spelling and capitalization
  matter (see §1); tool and binary names when referring to the product (for
  example, `ParaDOCS`) rather than generic english words.
- **Run-in labels at the start of notices** - short lead-ins such as **note:** or **important:** before the rest of the sentence, when you use a notice pattern (aligned with Google’s guidance for notices and run-in headings).

Do **not** use bold for generic emphasis, hype, or rhetorical stress in internal guides (`README.md`, `docs/*.md`, and similar). Importance should come from clear sentences, headings, and lists.

**Exception - this rules file:** Normative statements in §1–§16 keep **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in bold so requirement levels remain easy to scan. Other internal docs should **not** bold those keywords unless quoting this guide.

You **MUST NOT** use bold or italic markup on ATX heading lines - see §2.6.

**Italics**

Use italics sparingly. In Markdown prefer `_single underscores_` over `*asterisks*` so reviewers can tell italics from bold at a glance.

- Use italics when introducing or discussing a term, or when using a word as a word (_term_, “the verb _grep_”).
- For semantic emphasis (importance in running text), prefer italics over bold or underline-but often neither is needed if the sentence is clear.
- Italicize titles of books, films, web series, and other full-length works when they are not part of a link (see your cross-reference style).
- Italicize mathematical variables (_x_, _y_); do not italicize operators such as `+`. italicize version placeholders such as _1.4.x_ when documenting patterns.

### 13.4. Brackets

If a full sentence is inside brackets, put the full stop inside the brackets. Otherwise keep the full stop outside (like this).

### 13.5. Capital letters

You **SHOULD NOT** use BLOCK CAPITALS for emphasis. Capitalise proper nouns. In headings, sentence case is enough.

### 13.6. Colons and semicolons

- Colon: introduce a list or a full quotation.
- Semicolon: a pause longer than a comma, shorter than a full stop.

### 13.7. Dates

Use a clear regional form. For UK audiences: Wednesday 21 December 2022 or 21/12/22 - be consistent within a document.

### 13.8. Exclamation marks

Use very sparingly. Never stack (!!!).

### 13.9. Full stops and bullets

Full stops end sentences. You **SHOULD** avoid full stops at the end of bullet points unless each bullet is a full sentence - stay consistent within a list.

### 13.10. Gender-inclusive language

Examples: spokesperson not spokesman; chair not chairman; humankind not mankind; salesperson not salesman.

### 13.11. “Global” vs “international”

You **SHOULD** prefer international when describing footprint - it is often clearer.

### 13.12. Hyphens

Hyphenate compound adjectives before a noun - e. g. round-the-clock support. Often no hyphen when the same words follow the noun - e. g. support round the clock.

You **MUST NOT** use the em dash (Unicode U+2014). Prefer commas, colons, parentheses, or rephrase the sentence. If you need a simple break in running text, use a spaced hyphen (` - `) rather than an em dash.

### 13.13. Jargon

You **SHOULD** remove unnecessary jargon; explain specialist terms on first use.

### 13.14. Kilometres and kilograms

Abbreviate km, kg.

### 13.15. Lists in prose

You **SHOULD** avoid more than three comma-separated items in one sentence; for longer series, use bullets or a table. Sequential how-to instructions belong in ordered lists, not buried in a long paragraph.

### 13.16. Money

Use currency symbols (£, $, €). Show decimals only when they matter-for example £100.50, not £100.00 when cents are zero.

### 13.17. Numbers

- In running text, spell out one through nine; use numerals from 10 upward (unless a different convention is required by a standard you are quoting).
- Ordinals: spell first through twentieth, then 21st, 22nd, etc.
- Thousands separators: 1,000 not 1000.
- Prefer decimal fractions (3.5) where appropriate.

### 13.18. OK and “online”

Write OK, not ok or okay. Online is one word.

### 13.19. Percentages

Use the % symbol. For ranges: 30–40% (symbol once at the end).

### 13.20. Quotations

Introduce quotations with a colon where appropriate. Use double quotes for quotations; single quotes for a quotation inside a quotation. Place full stops inside closing quotes when the quote is a full sentence.

### 13.21. Regions

Use accepted short forms (UK, US). Capitalise named regions (North America); lower case for general areas (the north of England).

### 13.22. Spelling

You **SHOULD** use UK English in Paragon documentation. Watch editor defaults (Microsoft Word often defaults to US). Proofread important changes; do not rely on cSpell, Vale, or other automated spell checkers for domain terms.

Automated language checks may assume US English defaults; this section takes
precedence for spelling when they differ.

### 13.23. Claims and evidence

Large claims **SHOULD** be supported by evidence (metrics, citations, reproducible steps). Unsupported sweeping statements weaken credibility.

### 13.24. Websites

When writing a site address in full, include www. where that is the canonical form - e. g. www. paragon. world.

### 13.25. Years

- Financial years: 2022/23
- Ranges: 2010–11


## 14. Enforcement in this repository

---

| Area                                                                                  | Tooling                                                                 |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Prose (wording, headings, terminology)                                                | `Paragon_Markdown_Style_Rules.md` and editorial review (no automated spell or Vale checks) |
| Markdown structure (ATX, fenced language, list indent, and so on)                   | `markdownlint-cli2` (`npm run lint:md`; GitLab `docs_lint`, advisory)   |

Overrides: Paragon rules in this document and repository style overlays
**MAY** override strict upstream defaults (for example UK spelling and no
em dash). Use judgment and stay consistent within a page.

### 14.1. Rule mapping (`MDxxx`)

Repository checks implement structural rules from this document. Prose quality
still requires review judgment. Common alignments:

| Paragon section | Topic | Typical enforcement |
| --------------- | ----- | ------------------- |
| §2.1 | Internal guides: `---` immediately after each `##`; customer-facing: avoid decorative HRs; rips: ParaDOCS may strip `---` | Structural check + review |
| §4 | Clean line endings | EditorConfig / trims |
| §5 | ATX headings (`#`) | Structural check |
| §5.6 | No bold (`**`) / italic markup in heading lines | Pattern check + review |
| §6 | Unordered list marker (`-`) | Structural check |
| §6 | Nested list indent | Structural check |
| §6 | Ordered-list style (`1.` lazy vs counted) | Allowed by policy |
| §6.3 | Procedural instructions (ordered steps, optional labelling) | Review |
| §7 | Language on fenced blocks | Structural check |
| §7 | Fenced vs indented code blocks | Structural check |

Other structural defaults remain enabled unless explicitly overridden in repo
configuration. Duplicate heading checks may be relaxed in some cases; §5.2
still recommends unique, descriptive headings.

### 14.2. Automation coverage by section

This table is a routing guide, not a full § ↔ one-check mapping. Structural
checks cover many defaults beyond §2.1; prose checks and editorial review apply
across the whole document, not one rule per §1.x bullet.

| Sections | Structural / layout | Prose | Scripts & review |
| -------- | ------------------- | ------------ | ---------------- |
| Intro sections (Goals, minimum documentation, review culture) |  -  |  -  | Editorial judgment only |
| §1 |  -  | Headings / terms (indirect) | Product names by review |
| §2–§2.1 | Thematic-break consistency checks |  -  | §2.1: internal guides use `---` immediately after each `##`; customer-facing articles **SHOULD NOT** rely on decorative HRs; ParaDOCS may strip `---` in ripped bodies |
| §1 | EditorConfig trims trailing space |  -  |  -  |
| §5 | Heading-structure defaults | Heading style checks | §5.6: `HeadingNoBoldMarkup` |
| §6–§7 | Structural checks for lists and code fences |  -  | §6.3 procedures: review |
| §2–§2 | Defaults (links, images, raw HTML, …) |  -  | Mostly defaults + judgment |
| §12–§13 |  -  | Editorial review and style guide | UK spelling (§13.22) by judgment, not automated spell checkers |
| §1 |  -  |  -  | `scripts/sync_repo_document360_front_matter.py`; `scripts/check_document360_front_matter.py` |


## 15. Sources and acknowledgements

---

- Markdown structure and repository hygiene: derived from [Google’s markdown style guide][g-docguide] (creative commons attribution 4.0; see the footer on that page). paragon adopts these practices as our standard; the live google guide remains useful for extra examples.
- Automated prose checks: [google developer documentation style guide][dev-style], implemented with repository writing checks and Paragon overlays.
- Paragon-specific prose and editorial rules: consolidated from prior paragon technical writing practice and material previously published in this repo as `Paragon_Tone_of_Voice_Guidelines.md` (marketing- and channel-specific content was removed; this document keeps what applies to documentation).


## 16. Document360 publishing

---

Markdown in this repository may be published or synced to Document360 (D360) as part of the wider documentation pipeline. These rules complement Document360’s own product docs; they set authoring expectations so articles import cleanly, stay searchable, and do not fight ParaDOCS-generated YAML.

### 16.1. Titles, slugs, and the H1

- You **SHOULD** keep the single document H1 and the reader-facing title aligned. ParaDOCS can emit `title` and `slug` in YAML from the output filename when `document360_*` settings are enabled-see [ParaDOCS user guide](ParaDOCS_User_Guide.md) (document360 YAML front matter and settings).
- For hand-authored articles, pick stable filenames (`topic-name.md`) when filenames drive slug or URL generation in your sync or import tooling.

### 16.2. YAML front matter (required schema)

These rules mirror `prepend_document360_front_matter` in `paradocs.py` (same keys, order, and double-quoted string escaping as `_yaml_double_quoted_string`).

- Internal guides: `MARKDOWN_NO_DOCUMENT360_FRONT_MATTER` in `scripts/document360_yaml.py` lists repo-relative paths (`README.md`, `docs/Cursor-Docs-Changelog.md`, `docs/CONTRIBUTING.md`, this file, `docs/ParaDOCS/ParaDOCS_User_Guide.md`, `docs/Repo_Quickstart.md`, `docs/Cursor_Document360_MCP.md`, `scripts/README.md`) that **MUST NOT** contain a document360 YAML block in git. `sync_repo_document360_front_matter.py` strips leading `---` metadata there; `check_document360_front_matter.py` rejects it if present. `templates/doc-template.md` remains the canonical example with full YAML for copy-paste into new articles.
- All other `*.md` files: you **MUST** keep YAML front matter at the top, using the fullest field set ParaDOCS can emit (below). after meaningful body edits, run `python scripts/sync_repo_document360_front_matter.py` so `description`, `last_updated`, `source_checksum`, and optional `canonical_url` stay accurate. validate with `python scripts/check_document360_front_matter.py` before merge when you touch markdown.
- In ParaDOCS (`settings.json`): keep `document360_front_matter_enabled` `true` and every `document360_include_*` field `true` so rips include title, slug, description, tags, visibility, created, last_updated, source_system, source_file, source_checksum, ado_id (when present), and canonical_url (when a canonical base URL is configured). names match `DEFAULT_SETTINGS` in `paradocs.py` (`document360_include_title`, …, `document360_include_canonical_url`).
- `source_system` is `"paradocs"` when ParaDOCS generated the file; use `"repository"` when the file is maintained in git and front matter was produced (or refreshed) only by `sync_repo_document360_front_matter.py`.
- `canonical_url` is emitted only when `document360_canonical_base_url` is set (ParaDOCS) or `DOCUMENT360_CANONICAL_BASE_URL` is set for the sync script.
- Joining rules match `_document360_canonical_url` in `paradocs.py` (`document360_canonical_use_docs_path` / `document360_canonical_docs_prefix`).
- `ado_id` appears only when ParaDOCS has a work item id for the rip; omit it in purely hand-authored pages unless your workflow assigns one.
- ParaDOCS does not emit `category`, `status`, `version`, `author`, or `review` (see `prepend_document360_front_matter` docstring). do not add conflicting duplicate `---` blocks unless your importer merges them.

Field reference (always present unless noted):

| Field | Role |
| ----- | ---- |
| title | Article title (`doc_name` with `_` → spaces). |
| slug | Lowercase slug from doc/filename stem. |
| description | Plain-text preview (~240 chars from body per `_rough_plain_preview_for_description`). |
| tags | `tags: []` unless you intentionally populate tags. |
| visibility | `"public"` (ParaDOCS default). |
| created | ISO‑8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`). Preserve on refresh when possible. |
| last_updated | Same format; bump when content changes. |
| source_system | `paradocs` or `repository` (see above). |
| source_file | Repo-relative POSIX path to the `.md` file. |
| source_checksum | SHA-256 hex of UTF-8 body after stripping YAML (ParaDOCS algorithm). |

When ParaDOCS prepends YAML, you **SHOULD NOT** manually add a second YAML front matter block (`---` … `---`) unless your pipeline merges blocks.

Treat `canonical_url`, `slug`, and `description` as publish-facing for search and SEO in D360.

### 16.3. Links and internal navigation

- You **SHOULD** use stable relative links between repo markdown files where your publisher preserves paths, and prefer reference-style links for long URLs so body text and lint checks stay manageable.
- Manual `## contents` blocks with in-page anchors belong on internal repo markdown (§2); avoid them on customer-facing articles where the portal supplies navigation.
- Remember that categories, versions, “featured” placement, and left-nav trees are usually edited in document360, not in git - record any exceptions (what must be edited only in the portal versus only here) in `CONTRIBUTING` or your team’s runbook.

### 16.4. Images and attachments

- You **SHOULD** store images beside or under predictable repo paths and use repository-relative markdown image syntax (§1) matching what your import or sync step uploads or rewrites for D360.
- You **MUST NOT** embed local absolute paths (for example `C:\...`) in markdown destined for publish.

### 16.5. Ownership after publish

- You **SHOULD** agree which system is authoritative once an article is live (repo markdown versus edits in the D360 editor) so content does not fork unintentionally between two sources of truth.

### 16.6. Implementation reference

Shared helpers live in `scripts/document360_yaml.py` (same escaping and checksum rules as `paradocs.py`).

- Refresh repo YAML with `scripts/sync_repo_document360_front_matter.py`.
- Validate with `scripts/check_document360_front_matter.py` (optional `DOCUMENT360_REQUIRE_CANONICAL` / `DOCUMENT360_REQUIRE_ADO_ID` for stricter CI).


## Changelog of this document

---

| Date       | Change                                                                                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-19 | §7.1: input values **MUST** be code (inline or fenced). §13.3: UI elements **MUST** be bold; distinguish labels (bold) from typed values (code). Enforced for human and AI authoring via `ui-labels-and-input-values` (ParaDOCS plugin and `cursor-test` project rule). |
| 2026-04-21 | §16.2 internal guides list and `MARKDOWN_NO_DOCUMENT360_FRONT_MATTER`: added `docs/Cursor_Document360_MCP.md` (Cursor MCP for Document360; maintainer-facing, no D360 YAML in Git).                                                                                                                                                                                                                                                               |
| 2026-04-21 | §16.2 internal guides list: added **`scripts/README.md`** (mirror of ParaDOCS User Guide **Scripts** section; no D360 YAML in Git).                                                                                                                                                                                                                                                                                     |
| 2026-04-18 | Paragon Markdown style rules: Markdown structure (from Google’s public docguide), documentation prose and editorial conventions (consolidated from prior Paragon practice), repo tooling mapping; supersedes separate Google-rules and tone-of-voice Markdown files. |
| 2026-04-19 | §2.1 revised: internal guides **SHOULD** use `---` between top-level `##`; customer-facing articles **SHOULD NOT** rely on decorative HRs. §1.3: bold for UI labels, company/product names, notice run-ins (`**`, not `__`); italics conventions (`_`, sparingly); normative **MUST**/**SHOULD**/**MAY** bold only in this rules file. §2.6 **MUST NOT** bold/italic in ATX headings. Earlier §2.1 note: ParaDOCS structural pass may strip `---` in ripped bodies. §2.2 table; `Paragon/HeadingNoBoldMarkup`. §2.1 reference links; §1.2 internal guides omit D360 YAML in Git; §3.3 procedural lists. |
| 2026-04-20 | §2.1 clarified: internal guides **SHOULD** place `---` **after** each `##` (not before), with a blank line between the heading and the rule, so browser previews do not stack an H2 underline on a thematic break. |


## Appendix A. Reference quick sheet

---

### A.1 Rule-to-tool map

| Topic | Primary rule area | Typical enforcement |
| --- | --- | --- |
| Heading format, numbering, and no bold in ATX | §5 | Structural checks + style checks + rip passes |
| List style and marker consistency | §6 | Structural checks |
| Code fences and language tags | §7 | Structural checks |
| Link style and reference links | §8 | Structural checks + review |
| Table structure and readability | §10 | Structural checks |
| Prose tone and editorial conventions | §12 and §13 | Writing checks + reviewer judgment |
| Document360 YAML policy | §16 | repo scripts + CI checks |

### A.2 Repository scripts (from repo root)

| Purpose | Command |
| --- | --- |
| Refresh D360 YAML on tracked docs | `python scripts/sync_repo_document360_front_matter.py` |
| Validate D360 YAML policy | `python scripts/check_document360_front_matter.py` |

### A.3 Review shorthand used in PRs

| Shorthand | Meaning |
| --- | --- |
| `§5.6` | Heading text should not include bold/italic markup. |
| `§7.1` | Input values and other short literals must use code (inline or fenced). |
| `§13.3` | UI elements (menus, buttons, form options) must be bold. |
| `§2.1` | Thematic break (`---`) immediately after each top-level `##` in internal guides. |
| `MD007` | Nested list indentation style mismatch. |
| `MD040` | Fenced code block missing language info string. |
| `MD046` | Inconsistent fenced code block style. |

> **Note**
> Use section references (`§n`) in PR comments to reduce ambiguity and keep
> review feedback objective.

<!-- Reference-style URLs (URL lines here may be long). -->

[g-docguide]: https://google. github.io/styleguide/docguide/style.html
[dev-cap-head]: https://developers. google.com/style/capitalization#capitalization-in-titles-and-headings
[dev-style]: https://developers. google.com/style/
[gitiles-img]: https://gerrit. googlesource.com/gitiles/+/HEAD/Documentation/markdown.md#Images
