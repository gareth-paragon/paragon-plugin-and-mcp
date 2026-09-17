# Paragon technical documentation style reference

## Overview

This reference adapts the documentation-relevant parts of `Paragon_Markdown_Style_Rules.md` into direct instructions for an agent. The section references point to the canonical guide for reviewers; the instructions here are sufficient for using the skill.

## Structure

Follow these rules from canonical §§2 and 5:

1. Use exactly one H1, in sentence case, as the document title.
2. Make `## Overview` the first H2.
3. Use ATX headings (`#`, `##`, `###`) with one space after the marker.
4. Keep heading names unique and descriptive.
5. Do not add bold or italic markup to headings.
6. Do not skip heading levels.
7. Do not add a manual contents list or decorative horizontal rules.
8. Use numbered section prefixes only when the existing document already uses them. Put a full stop after the number, for example `## 2. Configure access`.
9. Add **See also** only when there are useful related pages.

## Lists and procedures

This skill strengthens canonical §6 for developer documentation:

- Use numbered lists for procedures and for any finite path a reader follows, checks, chooses, or completes.
- Use `1.` lazy numbering for long or frequently edited sequences. Explicit numbering is acceptable for short, stable sequences.
- Keep one continuous ordered list for a procedure.
- Label optional steps with `Optional:`.
- Put the expected result in the final step.
- Use bullets only when order and completion do not matter.
- Use consistent four-space indentation for nested items and fenced blocks inside list items.

## Code and technical literals

Follow canonical §7:

- Use inline code for commands, flags, API names, paths, filenames, environment variables, configuration keys, and values the reader types.
- Bold on-screen UI labels. Do not put those labels in code. Example: in **Email**, enter `user@example.com`.
- Use fenced blocks for multiline commands, code, configuration, and output.
- Add an accurate language to every fence, such as `json`, `yaml`, `bash`, `powershell`, or `text`.
- Separate commands from output and label both when confusion is possible.
- State platform assumptions that change syntax or behaviour.
- Never put a real secret in prose, code, configuration, screenshots, or output.

## Links and evidence

Follow canonical §§8 and 13.23:

- Write descriptive link text.
- Prefer verified relative links for repository documentation.
- Verify external links against the official vendor or standards source.
- Use reference-style links for long or repeated URLs.
- Cite versions, service levels, mandatory controls, security claims, and other facts a reader may need to verify.
- Do not fabricate a source or preserve an unsupported claim as fact.
- Use **See also** for related reading, not for links already needed in the body.

## Images

Follow canonical §9:

- Add an image only when it conveys the UI or result more clearly than text.
- Write meaningful alt text that identifies the useful content.
- Use a repository-relative path that matches nearby pages.
- Inspect screenshots for credentials, personal data, customer data, and restricted URLs.
- Do not use screenshots as a substitute for accessible instructions.

## Tables

Follow canonical §10 with these stronger shared-skill defaults:

- Use tables for comparable row-and-column data only.
- Introduce every table with a sentence.
- Never stack tables.
- Prefer one table per section.
- Keep cells concise and the source readable.
- Use a list when readers do not need to compare columns.

## Markdown, HTML, and diagrams

Follow canonical §11:

- Prefer portable Markdown to raw HTML.
- Match a local host pattern only when the repository already requires it.
- Do not create Mermaid, ASCII-art, or other text diagrams.
- Represent sequences as numbered lists and genuine comparisons as tables.

## Callouts

Use callouts only when ordinary structure is not enough:

- Use one portable blockquote with a bold run-in.
- Never stack callouts.
- Use **Warning** for irreversible, production, data-loss, and security risks.
- Use **Important** for a constraint that makes the procedure fail if skipped.
- Use **Note** for a short aside.
- Avoid **Tip** when an `Optional:` numbered step is clearer.
- Do not use host-specific syntax unless neighbouring pages already require it.

## Voice and confidence

Follow canonical §12:

- Prefer active voice.
- State known information plainly.
- Say what is uncertain, missing, or unverified.
- Use natural contractions.
- Use `we` and `our` only when the organisational voice is clear.
- Prefer the product, system, team, or procedure as the subject when it is more precise.
- Replace promotion with verifiable facts, steps, limits, and outcomes.
- Use short, familiar words without making technical wording inaccurate.
- Refer to people naturally and inclusively.

Prefer:

- `start` to `commence`
- `before` to `prior to`
- `about` to `regarding`
- `make sure` to `ensure` when it reads naturally
- `extra` to `additional` when the meaning is unchanged

## Editorial conventions

Apply the relevant parts of canonical §13:

- Preserve official capitalisation of company, product, service, tool, and binary names.
- Use sentence case for headings.
- Spell out an unfamiliar acronym on first use, followed by the acronym in brackets.
- Use `and`, not `&`, except in an official name.
- Bold UI controls exactly as displayed. Do not use bold for generic emphasis or hype.
- Use italics sparingly for a term used as a term.
- Use UK English.
- Use full stops consistently in lists: sentence items take them; fragments do not.
- Use inclusive terms such as `chair` and `spokesperson`.
- Prefer `international` to vague uses of `global`.
- Use hyphens for compound adjectives where needed.
- Do not use an em dash. Do not substitute an en dash as a sentence break.
- Write `OK`, not `okay`; write `online` as one word.
- Spell out one to nine in prose and use numerals from 10 unless a technical convention requires otherwise.
- Use the `%` symbol and currency symbols such as `£`.
- Use double quotation marks for quotations.
- Use exclamation marks rarely and never stack them.

## Security and privacy


## Paragon deltas

Apply these repository-specific requirements with the style above:

- Read the target and a neighbouring section, consult relevant companion docs, match the host structure and tone, make surgical edits, and remove stale or duplicate content.
- - Numbered chapter H2s use `N.M.` and a full stop except landing pages and descriptive runbooks. Keep anchors in sync. Never enforce fixed line lengths.
  - - Never use em or en dashes as sentence breaks. Never stack NOTE, IMPORTANT, WARNING, TIP, or equivalent callouts.
    - - Do not narrate Paragon as a third-person actor. Prefer passive or second-person voice. Proper names and scope labels are allowed.
      - - Bold UI labels. Put typed values, paths, IDs, options, and commands in code. Use `<strong>` in ADO HTML.
        - - Use Paragon Knowledge MCP before guessing Paragon Cursor, Technical Architecture, or Abbey View facts. Cite corpus paths and report unavailable titles or OCR gaps.
          - - Changelog rows belong only in the owning product overview. Operational morning-check changes also update GitLab `cursor-test` Docs-as-Code §2, separate from verification.
            - - Update existing `.devtool/features/` cards with UTC status, modified time, checks, and YAML; ask before new cards; do not mark OCR done before final OCR. Never run `git commit` or `git push` without explicit approval.
              - 
Apply these technical-documentation defaults:

1. Use obviously fake people, customers, domains, identifiers, and credentials.
2. Refer to environment variables or approved secret storage.
3. Prefer least-privilege access.
4. Identify production-sensitive, destructive, or security-reducing actions.
5. Do not recommend insecure shortcuts as normal practice.
6. Redact sensitive screenshot and log content.
7. Avoid exposing internal topology or URLs unless readers need them and the repository is an approved location.

## Maintenance

When editing, remove or shorten superseded content. Do not append a new instruction beside an obsolete one. Check nearby sections and directly related pages for conflicting facts, dead links, old names, and duplicate explanations.
