# Grisha’s Buick

A small static site with an anime-eyed Buick, an escaping NO button, and a YES celebration popup.

Run locally (Python 3, no package installation needed):

```sh
cd /workspace/grisha-buick
python -m http.server 8000 --bind 0.0.0.0
```

`index.html` is self-contained: the image, styles, and JavaScript are embedded. Open it directly in a browser or upload that single file to a static host. No external requests are required. Separate asset, CSS, and JavaScript files are retained as editable references; changes to those references must also be embedded into the HTML.
