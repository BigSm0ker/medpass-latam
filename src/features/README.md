# Feature boundaries

Future feature modules are `auth`, `medical-passport`, `consent`, `encounters`, `payments`, and
`audit`. Each feature should own UI-independent domain logic and call integration adapters rather
than importing infrastructure throughout components.
