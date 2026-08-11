/**
 * Tabbed Portfolio — Interactive single-page navigation
 * with smooth fade-in transitions and hash-based deep linking.
 */
(function () {
    'use strict';

    const VALID_TABS = ['overview', 'education', 'research', 'work', 'skills'];
    let activeTab = 'overview';

    /**
     * Switch to a tab by id. Handles the visual state, animation, and URL hash.
     * @param {string} tabId - One of VALID_TABS
     * @param {boolean} updateHash - Whether to sync the URL hash
     */
    function switchTab(tabId, updateHash = true) {
        if (!VALID_TABS.includes(tabId) || tabId === activeTab) return;

        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Update panels — with fade-out, then fade-in
        const oldPanel = document.getElementById(activeTab);
        const newPanel = document.getElementById(tabId);

        if (oldPanel === newPanel) {
            setActiveTabPanel(newPanel);
        } else if (oldPanel && newPanel) {
            // Fade out old
            oldPanel.style.opacity = '0';
            oldPanel.style.transform = 'translateY(6px)';

            setTimeout(() => {
                setActiveTabPanel(newPanel);
                // Small delay then fade in
                requestAnimationFrame(() => {
                    newPanel.style.opacity = '';
                    newPanel.style.transform = '';
                });
            }, 150);
        }

        activeTab = tabId;

        // Update hash (without jumping, and only if initiated by user click)
        if (updateHash) {
            const newHash = '#' + tabId;
            if (window.location.hash !== newHash) {
                history.replaceState(null, '', newHash);
            }
        }
    }

    /**
     * Set the active tab panel without animation (for initial load and post-transition).
     */
    function setActiveTabPanel(panel) {
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.remove('active');
            p.hidden = true;
            p.style.opacity = '';
            p.style.transform = '';
        });
        panel.classList.add('active');
        panel.hidden = false;
    }

    /**
     * Determine the initial tab from the URL hash.
     */
    function getInitialTab() {
        const hash = window.location.hash.replace('#', '');
        if (hash && VALID_TABS.includes(hash)) {
            return hash;
        }
        return 'overview';
    }

    /**
     * Initialize: set up click handlers, hash sync, and initial state.
     */
    function init() {
        const initialTab = getInitialTab();

        // Wire up tab button clicks
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                switchTab(tabId, true);
            });
        });

        // Hash change — allows browser back/forward to work
        window.addEventListener('hashchange', () => {
            const target = getInitialTab();
            switchTab(target, false);
        });

        // Keyboard: left/right arrows navigate tabs when nav is focused
        document.querySelector('.tab-nav').addEventListener('keydown', (e) => {
            const currentIdx = VALID_TABS.indexOf(activeTab);
            let nextIdx = -1;

            if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % VALID_TABS.length;
            else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + VALID_TABS.length) % VALID_TABS.length;
            else if (e.key === 'Home') nextIdx = 0;
            else if (e.key === 'End') nextIdx = VALID_TABS.length - 1;

            if (nextIdx !== -1) {
                e.preventDefault();
                const nextBtn = document.querySelector(`.tab-btn[data-tab="${VALID_TABS[nextIdx]}"]`);
                nextBtn.focus();
                switchTab(VALID_TABS[nextIdx], true);
            }
        });

        // Apply initial tab (already set via .active on the HTML — just sync buttons)
        if (initialTab !== 'overview') {
            // Deactivate the default and activate the hash-based one
            const defaultPanel = document.getElementById('overview');
            defaultPanel.classList.remove('active');
            defaultPanel.hidden = true;

            const targetPanel = document.getElementById(initialTab);
            targetPanel.classList.add('active');
            targetPanel.hidden = false;

            document.querySelectorAll('.tab-btn').forEach(btn => {
                const isActive = btn.dataset.tab === initialTab;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            activeTab = initialTab;
        }

        // Smooth-scroll to tab-nav if user lands on a hash (prevents being scrolled past on load)
        if (initialTab !== 'overview') {
            requestAnimationFrame(() => {
                document.querySelector('.tab-nav').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
