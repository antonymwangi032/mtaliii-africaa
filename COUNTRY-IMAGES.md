# Mtaliii.com — 15 capital-city cards

The country cards now read country names from the registry and use a local file path for each image. They show a styled capital-city placeholder when the file is absent; this is **not a city photograph**.

Add licensed, genuine city photographs as WebP in `public/images/countries/` using the filenames listed in that folder's README.txt. Once added, refresh the browser. No source code change is required.

The original website, admin functionality, country content, Big Five, stays and hero carousel are retained. Hero and Big Five may still request their existing cached remote images until those assets are separately added locally.

Run in CMD: `npm install` then `npm run dev`, visit `http://localhost:3000`.

The folder name Mtaliii.com is a local project name, **not** a registered domain.
