/**
 * venue-filter.js
 * Handles AJAX venue filtering on /venues page.
 * Uses Fetch API to call /api/venues and re-renders the grid without page reload.
 */
(function () {
  'use strict';

  const grid        = document.getElementById('venues-grid');
  const emptyState  = document.getElementById('empty-state');
  const spinner     = document.getElementById('loading-spinner');
  const resultCount = document.getElementById('result-count');
  const sortSelect  = document.getElementById('sort-select');

  // Tracks the last set of venues returned by the API so sort can re-order them
  // without issuing another network request.
  let currentVenues = window.__INITIAL_VENUES__ || [];

  let debounceTimer = null;

  /* ── Helpers ────────────────────────────────────────────────── */
  const showSpinner = () => {
    spinner?.classList.remove('hidden');
    grid?.classList.add('opacity-40', 'pointer-events-none');
  };
  const hideSpinner = () => {
    spinner?.classList.add('hidden');
    grid?.classList.remove('opacity-40', 'pointer-events-none');
  };

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }

  const formatCurrency = n => '₹' + Number(n).toLocaleString('en-IN');

  /* ── Build a venue card HTML string ────────────────────────── */
  function buildCard(venue) {
    const statusBadge = venue.status === 'Active'
      ? '<span class="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white">Active</span>'
      : '<span class="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white">Maintenance</span>';

    const imgEl = (venue.images && venue.images.length > 0)
      ? `<img src="${escHtml(venue.images[0])}" alt="${escHtml(venue.name)}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'" />`
      : `<div class="w-full h-full bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center">
           <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
           </svg>
         </div>`;

    const amenityBadges = (venue.amenities || []).slice(0, 3)
      .map(a => `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">${escHtml(a)}</span>`)
      .join('');
    const extra = (venue.amenities || []).length > 3
      ? `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">+${venue.amenities.length - 3}</span>`
      : '';

    return `
      <div class="venue-card group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          ${imgEl}
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          ${statusBadge}
        </div>
        <div class="p-5">
          <h2 class="text-base font-semibold text-slate-900 truncate mb-1">${escHtml(venue.name)}</h2>
          <p class="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            ${escHtml(venue.location)}
          </p>
          <div class="flex flex-wrap gap-1.5 mb-4">${amenityBadges}${extra}</div>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-400">Up to</span>
              <span class="text-sm font-semibold text-slate-700 ml-1">${Number(venue.capacity).toLocaleString()} guests</span>
            </div>
            <span class="text-lg font-bold text-indigo-600">${formatCurrency(venue.pricePerHour)}<span class="text-xs font-normal text-slate-400">/hr</span></span>
          </div>
          <a href="/venues/${venue._id}"
             class="mt-4 block w-full text-center bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-200">
            View Details →
          </a>
        </div>
      </div>`;
  }

  /* ── Sort venues client-side ────────────────────────────────── */
  function sortVenues(venues) {
    const method = sortSelect?.value || 'newest';
    const copy   = [...venues];
    switch (method) {
      case 'price-asc':  return copy.sort((a, b) => a.pricePerHour - b.pricePerHour);
      case 'price-desc': return copy.sort((a, b) => b.pricePerHour - a.pricePerHour);
      case 'capacity':   return copy.sort((a, b) => b.capacity - a.capacity);
      default:           return copy; // newest = server order
    }
  }

  /* ── Render venues into the grid ────────────────────────────── */
  function renderVenues(venues) {
    const sorted = sortVenues(venues);
    if (resultCount) resultCount.textContent = sorted.length;

    if (sorted.length === 0) {
      if (grid) grid.innerHTML = '';
      emptyState?.classList.remove('hidden');
    } else {
      emptyState?.classList.add('hidden');
      if (grid) grid.innerHTML = sorted.map(buildCard).join('');
    }
  }

  /* ── Fetch filtered venues from the API ─────────────────────── */
  async function fetchVenues() {
    const search    = (document.getElementById('filter-search')?.value   || '').trim();
    const capacity  = (document.getElementById('filter-capacity')?.value  || '').trim();
    const amenities = (document.getElementById('filter-amenities')?.value || '').trim();

    const params = new URLSearchParams();
    if (search)    params.set('search',    search);
    if (capacity)  params.set('capacity',  capacity);
    if (amenities) params.set('amenities', amenities);

    showSpinner();
    try {
      const res  = await fetch(`/api/venues?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        currentVenues = data.venues; // keep in sync so sort works on filtered results
        renderVenues(currentVenues);
      }
    } catch (err) {
      console.error('Venue filter error:', err);
    } finally {
      hideSpinner();
    }
  }

  /* ── Debounce wrapper ───────────────────────────────────────── */
  function debouncedFetch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchVenues, 350);
  }

  /* ── Event listeners ────────────────────────────────────────── */
  document.getElementById('btn-filter')?.addEventListener('click', fetchVenues);

  document.getElementById('filter-search')?.addEventListener('input',  debouncedFetch);
  document.getElementById('filter-capacity')?.addEventListener('input', debouncedFetch);
  document.getElementById('filter-amenities')?.addEventListener('input', debouncedFetch);

  // Sort operates on the already-fetched currentVenues (no extra round-trip)
  sortSelect?.addEventListener('change', () => renderVenues(currentVenues));

  // Reset – restore to original SSR data
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    const searchEl    = document.getElementById('filter-search');
    const capacityEl  = document.getElementById('filter-capacity');
    const amenitiesEl = document.getElementById('filter-amenities');
    if (searchEl)    searchEl.value    = '';
    if (capacityEl)  capacityEl.value  = '';
    if (amenitiesEl) amenitiesEl.value = '';
    document.querySelectorAll('.amenity-badge').forEach(b => {
      b.classList.remove('bg-indigo-100', 'border-indigo-300', 'text-indigo-600');
    });
    currentVenues = window.__INITIAL_VENUES__ || [];
    renderVenues(currentVenues);
  });

  /* ── Amenity quick-select badges ────────────────────────────── */
  document.querySelectorAll('.amenity-badge').forEach(badge => {
    badge.addEventListener('click', function () {
      this.classList.toggle('bg-indigo-100');
      this.classList.toggle('border-indigo-300');
      this.classList.toggle('text-indigo-600');

      const selected = [...document.querySelectorAll('.amenity-badge.bg-indigo-100')]
        .map(b => b.dataset.amenity);

      const input = document.getElementById('filter-amenities');
      if (input) input.value = selected.join(', ');
      debouncedFetch();
    });
  });

})();
