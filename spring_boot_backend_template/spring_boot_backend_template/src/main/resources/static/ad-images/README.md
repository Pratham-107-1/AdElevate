# Ad Images Folder

This folder holds images vendors can pick from when posting an ad, via the
"Select Image" step in the ad-posting wizard.

Files here are served automatically by Spring Boot's static resource
handling at:

    http://localhost:9090/ad-images/<filename>

## Adding real images

Just drop .jpg/.png/.svg files into this folder — no code changes needed.
`GET /api/ad-images` (ImageController) scans this directory at request time
and returns whatever is currently here, so new files show up immediately
after a restart (or immediately, if you're not caching the classpath).

## Current contents

The .svg files currently here are simple placeholder graphics (a colored
background + label), not real photos — generating/fetching real stock
photography wasn't possible in the environment this was built in. Swap
them out for real product/business photos whenever you have them; the
picker UI doesn't care about format as long as it's a common image type.
