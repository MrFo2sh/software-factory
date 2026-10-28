---
title: CTF Watch
slug: ctf-watch
type: api-service
one_liner: Live SOC dashboard for web CTFs: a logging reverse proxy that shows who is doing what, per student, as it happens.
priority: 1
status: shipped
product: products/ctf-watch
push: false
shipped: 2026-10-28
version: 1.0.0
---

## Idea
Adopted on 2026-10-28: an existing project at `D:\SIEMs\ctf-watch` (own git repo, remote
github.com/MrFo2sh/ctf-monitor) brought under the factory. The project stays where it is; the
factory reaches it through a directory junction at `products/ctf-watch`.

## Must have
- Factory gates (lint, typecheck, test, build, audit) green on the existing code.
- SPEC, BACKLOG, CHANGELOG, SECURITY, CI and AGENTS files so any session can continue the work.

## Nice to have
- The items in the project's BACKLOG.md.

## Constraints
- Do not reformat or restructure the existing tree in the adoption release.
