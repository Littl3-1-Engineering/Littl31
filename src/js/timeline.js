// Timeline page (timeline.html) — fetches the static timeline.json asset
// at runtime and renders/filters it client-side. Self-guarded: on any
// other page `root` is null and the whole module is a no-op, same
// pattern as pricing-info.js/nav.js.

const root = document.querySelector('[data-timeline-root]')

if (root) {
  const PRODUCTS = ['Backend', 'Deck', 'littl31.com', 'Uplink']

  // Fixed per-product accent, used both for the entry-card product chips
  // and (statically, in timeline.pug) for the filter chips themselves —
  // keep these two in sync if either changes.
  const PRODUCT_ACCENT = {
    Backend: 'gray',
    Deck: 'cyan',
    'littl31.com': 'amber',
    Uplink: 'orange'
  }

  // timeline.json used to carry the product name that was current when each
  // row shipped, so pre-Sep-2026 rows were tagged "Nexus Launcher". That is
  // no longer true: Notion itself normalised those rows to "Deck" (the tag
  // is not even a valid Product option there any more), so on 2026-09-22 the
  // JSON was migrated to match its upstream and no row carries the old tag.
  // The same applies to 'Cloud', renamed to 'Uplink' in Notion and here on 2026-09-22.
  // normalizeProduct() is kept as a fallback, applied once right after fetch,
  // so a stale or hand-edited row still resolves onto a current canonical key
  // rather than silently dropping out of PRODUCTS matching/grouping,
  // PRODUCT_ACCENT and the filter chips.
  const PRODUCT_ALIASES = {
    'Nexus Launcher': 'Deck',
    Cloud: 'Uplink'
  }

  function normalizeProduct (product) {
    return PRODUCT_ALIASES[product] || product
  }

  const PRODUCT_DISPLAY = {
    Deck: 'Alfr3d Deck',
    Uplink: 'Alfr3d Uplink'
  }

  function displayName (product) {
    return PRODUCT_DISPLAY[product] || product
  }

  const STATES = {
    history: {
      accent: 'gray',
      grouped: false,
      match: (e) => e.phase === 'Past',
      sort: sortByDate('asc')
    },
    // Current Feature Set is what has actually shipped. Work still In Progress
    // belongs under Upcoming even when its row is already phase 'Present'
    // (the Notion sync marks a feature Present as soon as it starts landing).
    // `rollup` folds older shipped entries into summary cards, see rollUp().
    current: {
      accent: 'amber',
      grouped: true,
      rollup: true,
      match: (e) => e.phase === 'Present' && e.status !== 'In Progress',
      sort: sortByDate('desc')
    },
    upcoming: {
      accent: 'orange',
      grouped: false,
      match: (e) => (e.phase === 'Future' || e.phase === 'Present') && e.status === 'In Progress',
      sort: sortByDate('asc')
    },
    roadmap: {
      accent: 'cyan',
      grouped: false,
      match: (e) => e.phase === 'Future' && (e.status === 'Backburner' || e.status === 'Planned'),
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
      return `<span class="accent-border-${accent} accent-text-${accent} text-xs tracking-widest uppercase border rounded-full px-3 py-1 inline-block">${escapeHtml(displayName(p))}</span>`
    }).join('')
  }

  function pricingTiers (product) {
    const tiers = pricingByProduct[product]
    if (!tiers || !tiers.length) return ''
    const cards = tiers.map((tier) => {
      const accent = tier.accent || 'amber'
      // Tiers with currency variants (content.yml's `amounts` map) show USD
      // here — this static summary view has no currency switcher of its own.
      const amount = tier.amount || (tier.amounts && tier.amounts.USD) || ''
      return `
        <div class="window-frame window-sm accent-${escapeHtml(accent)}">
          <div class="window-body">
            <div class="window-content px-6 py-4">
              <div class="font-bold accent-text-${escapeHtml(accent)} text-2xl">${escapeHtml(amount)}</div>
              <div class="text-xs text-gray-400 mt-1">${escapeHtml(tier.label)}</div>
            </div>
          </div>
        </div>`
    }).join('')
    return `<div class="flex flex-wrap gap-4 mt-6">${cards}</div>`
  }

  // Roll-up for the Current Feature Set view, computed at render time from
  // today's date so it keeps working without regenerating timeline.json:
  //   - entries from the last 30 days stay as individual cards;
  //   - older entries from this calendar year fold into one card per month;
  //   - entries from before this calendar year fold into one card per quarter.
  // A bucket holding a single entry is left as that entry. Undated entries are
  // never folded. Applied per product section, so a Backend+Deck entry rolls
  // up separately under each product it belongs to.
  const RECENT_DAYS = 30
  const DAY_MS = 24 * 60 * 60 * 1000

  function rollupBucket (entry, now) {
    const t = entry.date ? Date.parse(entry.date) : NaN
    if (Number.isNaN(t) || now - t <= RECENT_DAYS * DAY_MS) return null
    const d = new Date(t)
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    if (year < new Date(now).getUTCFullYear()) {
      const quarter = Math.floor(month / 3) + 1
      return { key: `${year}-Q${quarter}`, label: `Q${quarter} ${year}`, quarterly: true }
    }
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    return { key: `${year}-${String(month + 1).padStart(2, '0')}`, label, quarterly: false }
  }

  function firstSentence (text) {
    const clean = String(text).replace(/\s+/g, ' ').trim()
    const end = clean.search(/[.!?](\s|$)/)
    const sentence = end === -1 ? clean : clean.slice(0, end + 1)
    return sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}…` : sentence
  }

  function rollupSummary (bucket, items, product) {
    const chronological = items.slice().sort(sortByDate('asc'))
    const bullets = []
    chronological.forEach((e) => {
      if (Array.isArray(e.description)) {
        // Already a bullet summary (e.g. a monthly card from the sync) — keep its bullets.
        e.description.forEach((line) => bullets.push(line))
      } else {
        bullets.push(`${e.milestone} — ${firstSentence(e.description)}`)
      }
    })
    const latest = chronological[chronological.length - 1]
    return {
      id: `rollup-${product}-${bucket.key}`,
      milestone: `${displayName(product)}: ${bucket.label} in review`,
      phase: 'Present',
      product: [product],
      status: 'Shipped',
      date: latest.date,
      dateLabel: bucket.quarterly ? bucket.label : null,
      description: Array.from(new Set(bullets))
    }
  }

  function rollUp (list, product, now) {
    const out = []
    const buckets = new Map()
    list.forEach((e) => {
      const bucket = rollupBucket(e, now)
      if (!bucket) {
        out.push(e)
        return
      }
      if (!buckets.has(bucket.key)) buckets.set(bucket.key, { bucket, items: [] })
      buckets.get(bucket.key).items.push(e)
    })
    buckets.forEach(({ bucket, items }) => {
      out.push(items.length === 1 ? items[0] : rollupSummary(bucket, items, product))
    })
    return out
  }

  // A grouped/summarized entry (a whole period's milestones for one product
  // folded into one card, either by the Documentation Sync Protocol or by
  // rollUp() above) carries `description` as an array of bullet highlights
  // instead of a single paragraph string. Render whichever shape the entry
  // actually has.
  function entryDescription (entry) {
    if (Array.isArray(entry.description)) {
      const items = entry.description.map((line) => `<li>${escapeHtml(line)}</li>`).join('')
      return `<ul class="list-disc list-inside space-y-1.5 text-gray-300 text-sm leading-relaxed mt-4">${items}</ul>`
    }
    return `<p class="text-gray-300 text-sm leading-relaxed mt-4">${escapeHtml(entry.description)}</p>`
  }

  function entryCard (entry, accent) {
    return `
      <div class="window-frame window-sm accent-${accent}">
        <div class="window-body">
          <div class="window-titlebar">
            <span class="window-dot"></span>
            <span class="font-mono text-xs uppercase tracking-widest text-gray-300">${escapeHtml(entry.dateLabel || formatDate(entry.date))}</span>
            <span class="font-mono text-xs uppercase tracking-widest text-gray-500">· ${escapeHtml(entry.status)}</span>
          </div>
          <div class="window-content p-6 md:p-8">
            <h3 class="font-display font-bold text-white text-lg md:text-xl">${escapeHtml(entry.milestone)}</h3>
            <div class="flex flex-wrap gap-2 mt-3">${productChips(entry.product)}</div>
            ${entryDescription(entry)}
          </div>
        </div>
      </div>`
  }

  function groupHeading (product, accent) {
    return `<h3 class="font-display font-bold accent-text-${accent} text-2xl md:text-3xl border-b accent-border-${accent} border-opacity-40 pb-2 mb-6">${escapeHtml(displayName(product))}</h3>`
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
      const now = Date.now()
      resultsEl.innerHTML = products
        .map((product) => {
          let inGroup = filtered.filter((e) => e.product.includes(product))
          if (!inGroup.length) return ''
          if (config.rollup) inGroup = rollUp(inGroup, product, now).sort(config.sort)
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
      entries = data.map((e) => ({ ...e, product: e.product.map(normalizeProduct) }))
      render()
    })
    .catch((err) => {
      statusEl.textContent = 'Could not load the timeline right now — please try again later.'
      // eslint-disable-next-line no-console
      console.error('[timeline] failed to load timeline.json', err)
    })
}
