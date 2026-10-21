# ROLE AND MISSION

Act as an autonomous Principal Software Engineer, Senior Full-Stack Developer, Senior DevOps Engineer, Database Architect, Security Engineer, and Senior UI/UX Designer.

Your mission is to ANALYZE, DESIGN, IMPLEMENT, TEST, and DOCUMENT a complete, professional, production-oriented website that showcases electric scooter spare parts for the Moroccan market.

Project concept: a Moroccan electric scooter spare-parts vitrine (showcase catalog), with two separate experiences:
1. Public customer storefront.
2. Secure administrator dashboard.

The primary language of all customer-facing content is Moroccan Darija written in Arabic script, with familiar French technical product names where appropriate. Use natural, locally understandable Moroccan Darija, not literal translations or Modern Standard Arabic throughout.

The website must feel like a real Moroccan business, be mobile-first, visually polished, fast, accessible, and easy to maintain.

IMPORTANT: Do not stop after generating a plan or mockup. Inspect the existing workspace, implement the actual application, run available checks, fix errors, and document the result. If the environment cannot perform an action, explain the limitation honestly and provide the next steps.

# 1. START BY INSPECTING THE PROJECT

Before modifying files:
- Inspect the repository, framework, package manager, dependencies, existing routes, assets, environment configuration, and current implementation.
- Identify whether the workspace is empty or contains an existing project.
- Preserve existing working features and conventions.
- Create a concise implementation plan and then proceed with implementation without waiting for approval for routine, reversible decisions.
- Ask questions only when a decision is genuinely blocking.
- Never overwrite unrelated user work.

# 2. PRODUCT AND BUSINESS REQUIREMENTS

Build a product showcase for electric scooter replacement parts, with an emphasis on helping customers find the correct part and contact the seller.

This is primarily a CATALOG AND INQUIRY WEBSITE, not a payment-processing ecommerce store.

Required categories:
1. Pneu / Pneus — tyres, inner tubes, tubeless tyres.
2. Chargeur — chargers, power adapters, charging accessories.
3. Plaquettes de frein — brake pads.
4. Câble de frein — brake cables and related parts.
5. Accélérateur électrique — throttles and accelerator assemblies.
6. Contrôleur — motor controllers and electronic control units.
7. Moteur — hub motors and replacement motor assemblies.
8. Jante — rims and compatible wheel assemblies.

Also support:
- Chambres à air.
- Disques de frein.
- Leviers de frein.
- Garde-boue.
- Batteries and compatible battery accessories, with appropriate safety warnings.
- Connectors, cables, lights, displays, and other scooter accessories.

Administrators must be able to create additional categories without code changes.

# 3. CUSTOMER INTERFACE

Create a beautiful, responsive storefront.

A. Header and navigation:
- Business logo and name.
- Navigation links.
- Product search.
- Category navigation.
- Contact and WhatsApp buttons.
- Mobile-friendly menu.
- Optional location or delivery information when configured by the administrator.

B. Homepage:
- Attractive hero section with a clear Darija headline.
- Primary CTA: "Qelleb 3la pièce" or a natural Darija equivalent.
- Secondary CTA for WhatsApp inquiries.
- Featured categories with recognizable product imagery.
- New arrivals and featured products.
- Popular spare parts.
- A simple explanation of how ordering works.
- Trust section: real business benefits configured by the administrator.
- Contact information and footer.

Suggested Darija copy:
Headline: "Kolchi li kat7taj l trottinette dyalek, f blassa wa7da."
Supporting text: "Qelleb 3la pièces de rechange, chof les détails, w tsawel 3la disponibilité b WhatsApp."
Search placeholder: "Qelleb 3la pièce li kat9elleb 3liha..."
Contact CTA: "Tsawel 3la WhatsApp"
Availability CTA: "Wach disponible ?"
Empty results: "Ma l9ina 7ta pièce b had smiya. Jarrab t9elleb b smiya okhra."
Use these as initial examples and improve their naturalness and Arabic-script presentation.

C. Product catalog:
- Grid of attractive product cards.
- Search by product name, SKU, model, and compatible scooter.
- Filter by category, brand, price when available, and availability.
- Sort by newest, name, and price where prices are enabled.
- Pagination or accessible incremental loading.
- Loading skeletons, empty states, and error states.
- Responsive desktop, tablet, and mobile layouts.

D. Product details:
- Product name in Darija/French technical terminology.
- Product images and gallery.
- Description and technical specifications.
- Reference/SKU.
- Price or "Tsawel 3la taman" when the price is not configured.
- Availability state: available, out of stock, or ask the seller.
- Compatible scooter brands/models, if verified.
- Wheel dimensions, voltage, connector type, wattage, and other relevant specifications when applicable.
- WhatsApp inquiry CTA containing the selected product name and reference.
- Related products and breadcrumbs.

Never invent compatibility, specifications, stock status, warranty claims, or business promises. Mark unknown information as unspecified and allow administrators to edit it.

E. Contact and inquiry:
- WhatsApp contact using a configurable business phone number.
- Contact form with name, phone, message, and selected product when applicable.
- Validate user input.
- Provide a configurable phone number and location.
- If the contact number is not configured, show an administrator setup notice in the dashboard and a graceful unavailable state on the storefront.
- Encode WhatsApp message content safely.
- Never invent a real business phone number.
- Include anti-spam measures on submitted forms.

# 4. MOROCCAN DARIJA AND RTL

Language is a core product requirement, not a later enhancement.

- Default customer language: Moroccan Darija.
- Use Arabic script for the main interface.
- Retain French technical terms naturally where commonly used.
- Support RTL layouts throughout the customer-facing experience.
- Use logical CSS properties such as margin-inline-start instead of hardcoded left/right spacing.
- Ensure navigation, icons, forms, breadcrumbs, product cards, dialogs, tables, and responsive layouts behave correctly in RTL.
- Set appropriate document language and direction attributes.
- Choose a readable Arabic font, such as Noto Sans Arabic or another suitable licensed font.
- Ensure Arabic text does not become visually disconnected or reversed incorrectly.
- Keep product SKUs, serial numbers, phone numbers, and Latin technical terms legible.
- Do not translate product codes or technical specifications incorrectly.
- Keep admin interface language consistent, preferably Darija with familiar French technical labels, and allow it to remain usable for a technically oriented administrator.

Optionally add a Latin-script Darija or French language switcher if it can be implemented cleanly. Arabic-script Darija remains the default.

# 5. ADMINISTRATOR INTERFACE

Implement a separate protected admin area, for example /admin.

The admin area must not be publicly accessible without authentication.

A. Admin login:
- Secure email/password login or the appropriate authentication method for the chosen stack.
- Secure session handling.
- Server-side authorization on every protected operation.
- Logout functionality.
- Login rate limiting and safe error messages.
- No public admin registration.
- Create the initial admin through a documented secure setup process or an existing trusted identity provider.

B. Dashboard overview:
- Total products.
- Active and inactive products.
- Category counts.
- Available and out-of-stock products.
- Recent customer inquiries.
- Recent changes where useful.

C. Product management:
- Create, edit, view, publish, unpublish, and archive products.
- Manage multiple product images.
- Set product name, slug, description, SKU, category, price, optional sale price, and availability.
- Toggle price visibility and use inquiry-only pricing.
- Manage brands, compatible models, specifications, featured status, and SEO metadata.
- Validate all input on the server.
- Prevent duplicate SKUs and invalid prices.
- Confirm destructive actions.
- Provide clear success and error feedback.
- Support pagination and search.

D. Category management:
- Create, edit, reorder, activate, and archive categories.
- Configure names in Darija/French, slugs, descriptions, and images.
- Prevent deleting categories that contain products unless products are reassigned safely.

E. Inquiry management:
- List incoming customer inquiries.
- View inquiry details and the referenced product.
- Mark inquiries as new, contacted, resolved, or spam.
- Search and filter by status.
- Record timestamps.
- Restrict access to customer contact information.
- Provide data-retention controls appropriate for the business.

F. Store settings:
- Business name and logo.
- WhatsApp phone number.
- Contact email and telephone.
- Business location and map link.
- Opening hours.
- Delivery information.
- Currency: MAD (Moroccan dirham).
- Product price visibility.
- Homepage featured content.
- Social media links.
- SEO defaults.

G. Admin quality:
- Responsive sidebar and mobile navigation.
- Accessible forms and tables.
- Clear confirmation dialogs.
- Empty, loading, and error states.
- Form validation and unsaved-change warnings.
- Server-side permission enforcement.
- Audit logging for sensitive administrative actions where appropriate.

# 6. DESIGN DIRECTION

Build a premium, modern, automotive/e-mobility-inspired storefront.

Visual direction:
- Clean white or warm neutral backgrounds.
- Charcoal typography.
- A confident electric green or orange accent, used consistently.
- High-quality, relevant scooter spare-parts photography.
- Strong visual hierarchy and readable Arabic typography.
- Clean product cards with consistent image ratios.
- Clear availability and inquiry states.
- Subtle shadows, borders, and purposeful motion.
- Consistent spacing and component sizing.
- Strong mobile usability and touch-friendly controls.

Do not make the design look like a generic template or an unrelated corporate dashboard.

Use actual relevant assets where available. Do not invent product photographs and represent them as actual stock images. If real images are unavailable, use clearly replaceable placeholders and document how the administrator can add images.

Create a shared design system:
- Colors and design tokens.
- Typography scale.
- Spacing scale.
- Buttons and inputs.
- Cards, badges, tables, dialogs, toasts, and navigation.
- RTL-aware components.
- Responsive breakpoints.

Meet WCAG 2.2 AA accessibility goals where practical, including keyboard accessibility, contrast, visible focus, semantic HTML, and accessible labels.

# 7. TECHNICAL ARCHITECTURE

First inspect the existing stack and reuse it if it is appropriate.

For a new project, use a practical, maintainable stack such as:
- Frontend and server: Next.js with TypeScript.
- Styling: Tailwind CSS.
- Accessible UI components: a suitable maintained component library.
- Database: PostgreSQL.
- ORM: Prisma or another suitable maintained ORM.
- Authentication: a secure, maintained solution.
- Validation: Zod or equivalent.
- Image storage: an appropriate object storage provider or managed image service.
- Testing: Vitest or equivalent, plus Playwright for end-to-end tests.
- Package manager: use the repository's existing manager; otherwise select one and document it.

Do not install unnecessary dependencies or use outdated APIs.

Build clear boundaries between UI, business logic, database access, authentication, and infrastructure.

Create a database schema for:
- Admin users or authenticated identities.
- Products.
- Categories.
- Product images.
- Product specifications.
- Compatible scooter models.
- Customer inquiries.
- Store settings.
- Audit events where appropriate.

Define relationships, indexes, constraints, timestamps, and migrations.

Store money as an appropriate exact decimal or integer representation, never floating-point values for financial calculations.

Store configuration in environment variables. Provide a safe .env.example containing placeholders only.

Never expose database credentials, authentication secrets, or privileged API keys in client-side bundles.

# 8. DATA AND CATALOG MANAGEMENT

- Create realistic demonstration products only when explicitly marked as sample data.
- Never imply sample stock, prices, or compatibility are verified.
- Provide a repeatable seed process.
- Make it easy for the administrator to replace sample data.
- Provide appropriate image upload validation, file-size limits, and content-type checks.
- Use safe storage paths and restrict upload permissions.
- Prevent executable file uploads.
- Avoid loading arbitrary external image URLs without appropriate controls.
- Use database constraints and server-side validation rather than relying on frontend forms alone.

# 9. SEO AND DISCOVERABILITY

- Add meaningful page titles and descriptions.
- Generate clean, stable product and category URLs.
- Implement canonical URLs where appropriate.
- Provide sitemap.xml and robots.txt.
- Use Open Graph metadata.
- Add suitable structured data only for information that is real and verified.
- Optimize images and page loading.
- Support Arabic metadata and RTL content.
- Make public catalog pages indexable while keeping admin and private pages out of search results.
- Avoid exposing customer information in URLs or metadata.

# 10. SECURITY REQUIREMENTS

Implement:
- Server-side authorization checks.
- Secure authentication and session cookies.
- CSRF protections where applicable.
- Rate limiting for authentication and public forms.
- Input validation and output encoding.
- Protection against SQL injection, XSS, SSRF, and broken access control where relevant.
- Secure file uploads.
- Restrictive CORS configuration where applicable.
- Security headers and HTTPS in production.
- Dependency and container image checks where appropriate.
- Safe logging without passwords, tokens, or unnecessary personal information.
- Appropriate data retention and deletion procedures.

Do not expose admin APIs or privileged database operations to the browser.

Do not use hardcoded credentials, fake authentication, public admin registration, or client-side-only route protection.

# 11. DEVOPS AND DEPLOYMENT

Provide a practical deployment setup suitable for a small Moroccan business.

- Dockerfile with production-appropriate multi-stage builds when Docker is used.
- Docker Compose for local development or self-hosting when appropriate.
- PostgreSQL configuration with persistent storage and restricted network exposure.
- Health checks and graceful shutdown where supported.
- Database migrations as an explicit deployment step.
- CI pipeline for linting, type checking, tests, and build validation.
- Environment-specific configuration for development, staging, and production.
- TLS and reverse proxy guidance when self-hosting.
- Database backup and restoration instructions.
- Image storage backup considerations.
- Logging, basic monitoring, and deployment troubleshooting.
- A documented rollback process.
- Secure handling of production secrets.

Do not assume access to a cloud account or server. Produce working deployment files and clear instructions for the selected target.

Do not deploy to external infrastructure, incur costs, or destroy production data without explicit authorization.

# 12. TESTING AND ACCEPTANCE CRITERIA

Implement and verify the following where the available environment permits.

CUSTOMER:
- Homepage renders correctly in Arabic RTL.
- Search returns relevant products.
- Category filters work.
- Product detail pages display valid information.
- Missing prices are handled correctly.
- WhatsApp links contain the correct product reference.
- Contact forms validate and persist inquiries.
- Mobile navigation works.
- Loading, empty, and error states are functional.

ADMIN:
- Unauthenticated users cannot access protected admin operations.
- Admin can create, edit, publish, and archive products.
- Admin can manage categories.
- Product validation and duplicate SKU protection work.
- Admin can view and update inquiry statuses.
- Store settings persist and affect the storefront.
- Unauthorized requests are rejected server-side.

ENGINEERING:
- Linting and type checks pass.
- Unit and integration tests pass where configured.
- Production build succeeds.
- Database migrations can be applied.
- No secrets are committed.
- Responsive layouts and RTL behavior are checked.
- Critical security and deployment assumptions are documented.

Do not report a test as passing unless it was actually run and passed.

# 13. EXECUTION RULES

Work autonomously on routine implementation decisions.

Proceed in this order:
1. Inspect the workspace.
2. Report a concise plan.
3. Implement the application structure and design system.
4. Build the public storefront.
5. Build database models and server-side business logic.
6. Implement authentication and the protected admin dashboard.
7. Add product, category, settings, and inquiry management.
8. Implement RTL, Darija content, and responsive behavior.
9. Add sample data, testing, SEO, and accessibility improvements.
10. Add deployment configuration and documentation.
11. Run available validation commands.
12. Fix errors and provide a final implementation report.

Do not stop after describing the architecture. Create and modify the actual files using available tools.

If credentials, external services, or configuration are missing, implement the appropriate integration boundary and document the exact setup required. Do not fabricate credentials or pretend external integrations are operational.

If time or tool constraints prevent completion, prioritize a working, secure end-to-end MVP and clearly identify remaining work.

# 14. REQUIRED DELIVERABLES

Deliver:
- Complete source code in the current workspace.
- Public customer storefront.
- Protected admin interface.
- Responsive, RTL-compatible Darija UI.
- Product and category management.
- Product search and filtering.
- Customer inquiry workflow.
- Database schema and migrations.
- Safe sample-data seed script.
- Environment variable template.
- Tests for critical workflows.
- README with setup and usage instructions.
- Deployment configuration and deployment guide.
- Backup and recovery instructions.
- Final report listing files changed, tests actually run, limitations, and remaining tasks.

FINAL OBJECTIVE:

Deliver a polished, reliable, secure, easy-to-operate Moroccan electric scooter spare-parts showcase that helps customers find the correct parts and contact the seller, while allowing the owner to manage the entire catalog through a separate protected administration interface.

Begin by inspecting the current workspace, then implement the project. Do not merely return a tutorial or a design proposal.