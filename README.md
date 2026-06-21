# Jellyfin UI Theme

External Jellyfin CSS theme built around Abyss, Intro Skipper styling, a polished home hero/media bar, tighter poster rows, and a cleaner top navigation/search pill.

## Use It In Jellyfin

1. Keep this public repository available on GitHub.
2. In Jellyfin, open `Dashboard > General > Custom CSS`.
3. Paste this:

```css
@import url("https://cdn.jsdelivr.net/gh/tait-whale/jellyfin-ui@main/jellyfin-theme.css?v=2026-06-21");
```

When you edit `jellyfin-theme.css`, bump the `v=` value so phones, TVs, and browsers do not keep an old cached copy.

## What CSS Can And Cannot Do

This theme can style the header, poster cards, dialogs, buttons, home rows, and the Media Bar plugin area. It also makes Jellyfin's search icon look like a search bar in the top row.

CSS cannot create new Jellyfin home rows, reorder libraries, or add real Jellyseerr/Overseerr discovery data by itself. For the home screen you described, configure Jellyfin and plugins so the rows exist first, then this theme will style them.

Recommended layout:

- Top nav: `Home`, `Shows`, `Movies`, `Discover`.
- Home sections: Media Bar plugin first.
- Library rows: installed/owned movie and show rows.
- Discovery rows: popular and discover rows from your Seerr integration/plugin.

## Helpful Plugin Info To Send Me

If you want me to tune this against your exact setup, send:

- Jellyfin version.
- Web client type you mainly use: desktop browser, Android TV, iOS, etc.
- The exact Media Bar plugin name/version.
- Which Seerr integration you are using: Jellyseerr, Overseerr, or another plugin.
- A screenshot of the home page after applying the CSS.
