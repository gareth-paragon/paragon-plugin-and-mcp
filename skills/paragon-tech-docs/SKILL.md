---
name: paragon-tech-docs
description: Writes and edits Paragon technical Markdown with a required Overview, UK English, published tone of voice, and no promotional copy. The paragon-tech-docs skill applies when creating or changing technical documentation, runbooks, product how-tos, architecture notes, API or operations docs, or Markdown guides for engineers and operators.
---

# Paragon technical documentation

Use this skill for technical documentation. Do not use it for marketing campaigns, landing-page copy, or code-only changes.

## Start with the repository

1. Read the target file and nearby documentation before drafting.
2. Match the local heading depth, link style, filenames, and image paths.
3. Check code or source documentation before naming APIs, flags, commands, versions, or UI.
4. Ask when a fact cannot be verified. Do not invent behaviour or links.
5. If repository instructions conflict with this skill, follow the more specific repository instruction.

## Ask before splitting a large topic

Propose multiple Markdown files before drafting when any of these apply:

- The topic serves more than one audience or job, such as installation, operation, troubleshooting, and architecture.
- It contains two or more procedures that readers would not complete in one sitting.
- The outline needs more than about four body H2s after **Overview**, excluding **Prerequisites**, **Out of scope**, and **See also**.
- Combining reference material with a how-to would make either difficult to scan.

Suggest two to five `topic-name.md` filenames, give each a one-line purpose, identify the entry point, and wait for confirmation. Do not create a collection of files or an index page without approval.

Each approved file must have its own **Overview** and link to its siblings under **See also**.

## Structure every new page

Use this skeleton:

```markdown
# Sentence-case title

## Overview

Explain what the document covers, who it is for, and what the reader can do after reading it. Keep this to two to four factual sentences.

## Prerequisites

Omit this section when there are no prerequisites.

## Topic heading

Add the necessary content.

## Out of scope

Add this section only when the title could promise more than the page covers.

## See also

- [Related topic](related-topic.md)
```

The first H2 must be exactly `## Overview`. Do not put **Introduction**, **Summary**, **About**, or another H2 before it. When editing an existing page, add **Overview** if it is missing, or rename a leading introduction that already serves the same purpose.

Do not add a manual contents list. Do not add decorative horizontal rules.

## Guide the reader with numbered lists

Use an ordered list whenever the reader must do, follow, choose, check, or complete a finite set of items. This includes procedures, UI paths, decision paths, and finite checklists.

- Keep optional work in the ordered list and label it `Optional:`.
- End every procedure with a verification step that tells the reader what success looks like.
- Use unordered lists only for genuinely unordered sets, such as related concepts or **See also** links.
- Do not bury sequential instructions in paragraphs.

## Write secure examples

Treat documentation as visible to everyone who can read the repository.

1. Use obvious placeholders such as `YOUR_API_KEY` and `user@example.com`.
2. Never include real tokens, passwords, private keys, connection strings, personal data, customer data, or restricted internal URLs.
3. Refer to environment variables or an approved secret store instead of putting secrets in commands.
4. Mark production-sensitive or irreversible actions with a **Warning**.
5. Prefer least-privilege roles and permissions.
6. Do not recommend disabling TLS, sharing administrator credentials, or copying production data locally. If the user requires a documented exception, identify it explicitly as an exception and explain the risk.
7. Check screenshots for credentials, customer data, personal data, and restricted URLs before including them.

## Use callouts strategically

Most guidance belongs in prose, numbered lists, or tables. Use a callout only for one point the reader must not miss.

- **Warning:** irreversible actions, production impact, data loss, or security risk.
- **Important:** a constraint that makes the procedure fail when skipped.
- **Note:** a short aside that would interrupt a procedure.
- **Tip:** optional advice; use sparingly and prefer an `Optional:` numbered item.

Use portable Markdown:

```markdown
> **Warning:** This command permanently deletes the selected records.
```

Never stack callouts. Do not use a callout for slogans, to repeat **Overview**, or to tell readers to read the page. Match a repository-specific callout pattern only when nearby pages already use one.

## Use tables only for comparisons

- Use a table only when readers need to compare values across rows and columns.
- Put a heading and a short lead-in sentence before every table.
- Never place two tables back to back.
- Prefer one table per section. Combine closely related matrices or separate them with explanatory prose.
- Prefer a list when the content is not genuinely tabular.
- Keep tables readable in source; use reference links for long URLs.

## Link and reference information

- Use descriptive link text that names the destination. Do not use “click here”, “here”, or a raw URL as the label.
- Use real relative Markdown links for repository files. Check that the target exists; never invent a path.
- Link sibling pages under **See also** when a topic is split.
- Use same-page links only when they materially help navigation. Do not create a manual contents list.
- Use an official, verified URL for vendor documentation or standards. Ask when it cannot be verified.
- Cite non-obvious versions, service levels, mandatory controls, legal statements, and security claims. If no reliable source is available, qualify the statement or omit it.
- Use inline links for short, one-off URLs. Use reference-style links when a URL is long or repeated.
- Do not turn a UI label into a link unless the control itself navigates.

## Make commands usable

1. Put multiline commands in fenced blocks with a language such as `bash`, `powershell`, or `text`.
2. State the working directory, operating system, shell, permissions, or prerequisites when they affect the result.
3. Keep one command per logical step where practical.
4. Distinguish commands from sample output.
5. Put values the reader types in inline code. Bold the on-screen label; do not put the label in code.

## Keep the Paragon documentation voice

- Use active voice, contractions, plain English, and UK spelling.
- State known facts directly. Identify uncertainty instead of hiding it with vague hedging.
- Use `we` and `our` when speaking clearly as the organisation. Prefer the product, system, team, or procedure as the subject when that is more precise.
- Preserve official product and service names from reliable sources or nearby documentation. Do not maintain or invent a separate product-name glossary.
- Replace promotional language with facts, steps, constraints, or evidence.
- Avoid unsupported superlatives and phrases such as “best-in-class”, “cutting-edge”, “market leading”, “one-stop shop”, “unique”, “innovative”, and “value add”.
- Use sentence case for titles and headings. Do not add bold or italics to heading text.
- Bold UI labels exactly as displayed. Put typed values, commands, flags, paths, filenames, API names, and other literals in code. Example: in **Email**, enter `user@example.com`.
- Do not use em dashes or en dashes as sentence breaks.
- Do not wrap prose to a fixed line length.
- Do not create Mermaid, ASCII-art, or other text diagrams. Use lists for flows and tables for genuine matrices.

For detailed rules and examples, read [style-reference.md](style-reference.md) and [examples.md](examples.md).

## Edit without leaving stale content

When editing an existing page:

1. Remove or shorten instructions the new content replaces.
2. Check nearby sections for obsolete names, paths, versions, links, and duplicated explanations.
3. Update directly related pages when they would otherwise contradict the edit.
4. Preserve intentional warnings and statements that a feature is disabled.

## Finish with a documentation check

Before finishing, confirm:

- The first H2 is exactly **Overview**.
- Guided and finite work uses numbered lists.
- Every procedure ends with a success check.
- Commands are copy-pasteable and fenced with a language.
- No secrets, personal data, customer data, or restricted URLs appear.
- Production and security risks are clear and use least privilege.
- Callouts are useful and never stacked.
- Tables are genuine matrices and never stacked.
- Links resolve and important claims have reliable references.
- UI labels are bold and input values are code.
- No facts, product names, behaviour, or URLs were invented.
- Superseded content was removed.
- The writing is technical, plain, factual, and free of promotional filler.
- No Mermaid or other diagrams were added.
