# Security review (short)

Answer each in one line in `.factory/security-review.md` inside the product. "N/A" with a reason is valid.

1. Inputs: list every untrusted input (CLI args, files, HTTP, messages, env). Each is validated where?
2. Files: any path from user input? Normalized and confined to an allowed root?
3. Shell: any subprocess? Arguments as arrays, never string-built commands?
4. Network: every outbound call has a timeout and TLS. Inbound has auth or is explicitly public.
5. Secrets: all from env. None logged. None in fixtures.
6. Dependencies: lockfile committed. `audit` step clean or exceptions documented.
7. Permissions: minimal (Discord intents, OAuth scopes, file modes, container user non-root).
8. Data: what personal data is stored, where, and for how long. Deletion path exists.
9. Denial of service: size caps on inputs, bounded queues, rate limits on public routes.
10. Defensive scope: the tool cannot be trivially repurposed to attack, evade, or exfiltrate.
