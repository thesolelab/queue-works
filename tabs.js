(function () {
  'use strict';
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const navigation = document.getElementById('tool-navigation');
  const toggle = document.getElementById('mobile-nav-toggle');
  const mobile = window.matchMedia('(max-width: 700px)');
  let expanded = false;
  function selected() {
    return tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  }
  function setMenu(open, restoreFocus = false) {
    expanded = mobile.matches && open;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    navigation.dataset.mobileOpen = String(expanded);
    navigation.hidden = mobile.matches && !expanded;
    if (restoreFocus && mobile.matches) toggle.focus({ preventScroll: true });
  }
  function responsive(event) {
    const wasInNavigation = navigation.contains(document.activeElement);
    const wasToggle = document.activeElement === toggle;
    setMenu(false);
    navigation.setAttribute(
      'aria-orientation',
      mobile.matches ? 'vertical' : 'horizontal'
    );
    for (const tab of tabs) tab.tabIndex = tab === selected() ? 0 : -1;
    const lostFocus = Boolean(event) && document.activeElement === document.body;
    if (mobile.matches && (wasInNavigation || lostFocus))
      toggle.focus({ preventScroll: true });
    else if (
      !mobile.matches &&
      (wasToggle || wasInNavigation || lostFocus)
    )
      selected().focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => {
    setMenu(!expanded);
    if (expanded) {
      const tab = selected();
      tabs.forEach((item) => {
        item.tabIndex = item === tab ? 0 : -1;
      });
      tab.focus({ preventScroll: true });
      navigation.scrollTop = Math.max(
        0,
        tab.offsetTop - navigation.clientHeight / 2 + tab.offsetHeight / 2
      );
    }
  });
  document.addEventListener('keydown', (event) => {
    if (mobile.matches && expanded && event.key === 'Escape') {
      event.preventDefault();
      setMenu(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (
      !mobile.matches ||
      !expanded ||
      navigation.contains(event.target) ||
      toggle.contains(event.target)
    )
      return;
    const restoreFocus = navigation.contains(document.activeElement);
    setMenu(false, restoreFocus);
  });
  navigation.addEventListener('focusout', (event) => {
    if (
      mobile.matches &&
      expanded &&
      event.relatedTarget &&
      !navigation.contains(event.relatedTarget) &&
      event.relatedTarget !== toggle
    )
      setMenu(false);
  });
  mobile.addEventListener('change', responsive);
  responsive();
  function activate(tab) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    }
    if (mobile.matches) setMenu(false);
    document.body.classList.toggle('home-active', tab.id === 'home-tab');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.AnalysisTabs = {
    activate(id, { focusPanel = false } = {}) {
      const tab = tabs.find((item) => item.id === id);
      if (!tab) return;
      activate(tab);
      if (focusPanel) {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        panel.focus({ preventScroll: true });
      }
    },
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activate(tab);
      if (mobile.matches)
        document
          .getElementById(tab.getAttribute('aria-controls'))
          .focus({ preventScroll: true });
    });
    tab.addEventListener('keydown', (event) => {
      let next;
      if (mobile.matches && event.key === 'ArrowDown')
        next = tabs[(index + 1) % tabs.length];
      if (mobile.matches && event.key === 'ArrowUp')
        next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      if (mobile.matches)
        tabs.forEach((item) => {
          item.tabIndex = item === next ? 0 : -1;
        });
      else activate(next);
      next.focus();
    });
  });
})();
