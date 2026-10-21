# Image loading changes

- Accommodation cards no longer perform Wikimedia API searches at page load. They show a clean text placeholder until an exact, licensed image is added in `public/stay-photo-catalog.js`.
- Homepage and Big Five images use `/cached-photo/<id>`: on first request, the Express server downloads the existing Unsplash photograph, saves it in `public/assets/cached/`, and serves it locally on later visits.
- Internet is needed for the first successful download. If a remote photo is unavailable, a local SVG placeholder is displayed. The original remote image IDs were preserved, but some may be visually incorrect; review each image before publication.
- The cache folder is included but initially empty; the build environment could not reach Unsplash. For fully offline use, populate it on a connected machine by browsing all hero slides and Big Five once, then preserve the cached files.
- The other attraction cards in `app.js` still use Wikimedia searches. Their catalogue requires a separate verification pass; this update deliberately focuses on homepage, Big Five and accommodation photos.
- Image credits and usage permissions must be checked before publishing cached photos.
