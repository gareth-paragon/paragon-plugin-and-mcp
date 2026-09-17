# Paragon technical documentation examples

## Overview

These examples show the main decisions in the `paragon-tech-docs` skill. Adapt the facts to the repository and verify commands, UI labels, names, and links before using them.

## Start a page

Prefer:

```markdown
# Configure webhook authentication

## Overview

This guide is for developers who configure webhook authentication for an existing service. It explains how to store the shared secret, update the service configuration, and verify signed requests.
```

Avoid an unlabelled introduction, a marketing claim, or another H2 before **Overview**:

```markdown
# Revolutionary webhook security

Our innovative solution provides best-in-class protection.

## Introduction
```

## Guide a reader

Prefer a numbered sequence with a success check:

```markdown
## Configure the environment variable

1. Open **Settings**, then select **Environment variables**.
2. Add `WEBHOOK_SECRET` and source its value from the approved secret store.
3. Restart the service.
4. Send a signed test request and confirm that the service returns `202 Accepted`.
```

Use bullets only for an unordered set:

```markdown
The service records:

- Request timestamp
- Signature validation result
- Correlation ID
```

## Mark UI labels and typed values

Prefer bold for the control the reader sees, and code for the value they enter:

```markdown
1. Open **Users**, then choose **Invite**.
2. In **Email**, enter `user@example.com`.
3. Select **Role**, then choose **Viewer**.
4. Select **Send invite** and confirm that the page shows `Invitation sent`.
```

Avoid putting the field name in code, or leaving the typed value as plain text:

```markdown
1. Open Users, then choose Invite.
2. In Email, enter user@example.com.
3. Set the `Role` field to Viewer.
```

## Write commands and placeholders

Prefer:

````markdown
Run the command from the repository root:

```powershell
$env:API_TOKEN = "YOUR_API_TOKEN"
npm run verify:webhook
```

The command prints `Signature verification passed` when the configuration is valid.
````

Avoid real credentials, mixed commands and output, or a fence without a language:

````markdown
```
$env:API_TOKEN = "live-secret-value"
npm run verify:webhook
Signature verification passed
```
````

## Use one callout

Prefer one callout for the material risk:

```markdown
> **Warning:** Rotating the signing key invalidates requests signed with the previous key.

1. Create the replacement key in the approved secret store.
2. Deploy the new key to all webhook consumers.
3. Rotate the key on the sender.
4. Send a signed request and confirm that every consumer accepts it.
```

Avoid stacked notices:

```markdown
> **Warning:** Key rotation affects all consumers.

> **Important:** Update every environment.

> **Note:** Test first.
```

Put the second and third points into the procedure instead.

## Use a table

Introduce a genuine comparison:

```markdown
## Configuration fields

Use these fields to configure signature validation.

| Field | Required | Purpose |
| :--- | :--- | :--- |
| `WEBHOOK_SECRET` | Yes | Verifies the request signature |
| `WEBHOOK_TOLERANCE_SECONDS` | No | Limits accepted clock drift |
```

Do not put another table directly after it. Add a heading and explanatory prose, combine closely related columns, or split the reference into another file.

## Link and reference a claim

Prefer descriptive links and a verifiable source:

```markdown
The service accepts signatures generated with HMAC-SHA256. See the [webhook signature specification](../reference/webhook-signatures.md) for the canonical header format.
```

Avoid:

```markdown
Click [here](../reference/webhook-signatures.md) for more information.
```

If the target file or an external vendor URL cannot be verified, ask for the source rather than inventing the link.

## Replace marketing language

Avoid:

> Our cutting-edge platform delivers a seamless, best-in-class integration experience.

Prefer:

> The connector retries failed requests three times at 30-second intervals and records the final response code.

The second version gives readers behaviour they can test.

## Propose a multi-page topic

When one page would mix setup, operation, troubleshooting, and reference, ask before writing:

1. `webhook-overview.md` - Entry point, scope, and links to the other pages.
2. `configure-webhooks.md` - Prerequisites, secret setup, and verification.
3. `operate-webhooks.md` - Rotation, monitoring, and routine checks.
4. `troubleshoot-webhooks.md` - Symptoms and numbered recovery steps.
5. `webhook-reference.md` - Headers, configuration fields, and response codes.

Ask the user to confirm or reduce the set. Do not create the files until they agree.
