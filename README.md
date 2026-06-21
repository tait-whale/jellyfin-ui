# Jellyfin UI Theme

External Jellyfin CSS theme built around Abyss, Intro Skipper styling, a polished home hero/media bar, tighter poster rows, and a cleaner top navigation/search pill.

## Use It In Jellyfin

1. Keep this public repository available on GitHub.
2. In Jellyfin, open `Dashboard > General > Custom CSS`.
3. Paste this:

```css
@import url("https://cdn.jsdelivr.net/gh/tait-whale/jellyfin-ui@main/jellyfin-theme.css");
```

When the theme changes, purge the jsDelivr cache for this URL instead of changing the Jellyfin dashboard import.

## What CSS Can And Cannot Do

This theme can style the header, poster cards, dialogs, buttons, home rows, and the Media Bar plugin area. It also makes Jellyfin's search icon look like a search bar and moves it beside the centered tabs on desktop.

CSS cannot fetch Jellyseerr/Overseerr data, create real discovery rows, or reorder libraries by itself. Configure Jellyfin and your Seerr/Jellyfin Enhanced integration so the row exists first, then this theme will style common `jellyseerr`, `overseerr`, and `seerr` row hooks.

## Optional Seerr Discovery Rows

If your Jellyfin setup has a JavaScript injector, add this block there. Replace `https://seerr.example.com` with your Jellyseerr, Overseerr, or Seerr URL.

```js
window.JF_SEERR_DISCOVERY_CONFIG = {
    seerrBaseUrl: "https://seerr.example.com",
    rows: [
        { title: "Popular Movies", endpoint: "/discover/movies", mediaType: "movie" },
        { title: "Popular Shows", endpoint: "/discover/tv", mediaType: "tv" },
        { title: "Trending", endpoint: "/discover/trending", mediaType: "mixed" }
    ]
};

(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/tait-whale/jellyfin-ui@main/jellyfin-seerr-discovery.js";
    script.defer = true;
    document.head.appendChild(script);
})();
```

This uses Seerr cookie auth by default. That is the safest browser-side option. If it fails with a CORS or authentication error, put Seerr behind the same reverse proxy/domain as Jellyfin, or use a small server-side proxy/plugin so the Seerr API key stays off the browser.

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
