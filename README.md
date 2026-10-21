# Mtaliii — Image and browsing repair build

## Start
Extract the ZIP. In the folder containing package.json run `npm install` and `npm start`. Open http://localhost:3000.

## Fixed
- Bundled offline-safe illustrations on country cards, hotels and destination cards; blank gradient rectangles are eliminated even when image services are blocked.
- Hero rotates through eight Big Five and African landscape scenes; attempts photographic images from Unsplash and uses a local fallback if unavailable.
- Country explorer and Kenya catalogue remain searchable. Agency approvals and enquiries remain on /admin.

## Critical limitation
This is **not** the requested 2,000+ individually verified destinations. The original curated entries remain and additional named points are requested from OpenStreetMap via the `/api/discover` endpoint. Those remote requests may fail and the results are not automatically validated. Do not advertise 2,000+ until a real, deduplicated, verified database has been imported and tested. Local SVG fallbacks are illustrations, not photographs of the named site. Unsplash images may also fail to load; verify all photos and licensing before production.

## Admin security
Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of 16+ characters in a local .env file. Do not publish that file or reuse passwords posted in chat.
