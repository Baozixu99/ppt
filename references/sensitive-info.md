# Sensitive Information Handling (PII / HR / Financial)

Apply **before Step 5** when input contains PII, HR, or sensitive financial data. Runs **parallel** to Conflict Resolution.

## Detect

Real names in HR / legal / medical contexts (not cited authors); personal financial details (salary, severance, bonuses); government IDs; medical records; home addresses; confidential business data (unannounced layoffs, M&A, unfiled financials).

## Protocol (in priority order)

1. **Push back** — state what was detected, ask about distribution scope and whether anonymization ("Employee A", "Executive 1") is appropriate.
2. **Suggest anonymization** — propose redacted version (roles not names, rounded figures, quarters not dates). Present both.
3. **Add disclaimer** — if user insists on verbatim PII, add visible footer on affected slides: `"Confidential — Internal Use Only"`.

## Hard Rules

- **Never** reproduce PII verbatim without explicit anonymization confirmation
- **Never** assume "board meeting" = safe — verify distribution scope each time
- Conflict with theme contract or per-slide requests → PII Protocol wins

## Examples

| Input | Detected | Recommended Action |
|-------|----------|--------------------|
| Real names + salaries in HR review | Personal financial data | Anonymize to "Employee A: $X (range)" |
| "John Smith, layoff list, severance $50k" | Personal + confidential M&A-adjacent | Push back, ask scope, suggest anonymization |
| Cited author in academic deck | Public figure + academic context | Keep verbatim (not PII for this Skill) |
| Quarterly revenue figures | Public business data | Keep verbatim (not confidential) |
| Hospital patient names in case study | Medical PII | Anonymize to "Patient 001", add disclaimer footer |