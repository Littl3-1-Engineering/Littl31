// Timeline page (timeline.html) — fetches the static timeline.json asset
// at runtime and renders/filters it client-side. Self-guarded: on any
// other page `root` is null and the whole module is a no-op, same
// pattern as pricing-info.js/nav.js.

const root = document.querySelector('[data-timeline-root]')

if (root) {
  const PRODUCTS = ['Backend', 'Nexus Launcher', 'littl31.com', 'Cloud']

  // Fixed per-product accent, used both for the entry-card product chips
  // and (statically, in timeline.pug) for the filter chips themselves —
  // keep these two in sync if either changes.
  const PRODUCT_ACCENT = {
    Backend: 'gray',
    'Nexus Launcher': 'cyan',
    'littl31.com': 'amber',
    Cloud: 'orange'
  }

  const STATES = {
    history: {
      accent: 'gray',
      grouped: false,
      match: (e) => e.phase === 'Past',
      sort: sortByDate('asc')
    },
    current: {
      accent: 'amber',
      grouped: true,
      match: (e) => e.phase === 'Present',
      sort: sortByDate('desc')
    },
    upcoming: {
      accent: 'orange',
      grouped: false,
      match: (e) => e.phase === 'Future' && e.status === 'In Progress',
      sort: sortByDate('asc')
    },
    roadmap: {
      accent: 'cyan',
      grouped: false,
      match: (e) => e.phase === 'Future' && e.status === 'Backburner',
      sort: sortByDate('asc')
    }
  }

  const tabsEl = document.querySelector('[data-timeline-tabs]')
  const filtersEl = document.querySelector('[data-timeline-filters]')
  const statusEl = document.querySelector('[data-timeline-status]')
  const resultsEl = document.querySelector('[data-timeline-results]')
  const emptyEl = document.querySelector('[data-timeline-empty]')
  const pricingDataEl = document.getElementById('timeline-pricing-data')

  const pricingByProduct = pricingDataEl ? JSON.parse(pricingDataEl.textContent || '{}') : {}

  let entries = null
  let activeTab = 'history'
  let activeFilter = 'all'

  function sortByDate (direction) {
    const sign = direction === 'asc' ? 1 : -1
    return (a, b) => {
      const ta = a.date ? Date.parse(a.date) : null
      const tb = b.date ? Date.parse(b.date) : null
      if (ta === null && tb === null) return 0
      if (ta === null) return 1 // undated always sorts last, either direction
      if (tb === null) return -1
      return sign * (ta - tb)
    }
  }

  function escapeHtml (str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
  }

  function formatDate (iso) {
    if (!iso) return 'Undated'
    const parsed = new Date(iso)
    if (Number.isNaN(parsed.getTime())) return 'Undated'
    return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
  }

  function productChips (products) {
    return products.map((p) => {
      const accent = PRODUCT_ACCENT[p] || 'gray'
      return `<span class="accent-border-${accent} accent-text-${accent} text-xs tracking-widest uppercase border rounded-full px-3 py-1 inline-block">${escapeHtml(p)}</span>`
    }).join('')
  }

  function pricingTiers (product) {
    const tiers = pricingByProduct[product]
    if (!tiers || !tiers.length) return ''
    const cards = tiers.map((tier) => {
      const accent = tier.accent || 'amber'
      return `
        <div class="window-frame window-sm accent-${escapeHtml(accent)}">
          <div class="window-body">
            <div class="window-content px-6 py-4">
              <div class="font-bold accent-text-${escapeHtml(accent)} text-2xl">${escapeHtml(tier.amount)}</div>
              <div class="text-xs text-gray-400 mt-1">${escapeHtml(tier.label)}</div>
            </div>
          </div>
        </div>`
    }).join('')
    return `<div class="flex flex-wrap gap-4 mt-6">${cards}</div>`
  }

  function entryCard (entry, accent) {
    const link = entry.source
      ? `<a class="btn-glow accent-${accent} mt-4 inline-flex text-xs" href="${escapeHtml(entry.source)}" target="_blank" rel="noopener noreferrer">View source →</a>`
      : ''
    return `
      <div class="window-frame window-sm accent-${accent}">
        <div class="window-body">
          <div class="window-titlebar">
            <span class="window-dot"></span>
            <span class="font-mono text-xs uppercase tracking-widest text-gray-300">${escapeHtml(formatDate(entry.date))}</span>
            <span class="font-mono text-xs uppercase tracking-widest text-gray-500">· ${escapeHtml(entry.status)}</span>
          </div>
          <div class="window-content p-6 md:p-8">
            <h3 class="font-display font-bold text-white text-lg md:text-xl">${escapeHtml(entry.milestone)}</h3>
            <div class="flex flex-wrap gap-2 mt-3">${productChips(entry.product)}</div>
            <p class="text-gray-300 text-sm leading-relaxed mt-4">${escapeHtml(entry.description)}</p>
            ${link}
          </div>
        </div>
      </div>`
  }

  function groupHeading (product, accent) {
    return `<h3 class="font-display font-bold accent-text-${accent} text-2xl md:text-3xl border-b accent-border-${accent} border-opacity-40 pb-2 mb-6">${escapeHtml(product)}</h3>`
  }

  function render () {
    if (!entries) return

    const config = STATES[activeTab]
    const filterMatch = (e) => activeFilter === 'all' || e.product.includes(activeFilter)
    const filtered = entries.filter(config.match).filter(filterMatch).slice().sort(config.sort)

    if (!filtered.length) {
      resultsEl.classList.add('hidden')
      resultsEl.innerHTML = ''
      emptyEl.classList.remove('hidden')
      statusEl.classList.add('hidden')
      return
    }

    emptyEl.classList.add('hidden')
    statusEl.classList.add('hidden')
    resultsEl.classList.remove('hidden')

    if (config.grouped) {
      const products = activeFilter === 'all' ? PRODUCTS : [activeFilter]
      resultsEl.innerHTML = products
        .map((product) => {
          const inGroup = filtered.filter((e) => e.product.includes(product))
          if (!inGroup.length) return ''
          const cards = inGroup.map((e) => entryCard(e, config.accent)).join('')
          const pricing = pricingTiers(product)
          return `<div>${groupHeading(product, PRODUCT_ACCENT[product] || config.accent)}<div class="space-y-6">${cards}</div>${pricing}</div>`
        })
        .join('')
    } else {
      resultsEl.innerHTML = `<div class="space-y-6">${filtered.map((e) => entryCard(e, config.accent)).join('')}</div>`
    }
  }

  function setActiveTab (tab) {
    activeTab = tab
    tabsEl.querySelectorAll('[data-tab]').forEach((btn) => {
      const isActive = btn.dataset.tab === tab
      btn.classList.toggle('is-active', isActive)
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false')
    })
    render()
  }

  function setActiveFilter (filter) {
    activeFilter = filter
    filtersEl.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.filter === filter)
    })
    render()
  }

  if (tabsEl) {
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]')
      if (btn) setActiveTab(btn.dataset.tab)
    })
  }

  if (filtersEl) {
    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]')
      if (btn) setActiveFilter(btn.dataset.filter)
    })
  }

  fetch(root.dataset.source)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then((data) => {
      entries = data
      render()
    })
    .catch((err) => {
      statusEl.textContent = 'Could not load the timeline right now — please try again later.'
      // eslint-disable-next-line no-console
      console.error('[timeline] failed to load timeline.json', err)
    })
}
