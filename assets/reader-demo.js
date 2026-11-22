"use strict";

const day = 86400000;
const modes = ["system", "light", "dark"];
const sections = ["catalog", "loans", "holds"];
const pathKey = location.pathname.replace(/index\.html$/, "");
const storageKey = `jzlib-reader-demo-v1:${pathKey}`;
const offline = location.protocol === "file:";
const initialParams = new URLSearchParams(location.search);
const byId = new Map(catalog.map(book => [book.id, book]));
const htmlEntities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => htmlEntities[char]);

function initialState() {
    const now = Date.now();
    return {
        lang: document.documentElement.lang === "zh-CN" ? "zh-CN" : "en", appearance: "system", signedIn: true,
        loans: [
            { id: "moss", borrowed: now - 12 * day, due: now + 9 * day, renewed: false },
            { id: "walden", borrowed: now - 8 * day, due: now + 13 * day, renewed: false },
            { id: "secret", borrowed: now - 32 * day, due: now - 11 * day, returned: true }
        ],
        holds: [{ id: "earthsea", until: now + 2 * day }]
    };
}

function loadState() {
    try {
        const value = JSON.parse(localStorage.getItem(storageKey));
        if (value && Object.hasOwn(messages, value.lang) && modes.includes(value.appearance)
            && typeof value.signedIn === "boolean" && Array.isArray(value.loans) && Array.isArray(value.holds)
            && value.loans.every(l => l && byId.has(l.id) && Number.isFinite(l.due) && Number.isFinite(l.borrowed))
            && value.holds.every(h => h && byId.has(h.id) && Number.isFinite(h.until))) return value;
    } catch { /* Private previews can use in-memory state. */ }
    return initialState();
}
let state = loadState();
let flash = "";
let warning = false;
if (Object.hasOwn(messages, initialParams.get("lang"))) state.lang = initialParams.get("lang");
function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Keep the current session usable. */ }
}
save();
const t = key => messages[state.lang][key];
const genre = book => genreNames[state.lang][book.category];
const dateText = (value, time = false) => new Intl.DateTimeFormat(state.lang, {
    dateStyle: "medium", ...(time ? { timeStyle: "short" } : {})
}).format(value);
const main = document.getElementById("main");

function params() {
    const query = offline && location.hash.startsWith("#?") ? location.hash.slice(2) : location.search;
    return new URLSearchParams(query);
}
function urlFor(view, extra = {}) { return (offline ? "#?" : "?") + new URLSearchParams({ view, ...extra }); }
function viewLink(view, label, extra = {}, attrs = "") {
    return `<a data-view href="${escapeHTML(urlFor(view, extra))}" ${attrs}>${escapeHTML(label)}</a>`;
}
function navigate(href, focusMain = true) {
    history.pushState(null, "", href);
    draw();
    if (focusMain) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
}
function statusOf(book) {
    if (book.id === "invisible" || state.loans.some(l => l.id === book.id && !l.returned)) return "out";
    if (book.id === "momo" || state.holds.some(h => h.id === book.id && h.until > Date.now())) return "held";
    return "available";
}
function badge(status) { return `<span class="status ${status}">${t(status)}</span>`; }
function options(entries, current) {
    return entries.map(([value, label]) => `<option value="${escapeHTML(value)}"${value === current ? " selected" : ""}>${escapeHTML(label)}</option>`).join("");
}
function header(view) {
    const nav = sections.map(s => viewLink(s, t(s), {}, view === s || (s === "catalog" && view === "book") ? 'aria-current="page"' : "")).join("");
    const prefs = `<div class="preferences">
        <label><span class="sr">${t("language")}</span><select id="language">${options([["en","English"],["zh-CN","简体中文"]],state.lang)}</select></label>
        <label><span class="sr">${t("theme")}</span><select id="appearance">${options(modes.map(s => [s,t(s)]),state.appearance)}</select></label></div>`;
    document.getElementById("topbar").innerHTML = `<a class="brand" data-view href="${urlFor("catalog")}"><span class="brand-mark" aria-hidden="true"><i></i><i></i></span><span>${t("brand")}</span></a>
        ${state.signedIn ? `<nav aria-label="${t("main_nav")}">${nav}</nav>` : ""}
        <div class="header-tools">${prefs}${state.signedIn ? `<button class="button subtle signout" data-action="signout">${t("signout")}</button>` : ""}</div>`;
}
function matches(book, query) {
    if (!query) return true;
    const values = [book.title, book.author, book.keywords, book.isbn, book.publisher, genre(book)];
    const terms = query.trim().toLocaleLowerCase().split(/\s+/);
    const combined = values.filter(Boolean).join(" ").toLocaleLowerCase();
    return terms.every(term => combined.includes(term) || (book.isbn && book.isbn.includes(term.replace(/[-\s]/g, "")) && /\d/.test(term)));
}
function searchForm(view, q, filter) {
    const statuses = [["","any_status"],["available","available"],["held","held"],["out","out"]];
    return `<form class="search ${view === "loans" ? "personal-search" : ""}" data-search="${view}" method="get">
        <input type="hidden" name="view" value="${view}"><label class="sr" for="query">${t(view === "loans" ? "search_loans" : "search_label")}</label>
        <input id="query" name="q" type="search" maxlength="160" placeholder="${t("search_placeholder")}" value="${escapeHTML(q)}">
        ${view === "catalog" ? `<label class="sr" for="availability">${t("availability")}</label><select id="availability" name="status">${options(statuses.map(([v,k])=>[v,t(k)]),filter)}</select>` : ""}
        <button class="button primary">${t("search")}</button></form>`;
}
function catalogPage(p) {
    const q = p.get("q") || "", filter = p.get("status") || "";
    const results = catalog.filter(book => matches(book,q) && (!filter || statusOf(book) === filter));
    const cards = results.map(book => `<article class="book-card"><span class="book-icon" aria-hidden="true"><i></i></span>
        <div class="book-copy">${badge(statusOf(book))}<h3>${viewLink("book",book.title,{ id:book.id })}</h3>
        <p>${escapeHTML(book.author)}</p><small>${escapeHTML(genre(book))}</small></div></article>`).join("");
    return `<section class="catalog-intro"><div><h1>${t("catalog_heading")}</h1><p>${t("catalog_copy")}</p>${searchForm("catalog",q,filter)}</div>
        <img src="./assets/reading-garden-small.webp" alt="" width="600" height="400"></section>
        <section aria-labelledby="results-heading" class="results"><h2 id="results-heading">${t("results")}</h2>
        ${results.length ? `<div class="books">${cards}</div>` : `<p class="empty">${t("no_books")}</p>`}</section>`;
}
function action(name, key, id = "", style = "secondary") {
    return `<button type="button" class="button ${style}" data-action="${name}" data-id="${escapeHTML(id)}">${t(key)}</button>`;
}
function details(book) {
    const back = viewLink("catalog",t("back"),{},'class="back"');
    if (!book) return back + `<p class="alert" role="alert">${t("book_missing")}</p>`;
    const status = statusOf(book);
    const fields = [[t("publisher"),book.publisher],["ISBN",book.isbn],[t("category_name"),genre(book)],[t("shelf"),book.shelf],[t("book_format"),book.format && t(book.format)]];
    return `${back}<article class="detail">${badge(status)}<h1>${escapeHTML(book.title)}</h1><p class="muted">${escapeHTML(book.author)}</p>
        <dl class="metadata">${fields.filter(([,v]) => v).map(([k,v])=>`<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join("")}</dl>
        ${status === "available" ? action("reserve","reserve",book.id,"primary") + `<small class="action-hint">${t("reserve_hint")}</small>` : ""}</article>`;
}
function renewalProblem(loan) {
    if (loan.renewed) return "renew_used";
    if (Date.now() < loan.borrowed + day) return "too_early";
    if (Date.now() >= loan.due + 21 * day) return "too_late";
    return "";
}
function records(view, p) {
    const isHold = view === "holds", q = p.get("q") || "";
    const list = isHold ? state.holds : state.loans.filter(l => matches(byId.get(l.id),q));
    const rows = list.map(item => {
        const book = byId.get(item.id);
        const status = isHold ? "held" : item.returned ? "returned" : item.due < Date.now() ? "overdue" : "borrowed";
        const reason = !isHold && renewalProblem(item);
        const button = isHold ? action("cancel","cancel",book.id) : item.returned ? "" : reason ? `<p class="action-hint">${t(reason)}</p>` : action("renew","renew",book.id);
        return `<li><div>${badge(status)}<h2>${viewLink("book",book.title,{id:book.id})}</h2>
            <p>${t(isHold ? "pickup_by" : "due_at")} · ${dateText(isHold ? item.until : item.due,isHold)}</p>
            ${isHold ? "" : `<p>${t("loaned_at")} · ${dateText(item.borrowed)}</p>`}</div>${button}</li>`;
    }).join("");
    return `<section class="personal"><h1>${t(view)}</h1>${isHold ? "" : searchForm("loans",q,"")}
        ${rows ? `<ul class="records">${rows}</ul>` : `<p class="empty">${t(isHold ? "no_holds" : "no_loans")}</p>`}</section>`;
}
function signIn() {
    return `<div class="welcome"><section class="welcome-story"><div class="story-copy"><span class="eyebrow">${t("portal")}</span><h1>${t("welcome_heading")}</h1><p>${t("welcome_copy")}</p></div>
        <img src="./assets/reading-garden.webp" srcset="./assets/reading-garden-small.webp 600w, ./assets/reading-garden.webp 1200w" sizes="(max-width:790px) 92vw,660px" width="1200" height="800" alt="${t("illustration")}"></section>
        <section class="signin"><h2>${t("signin")}</h2><p class="muted">${t("demo_signin")}</p>${action("signin","enter_demo","","primary")}</section></div>`;
}
function draw() {
    state.holds = state.holds.filter(h => h.until > Date.now());
    const p = params(), route = p.get("view");
    const view = sections.includes(route) || route === "book" ? route : "catalog";
    const root = document.documentElement;
    root.lang = state.lang;
    root.dataset.appearance = state.appearance;
    document.title = `${t(state.signedIn ? (view === "book" ? "catalog" : view) : "signin")} · ${t("brand")}`;
    document.getElementById("skip-link").textContent = t("skip");
    document.getElementById("footer-brand").textContent = t("brand");
    document.getElementById("footer-demo").textContent = t("demo");
    header(view);
    let content;
    if (!state.signedIn) content = signIn();
    else if (view === "catalog") content = catalogPage(p);
    else if (view === "book") content = details(byId.get(p.get("id")));
    else content = records(view,p);
    main.innerHTML = (flash ? `<p class="${warning ? "alert" : "notice"}" role="${warning ? "alert" : "status"}">${escapeHTML(flash)}</p>` : "") + content;
}
function mutate(name, id) {
    flash = "";
    warning = false;
    if (name === "signin" || name === "signout") {
        state.signedIn = name === "signin";
        save(); navigate(urlFor("catalog")); return;
    }
    const book = byId.get(id);
    if (!state.signedIn || !book) return;
    if (name === "reserve") {
        if (statusOf(book) !== "available") { flash = t("book_unavailable"); warning = true; }
        else if (state.holds.length >= 3) { flash = t("hold_limit"); warning = true; }
        else {
            const until = Date.now() + 2 * day;
            state.holds.unshift({id, until});
            flash = t("reserved").replace("%s", dateText(until,true));
        }
    } else if (name === "cancel") {
        state.holds = state.holds.filter(h => h.id !== id);
        flash = t("cancelled");
    } else if (name === "renew") {
        const loan = state.loans.find(l => l.id === id && !l.returned);
        if (!loan || renewalProblem(loan)) return;
        loan.due += 21 * day; loan.renewed = true; flash = t("renewed");
    }
    save(); draw();
    main.focus({preventScroll:true}); window.scrollTo(0,0);
}
document.addEventListener("click", e => {
    const button = e.target.closest("[data-action]");
    if (button) { mutate(button.dataset.action,button.dataset.id); return; }
    const link = e.target.closest("a[data-view]");
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault(); flash = ""; navigate(link.getAttribute("href"));
});
document.addEventListener("submit", e => {
    if (!e.target.matches("form[data-search]")) return;
    e.preventDefault(); flash = "";
    const values = new URLSearchParams(new FormData(e.target));
    for (const key of ["q", "status"]) if (!values.get(key)) values.delete(key);
    navigate((offline ? "#?" : "?") + values.toString());
});
document.addEventListener("change", e => {
    const target = e.target;
    if (target.id === "language" && Object.hasOwn(messages,target.value)) {
        state.lang = target.value;
        const url = new URL(location.href);
        if (!offline && url.searchParams.has("lang")) { url.searchParams.set("lang",state.lang); history.replaceState(null,"",url); }
    } else if (target.id === "appearance" && modes.includes(target.value)) state.appearance = target.value;
    else return;
    flash = ""; save(); draw(); document.getElementById(target.id).focus();
});
window.addEventListener("popstate", () => { flash = ""; draw(); });
window.addEventListener("storage", event => { if (event.key === storageKey) { state = loadState(); flash = ""; draw(); } });
draw();
