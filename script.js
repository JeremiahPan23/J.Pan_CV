/** Shared layout, bilingual copy and accessible section navigation. */
(function () {
    'use strict';
    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));
    const zh = window.PORTFOLIO_ZH || { copy: {}, attributes: {} };
    const canonical = value => value.replace(/\s+/g, ' ').replace(/\s+([,.:;)])/g, '$1').replace(/\(\s+/g, '(').trim();
    const decoder = document.createElement('textarea');
    const keyFor = element => {
        decoder.innerHTML = element.innerHTML.replace(/<[^>]*>/g, ' ');
        return canonical(decoder.value);
    };
    const translations = new Map(Object.entries(zh.copy).map(([key, value]) => [canonical(key), value]));
    const nodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,li,summary,.badge,.pill,.edu-years,.tab-label,.visual-label,.text-link,.button-primary,.skip-link,.cert-link a')).map(element => ({ element, english: element.innerHTML, key: keyFor(element) }));
    const attributes = Array.from(document.querySelectorAll('[aria-label],[alt]')).flatMap(element => ['aria-label', 'alt'].filter(name => element.hasAttribute(name)).map(name => ({ element, name, english: element.getAttribute(name) })));
    const brand = document.querySelector('.site-brand');
    const englishBrand = brand.innerHTML;
    const englishTitle = document.title;
    const metadata = Array.from(document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]')).map(element => ({ element, english: element.content, title: /title/.test(element.getAttribute('name') || element.getAttribute('property')) }));
    let language = 'en';
    let activeTab = 'overview';
    const unchanged = new Set(['Python', 'PyTorch', 'Slurm', 'Hugging Face Transformers']);
    const missing = nodes.filter(node => /[a-z]/i.test(node.key) && !translations.has(node.key) && !unchanged.has(node.key));
    document.documentElement.dataset.translationMissing = String(missing.length);
    if (missing.length) console.warn('Chinese copy missing:', JSON.stringify(missing.map(node => node.key)));

    function setLanguage(next, remember = true) {
        if (next !== 'en' && next !== 'zh') return;
        const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
        const anchor = window.scrollY > 20 ? nodes.find(node => {
            const box = node.element.getBoundingClientRect();
            return box.height > 0 && box.top >= headerBottom && box.top < window.innerHeight;
        }) : null;
        const anchorTop = anchor ? anchor.element.getBoundingClientRect().top : 0;
        language = next;
        document.documentElement.lang = next === 'zh' ? 'zh-Hans' : 'en';
        document.documentElement.dataset.language = next;
        nodes.forEach(({ element, english, key }) => { element.innerHTML = next === 'zh' && translations.has(key) ? translations.get(key) : english; });
        attributes.forEach(({ element, name, english }) => { element.setAttribute(name, next === 'zh' ? (zh.attributes[english] || english) : english); });
        brand.innerHTML = next === 'zh' ? '潘佳鑫<span class="brand-dot" aria-hidden="true">.</span>' : englishBrand;
        document.title = next === 'zh' ? zh.title : englishTitle;
        metadata.forEach(({ element, english, title }) => { element.content = next === 'zh' ? (title ? zh.title : zh.description) : english; });
        document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === next)));
        if (remember) { try { localStorage.setItem('portfolio-language', next); } catch (_) { /* Site still works if storage is disabled. */ } }
        document.dispatchEvent(new CustomEvent('portfolio:language', { detail: { language: next } }));
        if (anchor) requestAnimationFrame(() => window.scrollBy({ top: anchor.element.getBoundingClientRect().top - anchorTop, behavior: 'instant' }));
    }

    function showTab(id, { project = '', scroll = true, updateHash = true, focus = false } = {}) {
        if (!panels.some(panel => panel.id === id)) return;
        activeTab = id;
        panels.forEach(panel => { panel.hidden = panel.id !== id; panel.classList.toggle('active', panel.id === id); });
        tabs.forEach(button => {
            const selected = button.dataset.tab === id;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
        });
        const panel = document.getElementById(id);
        const target = project ? document.getElementById(project) : panel;
        if (updateHash) {
            const hash = '#' + (project || id);
            if (location.hash !== hash) history.pushState(null, '', hash);
        }
        if (focus && target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
        if (scroll) {
            const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
            if (id === 'overview' && !project) window.scrollTo({ top: 0, behavior });
            else if (target) target.scrollIntoView({ behavior, block: 'start' });
        }
        document.dispatchEvent(new CustomEvent('portfolio:panel-change'));
    }

    function readHash(scroll) {
        const hash = location.hash.slice(1);
        if (hash === 'main') showTab(activeTab, { scroll, updateHash: false, focus: true });
        else if (['xy-project', 'hssrlm-project', 'urc2026'].includes(hash)) showTab('research', { project: hash, scroll, updateHash: false });
        else if (hash === 'about') showTab('overview', { project: 'about', scroll, updateHash: false });
        else if (hash === 'choir') showTab('work', { project: 'choir', scroll, updateHash: false });
        else showTab(panels.some(panel => panel.id === hash) ? hash : 'overview', { scroll, updateHash: false });
    }
    tabs.forEach(button => button.addEventListener('click', () => showTab(button.dataset.tab)));
    document.querySelectorAll('.read-more-link').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        showTab(link.dataset.tab, { project: link.dataset.project || '', focus: true });
    }));
    document.querySelector('.tab-nav').addEventListener('keydown', event => {
        let index = tabs.findIndex(button => button.dataset.tab === activeTab);
        if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[index].focus();
        showTab(tabs[index].dataset.tab);
    });
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
    window.addEventListener('popstate', () => readHash(true));
    window.addEventListener('hashchange', () => readHash(true));
    let saved = 'en';
    try { saved = localStorage.getItem('portfolio-language') || 'en'; } catch (_) { /* English remains the default. */ }
    setLanguage(saved === 'zh' ? 'zh' : 'en', false);
    readHash(false);
    if (location.hash) requestAnimationFrame(() => readHash(true));
})();
