## Goal

Create 9 ready-to-use demo login accounts — one for each role — so you can test the portal immediately.

## Demo credentials (proposed)

All accounts share the same password for easy demo: **`Demo@2026`**

| # | Email | Role |
|---|---|---|
| 1 | `superadmin@demo.wavelength.in` | Super Admin |
| 2 | `construction@demo.wavelength.in` | Construction Head |
| 3 | `interior@demo.wavelength.in` | Interior Head |
| 4 | `field@demo.wavelength.in` | Field Manager |
| 5 | `accounts@demo.wavelength.in` | Accounts Manager |
| 6 | `material@demo.wavelength.in` | Material Manager |
| 7 | `hr@demo.wavelength.in` | HR Manager |
| 8 | `site@demo.wavelength.in` | Site Supervisor |
| 9 | `viewer@demo.wavelength.in` | Viewer |

## How it will be built

1. Create one-time backend function `seed-demo-users` that:
   - Uses admin privileges to create the 9 auth users with email pre-confirmed (no email verification needed)
   - Skips any account that already exists (safe to re-run)
   - Assigns the correct role in `user_roles` for each
   - Sets `full_name` on each profile (e.g. "Demo Super Admin")
2. Auto-run the function once on deploy and return a summary.
3. After seeding, you can log in at `/auth` with any of the 9 emails + password above.

## Notes / risks

- These are real backend accounts with real privileges — anyone with the password can sign in. Recommend changing the password or deleting demo accounts before going to production.
- The Super Admin demo can edit/delete data, including pricing rates. Use the Viewer account if you just want to look around safely.
- Existing real users are untouched.

## Open question

Are these emails + password OK, or do you want different ones (e.g. your own email pattern, stronger password)? If yes to defaults, I'll seed them on approval.