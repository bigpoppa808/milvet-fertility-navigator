# Milvet Fertility Navigator

## Overview
The Milvet Fertility Navigator is a dedicated platform providing resources and guidance for military veterans and service members navigating fertility challenges. It offers up-to-date information on benefits, legislation, funding, and clinical options to support family-building journeys.

Deployed on Cloudflare Pages: [Live Site](https://1a24f948.milvet-fertility.pages.dev)

## Research Basis
Grounded in July 2025 research:

- **TRICARE & VA Coverage**: Limited ART coverage; VA expanded IVF for service-connected infertility, including same-sex couples.
- **Legislation**: Executive Order 14216, NDAA 2025 provisions, IVF for Military Families Act pending.
- **Challenges**: Higher infertility rates in military (15-20% vs. 12% civilian), deployment impacts.
- **Funding**: Grants like Bob Woodruff VIVA, Cade Foundation.

Detailed docs in `/docs/`, including `military_fertility_benefits_2025.md` and `research_plan_milvet_fertility_navigator.md`.

## Functionalities
- **Benefits Guide**: Detailed coverage for TRICARE, VA, active duty vs. veterans.
- **Policy Tracker**: Current legislation and policy updates.
- **Funding Resources**: Grants, discounts, financial assistance.
- **Partner Directory**: Support organizations like ASRM, RESOLVE, MFBC.
- **Statistics & Challenges**: Data on military fertility issues.
- **Clinical Info**: ART options, military-friendly clinics.

## How to Use
1. **Local Development**:
   - Install dependencies: `pnpm install`
   - Run dev server: `pnpm run dev`
   - Access at `http://localhost:3000`
2. **Build and Deploy**:
   - Build: `pnpm run build`
   - Deploy to Cloudflare: `npx wrangler pages deploy dist`
3. Navigate sections via the web app for personalized info.

## Marketing Messages
- Empower military families with essential fertility navigation tools.
- Bridge gaps in veteran care for better family outcomes.
- Support our heroes in building the families they deserve.

Contributions welcome via issues or PRs.
