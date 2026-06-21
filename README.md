# Jellyfin UI Theme

External Jellyfin CSS theme with Abyss, Jellyfin Enhanced, and Intro Skipper styling vendored into one file, plus a polished home hero/media bar, tighter poster rows, and a cleaner top navigation/search pill.

## Use It In Jellyfin

1. Keep this public repository available on GitHub.
2. In Jellyfin, open `Dashboard > General > Custom CSS`.
3. Paste this:

```css
@import url("https://tait-whale.github.io/jellyfin-ui/jellyfin-theme.css");
```

This replaces the previous jsDelivr `@main` URL, which can serve stale branch files. GitHub Pages serves the pushed stylesheet from this repository with `text/css`.

The theme file is intentionally bundled. Jellyfin only imports `jellyfin-theme.css`; Abyss and Intro Skipper CSS are copied into that file so they cannot drift or load in a conflicting order.

## What CSS Can And Cannot Do

This theme can style the header, poster cards, dialogs, buttons, home rows, and the Media Bar plugin area. It also makes Jellyfin's search icon look like a search bar and moves it beside the centered tabs on desktop.

CSS cannot fetch Jellyseerr/Overseerr data, create real discovery rows, or reorder libraries by itself. Configure Jellyfin and your Seerr/Jellyfin Enhanced integration so the row exists first, then this theme will style common `jellyseerr`, `overseerr`, and `seerr` row hooks.

## Optional Seerr Discovery Rows

If your Jellyfin setup has a JavaScript injector, add this block there. Replace `https://seerr.example.com` with your Jellyseerr, Overseerr, or Seerr URL.

```js
window.JF_SEERR_DISCOVERY_CONFIG = {
    seerrBaseUrl: "https://seerr.example.com",
    showErrors: false,
    rows: [
        { title: "Popular Movies", endpoint: "/discover/movies", mediaType: "movie" },
        { title: "Popular Shows", endpoint: "/discover/tv", mediaType: "tv" },
        { title: "Trending", endpoint: "/discover/trending", mediaType: "mixed" }
    ]
};

(() => {
    const script = document.createElement("script");
    script.src = "https://tait-whale.github.io/jellyfin-ui/jellyfin-seerr-discovery.js";
    script.defer = true;
    document.head.appendChild(script);
})();
```

This uses browser-side fetch, so it is subject to mixed-content and CORS rules. If it fails, put Seerr behind the same reverse proxy/domain as Jellyfin, or use a small server-side proxy/plugin so the Seerr API key stays off the browser. If your Seerr CORS setup allows credentials, add `useCredentials: true`.

Failed Seerr rows are hidden by default so the home page stays clean. Set `showErrors: true` temporarily when debugging CORS, mixed-content, or login issues.

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
