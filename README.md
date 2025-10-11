# Altus Digital Loan Application Frontend

Modern, mobile‑first React + TypeScript portal for initiating and tracking loan applications that integrate with the Altus Loan Management APIs.

## Key Features (Current Scaffold)
- Extended document capture (NRC front & back, 3 payslips, optional reference letter, work ID, selfie, bank statement)
- Theming with MUI v5 using Altus brand palette
- API layer (`axios` instance + typed service `loanApi`)
- Domain model typings for customer, loan products, requests, status & documents
- Placeholder pages: Landing, Wizard, Tracking, Not Found

4. Secure document upload (NRC front/back, 3 Payslips, optional Ref Letter, Work ID, Selfie, Bank Statement) with progress UI ✅ (client-side simulation)
1. Customer lookup & creation (NRC / Phone based search, create if not found)
2. Zod + react-hook-form validation per step (dynamic by product)
### Current Required Documents
Required:
1. NRC Front
2. NRC Back
3. Payslip 1 (oldest of last three)
4. Payslip 2 (middle)
5. Payslip 3 (most recent)

Optional (captured if available):
- Employee Reference Letter
- Work ID
- Selfie / Applicant Photo
- Recent Bank Statement (PDF)

Client-side verification simulates upload & OCR (NRC match heuristic). Server-side must re‑validate on submission.
6. Tracking page status polling (GetLoanStatus / GetLoanDetails)
7. Central error + loading handling (snackbar + overlay)
8. Auth token acquisition / refresh (replace static bearer)
9. Accessibility & performance polish (Lighthouse baseline)
10. CI/CD GitHub Actions → VPS (Nginx reverse proxy + Let’s Encrypt)

## Tech Stack
| Layer              | Tech |
|--------------------|------|
| UI Framework       | React 18 + TypeScript |
| Component Library  | MUI v5 (custom theme) |
| Forms & Validation | react-hook-form + zod |
| HTTP Client        | axios (interceptors) |
| State (wizard)     | Lightweight React context |
| Build Tooling      | Create React App (react-scripts) |

## Project Structure (Condensed)
```
src
├─ api/                 # http.ts (axios instance), loanApi.ts service
├─ components/
│  ├─ layout/           # AppLayout shell
│  └─ wizard/           # Wizard context + multi-step engine
├─ pages/               # Landing, Wizard, Tracking, NotFound
├─ theme/               # MUI theme config
├─ types/               # Domain interfaces
└─ index.tsx            # App bootstrap
```

## Environment Variables
Copy `.env.sample` → `.env.local` and fill values:
```
REACT_APP_API_BASE_URL=https://uat-altus-api.example.com
REACT_APP_API_TOKEN=<<temporary-static-token>>
REACT_APP_API_CLIENT_ID=<<optional_if_oauth>>
REACT_APP_API_CLIENT_SECRET=<<optional_if_oauth>>
```

## Scripts
```
npm start       # Dev server
npm run build   # Production build (outputs /build)
npm test        # (Placeholder – add tests later)
```

## Development Flow
1. Select product on landing page
2. Step wizard mounts with product context
3. Fetch / create customer (persist ID)
4. Run calculator (store EMI result)
5. Upload documents (store document IDs)
6. Review aggregate payload and submit
7. Redirect to confirmation with reference ID
8. User can track via reference / NRC

## API Layer Overview
`http.ts` – central axios instance with bearer token injection.
`loanApi.ts` – typed functions (createCustomer, submitLoanRequest, calculateEMI, etc.). Adjust endpoint paths to real spec.

## Deployment (Hostinger VPS Outline)
1. Build locally or in CI: `npm run build`
2. Copy `/build` to server directory: `/var/www/altus-loans/frontend`
3. Nginx server block example (simplified):
   ```
   server {
     server_name loans.example.com;
     root /var/www/altus-loans/frontend;
     index index.html;
     location / { try_files $uri /index.html; }
     # Optionally proxy /api to backend
     location /api/ { proxy_pass https://api.internal/; }
   }
   ```
4. Obtain TLS: `certbot --nginx -d loans.example.com`
5. (Future) Automate with GitHub Actions artifact deploy via SSH / rsync.

## CI/CD (Planned)
- GitHub Actions job: install → build → upload artifact → deploy to VPS
- Cache node_modules for faster builds
- Lint / typecheck gate before deployment

## Testing Strategy (Planned)
- Unit: wizard navigation, form validation schemas
- Integration: API mocks for submission flow
- E2E: Cypress basic journey (select product → submit dummy flow)

## Contributing
1. Branch naming: `feature/<name>` or `fix/<name>`
2. PR must pass build & (future) test checks
3. Keep components small and typed

## License
MIT (adjust if required by organization policy)

---
Questions / clarifications: document in a `docs/decisions.md` (create later) to track architectural decisions.

## Extended TODO Roadmap

### Environment & Config
- [ ] Runtime guard for required env vars
- [x] Introduce mock mode flag `REACT_APP_MOCK_MODE`
- [ ] Document CSP recommendations

### UI / UX Enhancements
- [x] Progress ring & diff snapshot on Review
- [x] Reset baseline for diff
- [x] Status legend + query param prefill on Tracking page
- [x] Currency formatting utility
- [x] Amortization schedule + CSV export
- [x] Recent lookups tracker list (search + filters)
- [ ] PDF export of application summary
- [x] Interest sensitivity slider (rate adjustment preview)

### Accessibility
- [x] Skip to content link
- [x] Aria labels on icon-only buttons
- [ ] Keyboard navigation for timeline
- [ ] Live region announcements for readiness

### Performance
- [x] Lazy load wizard steps
- [ ] Bundle analysis & performance budget
- [ ] OCR result cache by hash

### Documents & Verification
- [ ] OCR confidence display
- [ ] Duplicate file hash alert surfacing
- [ ] Parallel OCR queue

### Tracking / Status
- [x] Query param prefill (ref)
- [x] Retry w/ exponential backoff
- [x] Persistent tracked applications list
- [ ] Status change highlight animation

### Security
- [x] Basic text sanitization for export/print
- [ ] File signature (magic number) validation
- [ ] Draft integrity checksum

### Observability
- [x] Event logging buffer
- [ ] Remote log dispatch stub
- [ ] Performance marks around doc verification

### Testing
- [ ] Unit tests (loan calc, doc validation, draft storage)
- [ ] Component tests (wizard navigation, diff reset)
- [ ] Integration test full happy path
