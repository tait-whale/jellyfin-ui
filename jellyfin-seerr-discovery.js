/* global window, document, MutationObserver */
(function () {
    "use strict";

    const CONFIG_KEY = "JF_SEERR_DISCOVERY_CONFIG";
    const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w342";
    const DEFAULT_ROWS = [
        {
            id: "seerr-popular-movies",
            title: "Popular Movies",
            endpoint: "/discover/movies",
            mediaType: "movie"
        },
        {
            id: "seerr-popular-shows",
            title: "Popular Shows",
            endpoint: "/discover/tv",
            mediaType: "tv"
        },
        {
            id: "seerr-trending",
            title: "Discover on Seerr",
            endpoint: "/discover/trending",
            mediaType: "mixed"
        }
    ];

    const DEFAULT_CONFIG = {
        enabled: true,
        seerrBaseUrl: "",
        apiKey: "",
        maxItems: 18,
        rows: DEFAULT_ROWS
    };

    const state = {
        renderTimer: 0,
        lastPath: "",
        renderedSignature: "",
        observer: null
    };

    function readConfig() {
        let stored = {};

        try {
            stored = JSON.parse(window.localStorage.getItem(CONFIG_KEY) || "{}");
        } catch (_error) {
            stored = {};
        }

        const runtime = window.JF_SEERR_DISCOVERY_CONFIG || {};
        const config = Object.assign({}, DEFAULT_CONFIG, stored, runtime);
        config.rows = Array.isArray(config.rows) && config.rows.length
            ? config.rows
            : DEFAULT_ROWS;
        config.maxItems = Number(config.maxItems || DEFAULT_CONFIG.maxItems);
        config.seerrBaseUrl = String(config.seerrBaseUrl || "").replace(/\/+$/, "");
        config.apiKey = String(config.apiKey || "");

        return config;
    }

    function isHomePage() {
        return Boolean(
            document.querySelector(".homePage:not(.hide), #indexPage.homePage:not(.hide)") ||
            document.querySelector(".homeSectionsContainer")
        );
    }

    function getHomeContainer() {
        return document.querySelector(
            ".homePage .homeSectionsContainer, #indexPage .homeSectionsContainer, .homeSectionsContainer"
        );
    }

    function buildUrl(config, row) {
        const endpoint = String(row.endpoint || "").replace(/^\/?/, "/");
        const url = new URL(`${config.seerrBaseUrl}/api/v1${endpoint}`);
        const params = row.params || {};

        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
                url.searchParams.set(key, params[key]);
            }
        });

        return url;
    }

    async function fetchRow(config, row) {
        const headers = {};

        if (config.apiKey) {
            headers["X-Api-Key"] = config.apiKey;
        }

        const response = await window.fetch(buildUrl(config, row).toString(), {
            headers,
            credentials: config.apiKey ? "omit" : "include"
        });

        if (!response.ok) {
            throw new Error(`Seerr returned ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data.results) ? data.results : [];
    }

    function mediaTypeFor(row, item) {
        if (item.mediaType) {
            return item.mediaType;
        }

        if (row.mediaType === "tv" || item.name || item.firstAirDate) {
            return "tv";
        }

        return "movie";
    }

    function detailUrl(config, row, item) {
        const type = mediaTypeFor(row, item);
        const path = type === "tv" ? "tv" : "movie";
        return `${config.seerrBaseUrl}/${path}/${item.id}`;
    }

    function posterUrl(item) {
        if (!item.posterPath) {
            return "";
        }

        if (/^https?:\/\//i.test(item.posterPath)) {
            return item.posterPath;
        }

        return `${TMDB_POSTER_BASE}${item.posterPath}`;
    }

    function titleFor(item) {
        return item.title || item.name || item.originalTitle || item.originalName || "Untitled";
    }

    function yearFor(item) {
        const date = item.releaseDate || item.firstAirDate || "";
        return date ? date.slice(0, 4) : "";
    }

    function statusLabel(item) {
        const status = item.mediaInfo && item.mediaInfo.status;

        if (status === 5) {
            return "In Jellyfin";
        }

        if (status === 2 || status === 3 || status === 4) {
            return "Requested";
        }

        return "Request";
    }

    function createCard(config, row, item) {
        const card = document.createElement("a");
        const poster = document.createElement("div");
        const body = document.createElement("div");
        const title = document.createElement("div");
        const meta = document.createElement("div");
        const request = document.createElement("span");
        const score = item.voteAverage ? Number(item.voteAverage).toFixed(1) : "";
        const year = yearFor(item);
        const posterImage = posterUrl(item);

        card.className = "jf-seerr-card";
        card.href = detailUrl(config, row, item);
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.title = titleFor(item);

        poster.className = "jf-seerr-poster";
        if (posterImage) {
            poster.style.backgroundImage = `url("${posterImage}")`;
        } else {
            poster.classList.add("is-empty");
        }

        body.className = "jf-seerr-card-body";
        title.className = "jf-seerr-title";
        title.textContent = titleFor(item);
        meta.className = "jf-seerr-meta";
        meta.textContent = [year, score ? `star ${score}` : ""].filter(Boolean).join("  ");
        request.className = "jf-seerr-request";
        request.textContent = statusLabel(item);

        body.append(title, meta, request);
        card.append(poster, body);

        return card;
    }

    function createSection(row) {
        const section = document.createElement("section");
        const header = document.createElement("div");
        const title = document.createElement("h2");
        const scroller = document.createElement("div");

        section.className = "jf-seerr-section verticalSection";
        section.dataset.jfSeerrRow = row.id || row.title || row.endpoint;
        header.className = "jf-seerr-header";
        title.className = "sectionTitle jf-seerr-heading";
        title.textContent = row.title || "Discover";
        scroller.className = "jf-seerr-scroller itemsContainer";

        header.append(title);
        section.append(header, scroller);

        return { section, scroller };
    }

    function showMessage(scroller, message) {
        const empty = document.createElement("div");
        empty.className = "jf-seerr-message";
        empty.textContent = message;
        scroller.replaceChildren(empty);
    }

    function findExistingSection(container, key) {
        return Array.from(container.querySelectorAll("[data-jf-seerr-row]"))
            .find((section) => section.dataset.jfSeerrRow === String(key));
    }

    async function renderRow(config, container, row) {
        const key = row.id || row.title || row.endpoint;
        const existing = findExistingSection(container, key);
        const created = existing ? null : createSection(row);
        const section = existing || created.section;
        const scroller = existing ? existing.querySelector(".jf-seerr-scroller") : created.scroller;

        if (!existing) {
            container.append(section);
        }

        showMessage(scroller, "Loading discovery...");

        try {
            const items = (await fetchRow(config, row))
                .filter((item) => item && item.id)
                .slice(0, config.maxItems);

            if (!items.length) {
                showMessage(scroller, "No discovery results yet.");
                return;
            }

            scroller.replaceChildren(...items.map((item) => createCard(config, row, item)));
        } catch (error) {
            showMessage(scroller, `Seerr row could not load: ${error.message}`);
        }
    }

    function render() {
        const config = readConfig();
        const container = getHomeContainer();
        const signature = JSON.stringify({
            path: window.location.pathname,
            seerrBaseUrl: config.seerrBaseUrl,
            maxItems: config.maxItems,
            rows: config.rows
        });

        if (!config.enabled || !config.seerrBaseUrl || !isHomePage() || !container) {
            return;
        }

        if (state.renderedSignature === signature && container.querySelector(".jf-seerr-section")) {
            return;
        }

        state.renderedSignature = signature;
        config.rows.forEach((row) => {
            renderRow(config, container, row);
        });
    }

    function scheduleRender() {
        window.clearTimeout(state.renderTimer);
        state.renderTimer = window.setTimeout(render, 250);
    }

    function start() {
        scheduleRender();

        state.observer = new MutationObserver(() => {
            if (state.lastPath !== window.location.pathname) {
                state.lastPath = window.location.pathname;
                state.renderedSignature = "";
                scheduleRender();
                return;
            }

            const container = getHomeContainer();
            if (isHomePage() && container && !container.querySelector(".jf-seerr-section")) {
                scheduleRender();
            }
        });

        state.observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
}());
