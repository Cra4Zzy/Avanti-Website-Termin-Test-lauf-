# Avanti Haarstudio — Phase 1
Canonical website repository. V10-inspired editorial styling is shared; the latest contact redesign is retained. Images and video unchanged. The regular /termin/ page uses the existing Supabase preview, with client booking explicitly locked. Old local booking removed; old pilot URL redirects. No customer accounts or mail delivery.
## Deployment
GitHub Actions validates source scripts and local links and creates a production artifact. Production booking is telephone/WhatsApp only until the full system is released. GitHub preview stays noindex.
1. Back up the existing ALL-INKL website (including configuration and files).
2. In KAS create a dedicated FTPS account restricted to the **customer website document root**, not the employee subdomain or hosting account root. Confirm FTP / maps to that directory.
3. Add repository Actions secrets AVANTI_FTPS_HOST, AVANTI_FTPS_USER and AVANTI_FTPS_PASSWORD. Never store them in code or chat.
4. Run the workflow manually with publish=true after checking the validation artifact and target. It uploads over TLS without remote deletion and verifies the public HTTPS files.
5. Only after a successful manual deployment, set repository Actions variable AVANTI_AUTO_DEPLOY=true. Subsequent main pushes then deploy automatically after validation.
Old unrelated server files are not removed automatically. No employee-app or database changes.

## Booking preview (phase 3 preparation)
`/termin/` on GitHub Pages is a noindex preview with live read-only availability and a local simulation of contact/confirmation steps. No POST requests, customer data persistence, or email. All-Inkl production build strips the booking JavaScript, preview CSS and preview mobile controls and retains the telephone/WhatsApp page. Real booking remains disabled until separately authorized and tested. Prices, duration, staff and shifts are pending salon approval.
