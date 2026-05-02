# Prompt: Invoice

## When to Use
Generating an invoice document for a completed project or billing period.

## Inputs
- `{{INVOICE_NUMBER}}` — e.g., `INV-2026-042`
- `{{CLIENT_NAME}}` — client name
- `{{CLIENT_ADDRESS}}` — billing address
- `{{INVOICE_DATE}}` — date of issue
- `{{DUE_DATE}}` — payment due date
- `{{LINE_ITEMS}}` — list of: description, quantity/hours, rate, subtotal
- `{{PAYMENT_TERMS}}` — e.g., "Net 30", "Due on receipt"
- `{{PAYMENT_METHODS}}` — accepted payment methods
- `{{NOTES}}` — optional: project reference, PO number, or thank-you note

## Prompt
```
Generate an invoice in clean markdown format.

Invoice #: {{INVOICE_NUMBER}}
Date: {{INVOICE_DATE}}
Due: {{DUE_DATE}}
Payment terms: {{PAYMENT_TERMS}}

Bill to:
{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}

Line items:
{{LINE_ITEMS}}

Accepted payment: {{PAYMENT_METHODS}}
{{#if NOTES}}Notes: {{NOTES}}{{/if}}

Format:
---
# Invoice {{INVOICE_NUMBER}}

**Date:** {{INVOICE_DATE}}
**Due:** {{DUE_DATE}}

**Bill To:**
{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}

| Description | Qty/Hrs | Rate | Amount |
|-------------|---------|------|--------|
[line items]

**Subtotal:** $X
**Tax (if applicable):** $X
**Total Due:** $X

**Payment Terms:** {{PAYMENT_TERMS}}
**Accepted Payment Methods:** {{PAYMENT_METHODS}}

{{NOTES}}
---

Calculate the totals. Double-check the math before outputting.
```

## Tips
- Save finalized invoices to `ops/invoices/{{INVOICE_NUMBER}}.md`
- Keep a running total in `ops/invoices/README.md` as an index
