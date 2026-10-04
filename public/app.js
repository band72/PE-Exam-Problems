// SolvedIn6 PE Exam Practice Problem Portal - Frontend Application

let allProblems = [];
let localVideosSet = new Set();
let currentModalProblem = null;
let currentVideoSource = 'youtube'; // default to 'youtube' for highest 1080p resolution
let practiceMode = false;
let modalSolutionVisible = true;

// User state stored in localStorage
const STORAGE_KEY = 'solvedin6_pe_study_state_v1';
let userState = {
  favorites: {},
  statuses: {}, // id -> 'UNATTEMPTED' | 'MASTERED' | 'REVIEW'
  theme: 'dark',
  preferredVideoSource: 'youtube-hd', // 'youtube-hd' (1080p Full HD) or 'local' (offline)
  theaterMode: false,
  startWithBookmarks: false
};

function updateStartWithBookmarkBtn() {
  const btn = document.getElementById('startWithBookmarkToggle');
  const txt = document.getElementById('startWithBookmarkStatus');
  if (!btn || !txt) return;
  const active = !!userState.startWithBookmarks;
  txt.textContent = active ? 'ON' : 'OFF';
  btn.classList.toggle('btn-primary', active);
}

// Load saved user state
function loadUserState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      userState = Object.assign(userState, JSON.parse(raw));
    }
    if (userState.preferredVideoSource === 'local') {
      currentVideoSource = 'local';
    } else {
      currentVideoSource = 'youtube';
      userState.preferredVideoSource = 'youtube-hd';
    }
  } catch (e) {
    console.error('Error loading study state', e);
  }
}

function saveUserState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
    updateStatsBanner();
  } catch (e) {
    console.error('Error saving study state', e);
  }
}

// Fetch initial data
async function initApp() {
  loadUserState();
  applyTheme(userState.theme || 'dark');

  try {
    const [probsRes, videoRes] = await Promise.all([
      fetch('/api/problems'),
      fetch('/api/videos/status')
    ]);

    allProblems = await probsRes.json();
    const videoData = await videoRes.json();
    localVideosSet = new Set(videoData.local_videos || []);

    document.getElementById('localVideosCount').textContent = localVideosSet.size;
  } catch (err) {
    console.error('Failed to load problems from API, attempting local fallback', err);
    const res = await fetch('/data/problems.json');
    allProblems = await res.json();
  }

  setupEventListeners();
  updateStatsBanner();
  updateStartWithBookmarkBtn();

  // Reset search box on initial load unless query param 'q' is explicitly given
  const searchEl = document.getElementById('searchInput');
  if (searchEl && !window.location.search.includes('q=')) {
    searchEl.value = '';
  }

  applyBookmarkUrlOrPreference();
  renderProblemGrid();

  // Periodically refresh local video status if downloads are progressing
  setInterval(checkLocalVideosStatus, 8000);
}

function applyBookmarkUrlOrPreference() {
  const hash = window.location.hash ? window.location.hash.trim().toLowerCase() : '';
  const params = new URLSearchParams(window.location.search);
  const statusSelect = document.getElementById('statusFilterSelect');

  const bookmarkedCount = Object.keys(userState.favorites || {}).filter(k => userState.favorites[k]).length;

  // 1. Direct bookmark filter via URL (#bookmarks, #favorites, ?filter=bookmarks, ?status=FAVORITES)
  // or user preference startWithBookmarks
  if (hash === '#bookmarks' || hash === '#favorites' || params.get('filter') === 'bookmarks' || params.get('status') === 'FAVORITES') {
    if (bookmarkedCount > 0) {
      if (statusSelect) statusSelect.value = 'FAVORITES';
    } else {
      // If no bookmarks exist yet, do NOT show an empty screen! Default to ALL
      if (statusSelect) statusSelect.value = 'ALL';
      history.replaceState(null, null, window.location.pathname + (window.location.search || ''));
    }
  } else if (userState.startWithBookmarks && bookmarkedCount > 0) {
    if (statusSelect) statusSelect.value = 'FAVORITES';
  } else {
    if (statusSelect && statusSelect.value === 'FAVORITES' && bookmarkedCount === 0) {
      statusSelect.value = 'ALL';
    }
  }

  // 2. Query param for series (?series=Water+Resources, etc.)
  const seriesParam = params.get('series');
  if (seriesParam) {
    const tab = document.querySelector(`.series-tab[data-series="${seriesParam}"]`);
    if (tab) {
      document.querySelectorAll('.series-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    }
  }

  // 3. Deep-link to Civil Engineering Toolbox
  if (hash.startsWith('#toolbox')) {
    const mod = hash.replace(/^#(?:toolbox-)?/, '').replace(/^#toolbox/, '');
    setTimeout(() => {
      if (window.CivilToolbox) {
        window.CivilToolbox.openModule(mod || 'walls');
      }
    }, 150);
    return;
  }

  // 3b. Deep-link to Stormwater & CN Facility Lab
  if (hash === '#stormwater' || hash === '#pond-sizing' || hash === '#cn-routing' || hash === '#stormwater-calc') {
    setTimeout(() => {
      if (window.StormwaterCalculator) {
        window.StormwaterCalculator.open();
      }
    }, 150);
    return;
  }

  // 4. Deep-link bookmark to a specific problem: #problem-52, #52, #WR-12, #wr12
  if (hash && hash !== '#bookmarks' && hash !== '#favorites') {
    const cleanHash = hash.replace(/^#(?:problem-)?/, '').replace(/^#/, '');
    const found = allProblems.find(p => {
      if (p.id && p.id.toLowerCase() === cleanHash) return true;
      if (String(p.problem_number) === cleanHash) return true;
      if (p.wr_number && `wr${p.wr_number}` === cleanHash.replace(/[^a-z0-9]/g, '')) return true;
      if (p.env_number && `env${p.env_number}` === cleanHash.replace(/[^a-z0-9]/g, '')) return true;
      if (p.breadth_number && `breadth${p.breadth_number}` === cleanHash.replace(/[^a-z0-9]/g, '')) return true;
      return false;
    });
    if (found) {
      setTimeout(() => {
        openProblemModal(found);
      }, 100);
    }
  }
}

async function checkLocalVideosStatus() {
  try {
    const res = await fetch('/api/videos/status');
    const data = await res.json();
    if (data.local_videos) {
      const prevSize = localVideosSet.size;
      localVideosSet = new Set(data.local_videos);
      document.getElementById('localVideosCount').textContent = localVideosSet.size;
      if (localVideosSet.size !== prevSize) {
        renderProblemGrid();
      }
    }
  } catch (e) {}
}

function updateStatsBanner() {
  const total = allProblems.length;
  let mastered = 0;
  let review = 0;
  let favs = 0;

  allProblems.forEach(p => {
    const s = userState.statuses[p.id];
    if (s === 'MASTERED') mastered++;
    if (s === 'REVIEW') review++;
    if (userState.favorites[p.id]) favs++;
  });

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statMastered').textContent = mastered;
  document.getElementById('statReview').textContent = review;
  document.getElementById('statFavs').textContent = favs;

  const wrCount = allProblems.filter(p => (p.playlists || []).includes('Water Resources')).length;
  const envCount = allProblems.filter(p => (p.playlists || []).includes('Environmental')).length;
  const breadthCount = allProblems.filter(p => (p.playlists || []).includes('Civil Breadth') || (p.problem_number >= 51 && p.problem_number <= 80)).length;
  const bothCount = allProblems.filter(p => {
    const pl = p.playlists || [];
    return pl.includes('Water Resources') && pl.includes('Environmental');
  }).length;

  if (document.getElementById('tabCountAll')) document.getElementById('tabCountAll').textContent = total;
  if (document.getElementById('tabCountWR')) document.getElementById('tabCountWR').textContent = wrCount;
  if (document.getElementById('tabCountEnv')) document.getElementById('tabCountEnv').textContent = envCount;
  if (document.getElementById('tabCountBreadth')) document.getElementById('tabCountBreadth').textContent = breadthCount;
  if (document.getElementById('tabCountBoth')) document.getElementById('tabCountBoth').textContent = bothCount;
}

// Filtering & Sorting
function getFilteredProblems() {
  const rawQuery = document.getElementById('searchInput').value.trim().toLowerCase();
  
  // Series / Playlist filter
  const activeSeriesTab = document.querySelector('.series-tab.active');
  const activeSeries = activeSeriesTab ? activeSeriesTab.dataset.series : 'ALL';

  // Topic filter
  const activePill = document.querySelector('.filter-pill.active');
  const activeTopic = activePill ? activePill.dataset.topic : 'ALL';
  const activeStatus = document.getElementById('statusFilterSelect').value;
  const sortBy = document.getElementById('sortSelect').value;

  // Normalize query and generate tokens (support 'waste water' as synonym for 'wastewater')
  const query = rawQuery.replace(/waste\s+water/g, 'wastewater');
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];

  let filtered = allProblems.filter(p => {
    // 1. Series / Playlist filter
    const playlists = p.playlists || [];
    const isWr = playlists.includes('Water Resources') || (p.discipline && p.discipline.includes('Water Resources'));
    const isEnv = playlists.includes('Environmental') || (p.discipline && p.discipline.includes('Environmental'));
    const isBreadth = playlists.includes('Civil Breadth') || (p.discipline && p.discipline.includes('Civil Breadth')) || (p.problem_number >= 51 && p.problem_number <= 80);

    if (activeSeries === 'Water Resources' && !isWr) return false;
    if (activeSeries === 'Environmental' && !isEnv) return false;
    if (activeSeries === 'Civil Breadth' && !isBreadth) return false;
    if (activeSeries === 'BOTH' && (!isWr || !isEnv)) return false;

    // 2. Topic filter
    if (activeTopic !== 'ALL') {
      if (p.category !== activeTopic && p.discipline !== activeTopic) {
        return false;
      }
    }

    // 3. Status filter
    if (activeStatus === 'FAVORITES' && !userState.favorites[p.id]) return false;
    if (activeStatus === 'MASTERED' && userState.statuses[p.id] !== 'MASTERED') return false;
    if (activeStatus === 'REVIEW' && userState.statuses[p.id] !== 'REVIEW') return false;
    if (activeStatus === 'UNATTEMPTED' && userState.statuses[p.id] && userState.statuses[p.id] !== 'UNATTEMPTED') return false;

    // 4. Multi-term Search query with synonyms, sequential numbers (1-76), and original video #s
    if (tokens.length > 0) {
      const probNum = p.problem_number ? String(p.problem_number) : '';
      const wrNum = p.wr_number ? String(p.wr_number) : '';
      const envNum = p.env_number ? String(p.env_number) : '';
      const breadthNum = p.breadth_number ? String(p.breadth_number) : '';

      const searchTarget = (
        '#' + probNum + ' ' + probNum + ' ' +
        (wrNum ? ('wr #' + wrNum + ' wr' + wrNum + ' #' + wrNum + ' ' + wrNum + ' problem ' + wrNum + ' water resources ' + wrNum + ' ') : '') +
        (envNum ? ('env #' + envNum + ' env' + envNum + ' #' + envNum + ' ' + envNum + ' environmental ' + envNum + ' ') : '') +
        (breadthNum ? ('breadth #' + breadthNum + ' breadth' + breadthNum + ' #' + breadthNum + ' ' + breadthNum + ' civil breadth ' + breadthNum + ' ') : '') +
        (p.title || '') + ' ' +
        (p.topic || '') + ' ' +
        (p.category || '') + ' ' +
        (p.category === 'Wastewater Treatment' ? 'wastewater waste water waste sewage sewer ' : '') +
        (p.problem_statement || '') + ' ' +
        (p.final_answer || '') + ' ' +
        (p.ncees_search_terms || []).join(' ') + ' ' +
        (p.plain_transcript || '')
      ).toLowerCase();

      // All search tokens must match
      for (const t of tokens) {
        if (!searchTarget.includes(t)) {
          return false;
        }
      }

      // Calculate search relevance score
      let score = 0;
      
      // Numeric matching: if query contains a number N
      const numMatch = query.match(/(?:#|wr|env|breadth|problem)?\s*(\d+)/i);
      if (numMatch) {
        const searchedNum = parseInt(numMatch[1], 10);
        const hasWrPrefix = /\bwr\b/i.test(query);
        const hasEnvPrefix = /\benv\b/i.test(query);
        const hasBreadthPrefix = /\bbreadth\b/i.test(query);

        if (hasWrPrefix && p.wr_number === searchedNum) {
          score += 40000;
        } else if (hasEnvPrefix && p.env_number === searchedNum) {
          score += 40000;
        } else if (hasBreadthPrefix && (p.breadth_number === searchedNum || (p.problem_number - 50) === searchedNum)) {
          score += 40000;
        } else if (activeSeries === 'Environmental') {
          if (p.env_number === searchedNum) score += 25000;
          if (p.problem_number === searchedNum) score += 20000;
        } else if (activeSeries === 'Water Resources') {
          if (p.wr_number === searchedNum) score += 25000;
          if (p.problem_number === searchedNum) score += 20000;
        } else if (activeSeries === 'Civil Breadth') {
          if (p.breadth_number === searchedNum || (p.problem_number - 50) === searchedNum) score += 25000;
          if (p.problem_number === searchedNum) score += 20000;
        } else {
          // ALL tab: prioritize exact problem # first!
          if (p.problem_number === searchedNum) score += 30000;
          if (p.wr_number === searchedNum || p.env_number === searchedNum || p.breadth_number === searchedNum) score += 15000;
        }
      }

      // Title & Topic match
      const titleTopic = ((p.title || '') + ' ' + (p.topic || '')).toLowerCase();
      for (const t of tokens) {
        if (titleTopic.includes(t)) score += 200;
      }

      // Category match
      const cat = (p.category || '').toLowerCase();
      for (const t of tokens) {
        if (cat.includes(t)) score += 150;
      }

      // NCEES terms
      const ncees = (p.ncees_search_terms || []).join(' ').toLowerCase();
      for (const t of tokens) {
        if (ncees.includes(t)) score += 80;
      }

      // Problem statement
      const stmt = (p.problem_statement || '').toLowerCase();
      for (const t of tokens) {
        if (stmt.includes(t)) score += 20;
      }

      p._searchScore = score;
    } else {
      p._searchScore = 0;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    // When a search query is entered, prioritize highest relevance score!
    if (tokens.length > 0 && b._searchScore !== a._searchScore) {
      return (b._searchScore || 0) - (a._searchScore || 0);
    }
    if (sortBy === 'exam-asc') {
      if (activeSeries === 'Environmental') {
        return (a.env_number || 999) - (b.env_number || 999);
      } else if (activeSeries === 'Civil Breadth') {
        return (a.breadth_number || (a.problem_number - 50) || 999) - (b.breadth_number || (b.problem_number - 50) || 999);
      }
      return (a.wr_number || a.problem_number || 999) - (b.wr_number || b.problem_number || 999);
    } else if (sortBy === 'num-asc') {
      return (a.problem_number || 999) - (b.problem_number || 999);
    } else if (sortBy === 'num-desc') {
      return (b.problem_number || 999) - (a.problem_number || 999);
    } else if (sortBy === 'duration-desc') {
      return (b.duration || 0) - (a.duration || 0);
    } else if (sortBy === 'duration-asc') {
      return (a.duration || 0) - (b.duration || 0);
    } else if (sortBy === 'title-asc') {
      return (a.topic || a.title).localeCompare(b.topic || b.title);
    }
    return 0;
  });

  return filtered;
}

// Render Card Grid
function renderProblemGrid() {
  const grid = document.getElementById('problemsGrid');
  const filtered = getFilteredProblems();
  document.getElementById('visibleCount').textContent = filtered.length;

  const activeSeriesTab = document.querySelector('.series-tab.active');
  const activeSeries = activeSeriesTab ? activeSeriesTab.dataset.series : 'ALL';

  const rawQuery = document.getElementById('searchInput').value.trim().toLowerCase();
  let toolboxMatches = [];
  if (rawQuery && window.CivilToolbox) {
    toolboxMatches = window.CivilToolbox.searchModules(rawQuery);
  }

  if (filtered.length === 0) {
    // 1. Check if query matches Civil Engineering Toolbox
    if (toolboxMatches.length > 0) {
      const topMatch = toolboxMatches[0];
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; max-width: 720px; margin: 2rem auto; background: var(--bg-card); border: 2px solid #d97706; border-radius: var(--radius-md); padding: 2rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">${topMatch.icon}</div>
          <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: #f59e0b;">Civil Engineering Toolbox: ${topMatch.title}</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
            Interactive engineering solver for <strong>${topMatch.title}</strong> with USCS soil presets, U.S. weather distributions, live SVG diagrams, adjustable Safety Factors (SF), and NCEES derivations (${topMatch.nceesRef}).
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn toolbox-featured-btn" onclick="if(window.CivilToolbox) window.CivilToolbox.openModule('${topMatch.key}');" style="font-size: 0.95rem; padding: 0.65rem 1.4rem;">
              🚀 Open Interactive ${topMatch.title}
            </button>
            <button class="btn" onclick="showAllProblems()" style="font-size: 0.95rem; padding: 0.65rem 1.25rem;">
              📚 Reset All Filters & View Problems
            </button>
          </div>
        </div>
      `;
      return;
    }

    const isNpshSearch = rawQuery.includes('npsh') || rawQuery.includes('cavitat') || rawQuery.includes('suction lift');
    if (isNpshSearch) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; max-width: 680px; margin: 2rem auto; background: var(--bg-card); border: 2px solid #0284c7; border-radius: var(--radius-md); padding: 2rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💧⚡</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">NCEES § 6.3.8.6 NPSH & Pump Cavitation Engineering Lab</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
            Master Net Positive Suction Head with live sliders for altitude, fluid temperature, suction lift, pipe diameter, and pump NPSH_r. Features real-time SVG cavitation bubble simulation, waterfall charts, and NCEES derivations!
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="if(window.NpshCalculator) window.NpshCalculator.open();" style="font-size: 0.95rem; padding: 0.65rem 1.4rem; background: linear-gradient(135deg, #059669, #0284c7); border: none; font-weight: 700;">
              🚀 Launch NPSH & Cavitation Simulator
            </button>
            <button class="btn" onclick="showAllProblems()" style="font-size: 0.95rem; padding: 0.65rem 1.25rem;">
              📚 View All Problems
            </button>
          </div>
        </div>
      `;
      return;
    }

    const isStormwaterSearch = rawQuery.includes('stormwater') || rawQuery.includes('curve number') || rawQuery.includes('tr-55') || rawQuery === 'cn' || rawQuery.includes('detention') || rawQuery.includes('retention') || rawQuery.includes('basin');
    if (isStormwaterSearch) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; max-width: 700px; margin: 2rem auto; background: var(--bg-card); border: 2px solid #0d9488; border-radius: var(--radius-md); padding: 2rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🌧️🏞️</div>
          <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: #0d9488;">NCEES § 6.3.3 Stormwater Facility Sizing & Curve Number (CN) Lab</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
            Master Stormwater Detention & Retention Basin sizing, TR-55 composite Curve Number matrix across Soil Groups A-D, Water Quality volume drawdown orifice sizing, and emergency broad-crested spillway hydraulics!
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="if(window.StormwaterCalculator) window.StormwaterCalculator.open();" style="font-size: 0.95rem; padding: 0.65rem 1.4rem; background: linear-gradient(135deg, #0284c7, #0d9488); border: none; font-weight: 700;">
              🚀 Launch Stormwater & CN Facility Lab
            </button>
            <button class="btn" onclick="showAllProblems()" style="font-size: 0.95rem; padding: 0.65rem 1.25rem;">
              📚 View All Problems
            </button>
          </div>
        </div>
      `;
      return;
    }

    const isConsolidationSearch = rawQuery.includes('consolidation') || rawQuery.includes('surcharge') || rawQuery.includes('terzaghi') || rawQuery.includes('preload') || rawQuery.includes('pore water') || rawQuery.includes('isochrone');
    if (isConsolidationSearch) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; max-width: 700px; margin: 2rem auto; background: var(--bg-card); border: 2px solid #d97706; border-radius: var(--radius-md); padding: 2rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">⏳🚜</div>
          <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: #f59e0b;">NCEES § 3.3 & § 3.4 Time Rate of Consolidation & Soil Surcharge Lab</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
            Master 1-D Terzaghi consolidation, excess pore water pressure dissipation, single vs. double drainage, and soil surcharge preloading with live adjustable sliders for allowable time and soil weight!
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="if(window.ConsolidationCalculator) window.ConsolidationCalculator.open();" style="font-size: 0.95rem; padding: 0.65rem 1.4rem; background: linear-gradient(135deg, #b45309, #d97706); border: none; font-weight: 700; box-shadow: 0 2px 8px rgba(180, 83, 9, 0.35);">
              🚀 Launch Consolidation & Surcharge Lab
            </button>
            <button class="btn" onclick="showAllProblems()" style="font-size: 0.95rem; padding: 0.65rem 1.25rem;">
              📚 View All Problems
            </button>
          </div>
        </div>
      `;
      return;
    }

    const activeStatus = document.getElementById('statusFilterSelect').value;
    if (activeStatus === 'FAVORITES') {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">⭐</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Bookmarked Problems Yet</h3>
          <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
            You haven't bookmarked any problems yet. Click the star icon (☆) on any problem card to save it for quick review!
          </p>
          <button class="btn btn-primary" onclick="showAllProblems()" style="font-size: 0.95rem; padding: 0.6rem 1.25rem;">
            📚 Show All Problems
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍 No matching problems found</p>
          <p style="margin-bottom: 1.25rem;">Try clearing your search query or selecting a different topic filter.</p>
          <button class="btn btn-primary" onclick="showAllProblems()" style="font-size: 0.95rem; padding: 0.6rem 1.25rem;">
            📚 Reset All Filters & View All Problems
          </button>
        </div>
      `;
    }
    return;
  }

  // Prepend featured Civil Engineering Toolbox Card if matching query
  let featuredToolboxHtml = '';
  if (toolboxMatches.length > 0) {
    const topMatch = toolboxMatches[0];
    featuredToolboxHtml = `
      <div class="toolbox-featured-card">
        <div class="toolbox-featured-left">
          <span class="toolbox-featured-icon">${topMatch.icon}</span>
          <div>
            <h4 class="toolbox-featured-title">Civil Engineering Toolbox: ${topMatch.title}</h4>
            <p class="toolbox-featured-desc">
              Found ${toolboxMatches.length} matching interactive engineering module${toolboxMatches.length > 1 ? 's' : ''} with live SVG simulation, adjustable Safety Factors & NCEES equations.
            </p>
          </div>
        </div>
        <button class="toolbox-featured-btn" onclick="if(window.CivilToolbox) window.CivilToolbox.openModule('${topMatch.key}');">
          🛠️ Launch ${topMatch.title} Lab
        </button>
      </div>
    `;
  }

  grid.innerHTML = featuredToolboxHtml + filtered.map(p => {
    const isFav = !!userState.favorites[p.id];
    const status = userState.statuses[p.id] || 'UNATTEMPTED';
    const hasLocal = localVideosSet.has(`${p.id}.mp4`);

    let statusBadge = '';
    if (status === 'MASTERED') {
      statusBadge = '<span class="badge" style="background: var(--success-light); color: var(--success);">✅ Mastered</span>';
    } else if (status === 'REVIEW') {
      statusBadge = '<span class="badge" style="background: var(--warning-light); color: var(--warning);">⚠️ Review</span>';
    }

    const localBadge = hasLocal 
      ? '<span class="badge local-video" title="Offline MP4 Ready">⚡ Offline Ready</span>' 
      : '<span class="badge" title="Streams via YouTube">🎥 YouTube</span>';

    const playlists = p.playlists || [];
    const isBreadth = playlists.includes('Civil Breadth') || (p.problem_number >= 51 && p.problem_number <= 80);
    let playlistBadges = '';
    if (playlists.includes('Water Resources')) {
      playlistBadges += '<span class="badge wr-playlist" title="In Water Resources Playlist">💧 WR</span>';
    }
    if (playlists.includes('Environmental')) {
      playlistBadges += '<span class="badge env-playlist" title="In Environmental Playlist">🌱 Env</span>';
    }
    if (isBreadth) {
      playlistBadges += '<span class="badge breadth-playlist" title="In Civil Breadth Series">🏗️ Breadth</span>';
    }

    // Adaptive problem number badge that guarantees continuous 1 to 76, 1 to 65, or 1 to 30 numbering
    let displayBadge = p.display_number;
    if (activeSeries === 'Water Resources' && p.wr_number) {
      if (p.wr_number === p.problem_number) {
        displayBadge = `WR #${p.wr_number} of 76`;
      } else {
        displayBadge = `WR #${p.wr_number} of 76 (YT #${p.problem_number})`;
      }
    } else if (activeSeries === 'Environmental' && p.env_number) {
      displayBadge = `Env #${p.env_number} of 65 (YT #${p.problem_number})`;
    } else if (activeSeries === 'Civil Breadth') {
      const bNum = p.breadth_number || (p.problem_number - 50);
      displayBadge = `Breadth #${bNum} of 30 (YT #${p.problem_number})`;
    } else if (p.wr_number) {
      displayBadge = `Problem #${p.problem_number} (WR #${p.wr_number})`;
    } else if (isBreadth) {
      const bNum = p.breadth_number || (p.problem_number - 50);
      displayBadge = `Problem #${p.problem_number} (Breadth #${bNum})`;
    }

    return `
      <div class="problem-card-wrapper">
        <div class="problem-card" onclick="openProblemModal('${p.id}')">
          <div>
            <div class="card-top">
              <span class="prob-num-badge">${displayBadge}</span>
              <div class="card-badges">
                ${statusBadge}
                ${playlistBadges}
                <span class="badge category">${p.category}</span>
                ${localBadge}
              </div>
            </div>

            <h3 class="card-title">${escapeHtml(p.topic || p.title)}</h3>
            <p class="card-snippet">${escapeHtml(p.problem_statement || 'Click to view complete problem presentation.')}</p>
          </div>

          <div class="card-footer" onclick="event.stopPropagation()">
            <div class="card-meta">
              <span>⏱️ ${p.duration_formatted}</span>
              <span>•</span>
              <span>${p.solution_steps ? p.solution_steps.length : 0} Steps</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button 
                class="favorite-btn ${isFav ? 'active' : ''}" 
                title="${isFav ? 'Remove from bookmarks' : 'Bookmark problem'}"
                onclick="toggleFavorite('${p.id}', event)"
              >
                ${isFav ? '★' : '☆'}
              </button>
              <button class="btn btn-sm btn-primary" onclick="openProblemModal('${p.id}')">
                Solve & Video
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Modal View
function openProblemModal(problemIdOrObj) {
  const p = (typeof problemIdOrObj === 'object' && problemIdOrObj && problemIdOrObj.id) 
    ? problemIdOrObj 
    : allProblems.find(item => item.id === problemIdOrObj);
  if (!p) return;

  currentModalProblem = p;
  modalSolutionVisible = !practiceMode;

  // Update URL hash for easy bookmarking
  history.replaceState(null, null, `#problem-${p.problem_number}`);

  const modal = document.getElementById('problemModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Populate Header
  const activeSeriesTab = document.querySelector('.series-tab.active');
  const activeSeries = activeSeriesTab ? activeSeriesTab.dataset.series : 'ALL';
  let modalBadgeText = p.display_number;
  const isBreadth = (p.playlists || []).includes('Civil Breadth') || (p.problem_number >= 51 && p.problem_number <= 80);
  if (activeSeries === 'Water Resources' && p.wr_number) {
    modalBadgeText = p.wr_number === p.problem_number ? `WR #${p.wr_number} of 76` : `WR #${p.wr_number} of 76 (YT #${p.problem_number})`;
  } else if (activeSeries === 'Environmental' && p.env_number) {
    modalBadgeText = `Env #${p.env_number} of 65 (YT #${p.problem_number})`;
  } else if (activeSeries === 'Civil Breadth') {
    const bNum = p.breadth_number || (p.problem_number - 50);
    modalBadgeText = `Breadth #${bNum} of 30 (YT #${p.problem_number})`;
  } else if (p.wr_number) {
    modalBadgeText = `Problem #${p.problem_number} (WR #${p.wr_number})`;
  } else if (isBreadth) {
    const bNum = p.breadth_number || (p.problem_number - 50);
    modalBadgeText = `Problem #${p.problem_number} (Breadth #${bNum})`;
  }
  document.getElementById('modalProbNum').textContent = modalBadgeText;
  document.getElementById('modalCategory').textContent = p.category;
  document.getElementById('modalTitle').textContent = p.topic || p.title;

  // Status Selector
  const statusSelect = document.getElementById('modalStatusSelect');
  statusSelect.value = userState.statuses[p.id] || 'UNATTEMPTED';

  // Favorite button
  updateModalFavBtn(p.id);

  // Problem statement
  document.getElementById('modalStatement').textContent = p.problem_statement;

  // NCEES Search Terms
  const nceesContainer = document.getElementById('modalNceesTerms');
  if (p.ncees_search_terms && p.ncees_search_terms.length > 0) {
    nceesContainer.innerHTML = p.ncees_search_terms.map(term => 
      `<span class="ncees-tag">${escapeHtml(term)}</span>`
    ).join('');
  } else {
    nceesContainer.innerHTML = '<span class="ncees-tag">NCEES Reference Handbook - Water Resources</span>';
  }

  // If Problem #54 (Geotechnical Vertical Stress & House Load), link to the 50x50 Helical Pile Lab
  if (p.problem_number === 54) {
    nceesContainer.innerHTML += `
      <div style="margin-top: 0.75rem; width: 100%;">
        <button class="btn btn-sm btn-primary" onclick="HelicalCalculator.open();" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; font-weight: 700; padding: 0.5rem;">
          🏗️ Launch Interactive 50×50 Slab & Helical Pile Lab (Pore Pressure & SF Matrix)
        </button>
      </div>
    `;
  }

  // If Problem #46 (Detention Basin Capacity) or related detention/stormwater problem, link to the Stormwater & CN Lab
  if (p.problem_number === 46 || (p.topic && p.topic.toLowerCase().includes('detention'))) {
    nceesContainer.innerHTML += `
      <div style="margin-top: 0.75rem; width: 100%;">
        <button class="btn btn-sm btn-primary" onclick="if(window.StormwaterCalculator) window.StormwaterCalculator.open();" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: linear-gradient(135deg, #0284c7, #0d9488); border: none; font-weight: 700; padding: 0.5rem; box-shadow: 0 2px 8px rgba(13, 148, 136, 0.35);">
          🌧️ Launch Interactive Stormwater & CN Facility Sizing Lab (TR-55, Drawdown & Spillway)
        </button>
      </div>
    `;
  }

  // If Problem #130 (Consolidation & Surcharge Preload) or Problem #72 (Settlement Concept), link to Consolidation Lab
  if (p.problem_number === 130 || p.problem_number === 72 || (p.topic && p.topic.toLowerCase().includes('consolidation'))) {
    nceesContainer.innerHTML += `
      <div style="margin-top: 0.75rem; width: 100%;">
        <button class="btn btn-sm btn-primary" onclick="if(window.ConsolidationCalculator) window.ConsolidationCalculator.open();" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: linear-gradient(135deg, #b45309, #d97706); border: none; font-weight: 700; padding: 0.5rem; box-shadow: 0 2px 8px rgba(180, 83, 9, 0.35);">
          ⏳ Launch Interactive Consolidation & Surcharge Lab (Live Sliders: Time & Weight)
        </button>
      </div>
    `;
  }

  // Render Steps & Math
  renderModalSolutionSteps(p);

  // Final Answer & Takeaway
  document.getElementById('modalAnswerVal').textContent = p.final_answer || 'See step-by-step solution';
  document.getElementById('modalTakeawayText').textContent = p.key_takeaway || 'Pay careful attention to units and handbook formula assumptions.';

  // Video & Transcript
  loadVideoPlayer(p);
  renderTranscriptList(p);

  // Apply theater mode state
  const modalContainer = document.querySelector('.modal-container');
  if (modalContainer) {
    modalContainer.classList.toggle('theater-mode', !!userState.theaterMode);
  }
  const theaterBtn = document.getElementById('modalTheaterBtn');
  if (theaterBtn) {
    theaterBtn.textContent = userState.theaterMode ? '🗗 Standard View' : '⤢ Theater Mode';
    theaterBtn.classList.toggle('btn-primary', !!userState.theaterMode);
  }

  // Render LaTeX formulas if KaTeX auto-render is present
  triggerMathRender();
}

function renderModalSolutionSteps(p) {
  const container = document.getElementById('modalStepsContainer');
  const answerCard = document.getElementById('modalAnswerCard');
  const takeawayCard = document.getElementById('modalTakeawayCard');

  if (!modalSolutionVisible) {
    container.innerHTML = `
      <div class="solution-concealed">
        <div style="font-size: 2rem;">🔒</div>
        <h4 style="font-size: 1.1rem; font-weight: 700;">Practice Mode Active</h4>
        <p style="color: var(--text-secondary); max-width: 400px; font-size: 0.9rem;">
          Try solving this problem on paper first before reviewing the step-by-step solution!
        </p>
        <button class="btn btn-primary" onclick="toggleModalSolution()">
          👁️ Reveal Step-by-Step Solution
        </button>
      </div>
    `;
    answerCard.style.display = 'none';
    takeawayCard.style.display = 'none';
    return;
  }

  answerCard.style.display = 'flex';
  takeawayCard.style.display = 'block';

  if (!p.solution_steps || p.solution_steps.length === 0) {
    container.innerHTML = `
      <div class="step-card">
        <p>Detailed walkthrough provided in the synchronized video above.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = p.solution_steps.map(step => {
    const mathHtml = step.math_formula 
      ? `<div class="math-block" data-math="${escapeHtml(step.math_formula)}">\\[${step.math_formula}\\]</div>` 
      : '';

    return `
      <div class="step-card">
        <div class="step-top">
          <span class="step-title">${escapeHtml(step.title)}</span>
          <button class="timestamp-link" onclick="seekVideo('${step.timestamp}')" title="Jump video to this step">
            ⏱️ ${step.timestamp}
          </button>
        </div>
        ${mathHtml}
        <div class="step-explanation">${escapeHtml(step.explanation)}</div>
      </div>
    `;
  }).join('');
}

function toggleModalSolution() {
  modalSolutionVisible = !modalSolutionVisible;
  if (currentModalProblem) {
    renderModalSolutionSteps(currentModalProblem);
    triggerMathRender();
  }
}

function toggleTheaterMode() {
  const modalContainer = document.querySelector('.modal-container');
  if (!modalContainer) return;
  const isTheater = modalContainer.classList.toggle('theater-mode');
  userState.theaterMode = isTheater;
  saveUserState();
  const btn = document.getElementById('modalTheaterBtn');
  if (btn) {
    btn.textContent = isTheater ? '🗗 Standard View' : '⤢ Theater Mode';
    btn.classList.toggle('btn-primary', isTheater);
  }
}

function loadVideoPlayer(p) {
  const container = document.getElementById('videoContainer');
  const hasLocal = localVideosSet.has(`${p.id}.mp4`);

  // Default to highest resolution (youtube = 1080p HD) or local if explicitly selected
  const activeSrc = (currentVideoSource === 'youtube' || !hasLocal) ? 'youtube' : 'local';

  document.getElementById('srcLocalBtn').classList.toggle('active', activeSrc === 'local');
  document.getElementById('srcYoutubeBtn').classList.toggle('active', activeSrc === 'youtube');

  // Update direct YouTube 1080p link
  const ytLink = document.getElementById('modalYtDirectLink');
  if (ytLink) {
    ytLink.href = `https://www.youtube.com/watch?v=${p.id}&vq=hd1080`;
  }

  // Update video quality badge
  const qualityBadge = document.getElementById('videoQualityBadge');
  if (qualityBadge) {
    if (activeSrc === 'youtube') {
      qualityBadge.textContent = '🎯 1080p Full HD';
      qualityBadge.style.background = 'rgba(34, 197, 94, 0.15)';
      qualityBadge.style.color = '#22c55e';
    } else {
      const isBreadth52 = p.problem_number === 52;
      qualityBadge.textContent = isBreadth52 ? '🎯 1080p Local HD' : '⚡ 360p Local SD';
      qualityBadge.style.background = isBreadth52 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)';
      qualityBadge.style.color = isBreadth52 ? '#22c55e' : '#eab308';
    }
  }

  if (activeSrc === 'local') {
    container.innerHTML = `
      <video id="activeVideoPlayer" controls autoplay playsinline style="width:100%; height:100%;">
        <source src="/videos/${p.id}.mp4" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>
    `;
    setupVideoPlayerListeners();
  } else {
    container.innerHTML = `
      <iframe 
        id="activeYtPlayer"
        src="https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&enablejsapi=1&rel=0&vq=hd1080&highres=1" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
    setupYoutubePlayerQuality();
  }
}

function setupYoutubePlayerQuality() {
  const iframe = document.getElementById('activeYtPlayer');
  if (!iframe) return;
  iframe.onload = () => {
    try {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setPlaybackQuality',
        args: ['hd1080']
      }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setPlaybackQualityRange',
        args: ['hd1080', 'highres']
      }), '*');
    } catch (e) {}
  };
}

function setupVideoPlayerListeners() {
  const vid = document.getElementById('activeVideoPlayer');
  if (!vid) return;

  vid.addEventListener('timeupdate', () => {
    highlightTranscriptLine(vid.currentTime);
  });
}

function seekVideo(timeStr) {
  const parts = timeStr.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  const localVid = document.getElementById('activeVideoPlayer');
  if (localVid) {
    localVid.currentTime = seconds;
    localVid.play();
  } else {
    // For iframe, reload with start parameter and 1080p vq
    if (currentModalProblem) {
      const container = document.getElementById('videoContainer');
      container.innerHTML = `
        <iframe 
          id="activeYtPlayer"
          src="https://www.youtube-nocookie.com/embed/${currentModalProblem.id}?autoplay=1&start=${Math.floor(seconds)}&enablejsapi=1&rel=0&vq=hd1080&highres=1" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
      setupYoutubePlayerQuality();
    }
  }
}

function renderTranscriptList(p) {
  const list = document.getElementById('transcriptList');
  if (!p.segments || p.segments.length === 0) {
    list.innerHTML = `<p style="padding: 1rem; color: var(--text-muted);">No transcript available for this video.</p>`;
    return;
  }

  list.innerHTML = p.segments.map((seg, idx) => `
    <div class="transcript-item" id="trans-seg-${idx}" onclick="seekVideo('${seg.timestamp}')">
      <span class="timestamp-link">${seg.timestamp}</span>
      <span>${escapeHtml(seg.text)}</span>
    </div>
  `).join('');
}

function highlightTranscriptLine(currentTime) {
  if (!currentModalProblem || !currentModalProblem.segments) return;
  const segs = currentModalProblem.segments;

  let activeIdx = -1;
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].start_seconds <= currentTime) {
      activeIdx = i;
    } else {
      break;
    }
  }

  if (activeIdx !== -1) {
    document.querySelectorAll('.transcript-item.active-line').forEach(el => el.classList.remove('active-line'));
    const target = document.getElementById(`trans-seg-${activeIdx}`);
    if (target) {
      target.classList.add('active-line');
      target.style.background = 'var(--primary-light)';
    }
  }
}

function closeProblemModal() {
  const modal = document.getElementById('problemModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';

  // Stop video playback
  const container = document.getElementById('videoContainer');
  container.innerHTML = '';
  currentModalProblem = null;

  // Restore bookmark hash if currently filtering by favorites, otherwise clear
  const activeStatus = document.getElementById('statusFilterSelect').value;
  if (activeStatus === 'FAVORITES') {
    history.replaceState(null, null, '#bookmarks');
  } else {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
}

function toggleFavorite(problemId, event) {
  if (event) event.stopPropagation();
  userState.favorites[problemId] = !userState.favorites[problemId];
  saveUserState();
  renderProblemGrid();
  if (currentModalProblem && currentModalProblem.id === problemId) {
    updateModalFavBtn(problemId);
  }
}

function updateModalFavBtn(problemId) {
  const btn = document.getElementById('modalFavBtn');
  const isFav = !!userState.favorites[problemId];
  btn.textContent = isFav ? '★ Favorited' : '☆ Bookmark';
  btn.classList.toggle('btn-primary', isFav);
}

function triggerMathRender() {
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(document.getElementById('modalStepsContainer'), {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn('KaTeX rendering error', e);
    }
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  userState.theme = theme;
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
  saveUserState();
}

function copyCurrentSolution() {
  if (!currentModalProblem) return;
  const p = currentModalProblem;

  let text = `# ${p.display_number}: ${p.topic || p.title}\n`;
  text += `Category: ${p.category} | Duration: ${p.duration_formatted}\n\n`;
  text += `## Problem Statement\n${p.problem_statement}\n\n`;
  text += `## NCEES Search Terms\n${(p.ncees_search_terms || []).join(', ')}\n\n`;
  text += `## Step-by-Step Solution\n`;
  (p.solution_steps || []).forEach(s => {
    text += `### ${s.title} [${s.timestamp}]\n`;
    if (s.math_formula) text += `Formula: ${s.math_formula}\n`;
    text += `${s.explanation}\n\n`;
  });
  text += `## Final Answer\n${p.final_answer}\n\n`;
  text += `## Key Takeaway\n${p.key_takeaway}\n\n`;
  text += `Video: ${p.youtube_url}\n`;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copySolutionBtn');
    const orig = btn.textContent;
    btn.textContent = '✅ Copied to Clipboard!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

function navigateProblem(direction) {
  if (!currentModalProblem) return;
  const filtered = getFilteredProblems();
  const currentIndex = filtered.findIndex(p => p.id === currentModalProblem.id);
  if (currentIndex === -1) return;

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = filtered.length - 1;
  if (newIndex >= filtered.length) newIndex = 0;

  openProblemModal(filtered[newIndex].id);
}

// Event Listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    renderProblemGrid();
  });

  // Shortcut key '/'
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !document.getElementById('problemModal').classList.contains('open')) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape') {
      closeProblemModal();
    } else if (document.getElementById('problemModal').classList.contains('open')) {
      if (e.key === 'ArrowLeft') navigateProblem(-1);
      if (e.key === 'ArrowRight') navigateProblem(1);
    }
  });

  // Series / Playlist tabs
  const seriesContainer = document.getElementById('seriesTabContainer');
  if (seriesContainer) {
    seriesContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.series-tab');
      if (tab) {
        document.querySelectorAll('.series-tab').forEach(b => b.classList.remove('active'));
        tab.classList.add('active');
        renderProblemGrid();
      }
    });
  }

  // Topic filter pills
  document.getElementById('topicFilterContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-pill')) {
      document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      renderProblemGrid();
    }
  });

  // Status & Sort selects
  document.getElementById('statusFilterSelect').addEventListener('change', renderProblemGrid);
  document.getElementById('sortSelect').addEventListener('change', renderProblemGrid);

  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const nextTheme = userState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Practice mode global toggle
  const practiceBtn = document.getElementById('practiceModeGlobalBtn');
  practiceBtn.addEventListener('click', () => {
    practiceMode = !practiceMode;
    document.getElementById('practiceStatusText').textContent = practiceMode ? 'ON' : 'OFF';
    practiceBtn.classList.toggle('btn-primary', practiceMode);
    if (currentModalProblem) {
      modalSolutionVisible = !practiceMode;
      renderModalSolutionSteps(currentModalProblem);
      triggerMathRender();
    }
  });

  // Modal close
  document.getElementById('modalCloseBtn').addEventListener('click', closeProblemModal);
  document.getElementById('problemModal').addEventListener('click', (e) => {
    if (e.target.id === 'problemModal') closeProblemModal();
  });

  // Modal status change
  document.getElementById('modalStatusSelect').addEventListener('change', (e) => {
    if (currentModalProblem) {
      userState.statuses[currentModalProblem.id] = e.target.value;
      saveUserState();
      renderProblemGrid();
    }
  });

  // Modal favorite button
  document.getElementById('modalFavBtn').addEventListener('click', () => {
    if (currentModalProblem) {
      toggleFavorite(currentModalProblem.id);
    }
  });

  // Toggle modal solution
  document.getElementById('toggleModalSolutionBtn').addEventListener('click', toggleModalSolution);

  // Default quality selector in sub-controls
  const qualitySelect = document.getElementById('defaultQualitySelect');
  if (qualitySelect) {
    qualitySelect.value = userState.preferredVideoSource || 'youtube-hd';
    qualitySelect.addEventListener('change', (e) => {
      userState.preferredVideoSource = e.target.value;
      currentVideoSource = e.target.value === 'local' ? 'local' : 'youtube';
      saveUserState();
      if (currentModalProblem) {
        loadVideoPlayer(currentModalProblem);
      }
    });
  }

  // Theater Mode button in modal header
  const theaterBtn = document.getElementById('modalTheaterBtn');
  if (theaterBtn) {
    theaterBtn.addEventListener('click', toggleTheaterMode);
  }

  // Video source buttons
  document.getElementById('srcLocalBtn').addEventListener('click', () => {
    currentVideoSource = 'local';
    userState.preferredVideoSource = 'local';
    if (qualitySelect) qualitySelect.value = 'local';
    saveUserState();
    if (currentModalProblem) loadVideoPlayer(currentModalProblem);
  });
  document.getElementById('srcYoutubeBtn').addEventListener('click', () => {
    currentVideoSource = 'youtube';
    userState.preferredVideoSource = 'youtube-hd';
    if (qualitySelect) qualitySelect.value = 'youtube-hd';
    saveUserState();
    if (currentModalProblem) loadVideoPlayer(currentModalProblem);
  });

  // Speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      const vid = document.getElementById('activeVideoPlayer');
      if (vid) vid.playbackRate = speed;
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
    });
  });

  // Transcript filter
  document.getElementById('transcriptSearchInput').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.transcript-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
    });
  });

  // Modal navigation
  document.getElementById('prevProbBtn').addEventListener('click', () => navigateProblem(-1));
  document.getElementById('nextProbBtn').addEventListener('click', () => navigateProblem(1));
  document.getElementById('copySolutionBtn').addEventListener('click', copyCurrentSolution);

  // Bookmark direct link copier
  const copyBookmarkBtn = document.getElementById('modalCopyBookmarkBtn');
  if (copyBookmarkBtn) {
    copyBookmarkBtn.addEventListener('click', () => {
      if (!currentModalProblem) return;
      const url = `${window.location.origin}/#problem-${currentModalProblem.problem_number}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          const orig = copyBookmarkBtn.textContent;
          copyBookmarkBtn.textContent = '✓ Link Copied!';
          copyBookmarkBtn.classList.add('btn-primary');
          setTimeout(() => {
            copyBookmarkBtn.textContent = orig;
            copyBookmarkBtn.classList.remove('btn-primary');
          }, 2000);
        }).catch(() => {
          prompt('Copy bookmark URL:', url);
        });
      } else {
        prompt('Copy bookmark URL:', url);
      }
    });
  }

  // Start with Bookmarks toggle
  const bookmarkToggleBtn = document.getElementById('startWithBookmarkToggle');
  if (bookmarkToggleBtn) {
    bookmarkToggleBtn.addEventListener('click', () => {
      userState.startWithBookmarks = !userState.startWithBookmarks;
      saveUserState();
      updateStartWithBookmarkBtn();
      if (userState.startWithBookmarks) {
        document.getElementById('statusFilterSelect').value = 'FAVORITES';
        window.location.hash = '#bookmarks';
      } else {
        if (window.location.hash === '#bookmarks' || window.location.hash === '#favorites') {
          history.replaceState(null, null, window.location.pathname + window.location.search);
        }
      }
      renderProblemGrid();
    });
  }

  // Interactive stat pills
  const statFavsPill = document.getElementById('statFavsPill');
  if (statFavsPill) {
    statFavsPill.addEventListener('click', () => {
      window.location.hash = '#bookmarks';
      document.getElementById('statusFilterSelect').value = 'FAVORITES';
      renderProblemGrid();
    });
  }

  const statMasteredPill = document.getElementById('statMasteredPill');
  if (statMasteredPill) {
    statMasteredPill.addEventListener('click', () => {
      document.getElementById('statusFilterSelect').value = 'MASTERED';
      renderProblemGrid();
    });
  }

  const statReviewPill = document.getElementById('statReviewPill');
  if (statReviewPill) {
    statReviewPill.addEventListener('click', () => {
      document.getElementById('statusFilterSelect').value = 'REVIEW';
      renderProblemGrid();
    });
  }

  const statTotalPill = document.getElementById('statTotalPill');
  if (statTotalPill) {
    statTotalPill.addEventListener('click', () => {
      document.getElementById('statusFilterSelect').value = 'ALL';
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      const allTopic = document.querySelector('.filter-pill[data-topic="ALL"]');
      if (allTopic) allTopic.classList.add('active');
      document.querySelectorAll('.series-tab').forEach(t => t.classList.remove('active'));
      const allTab = document.querySelector('.series-tab[data-series="ALL"]');
      if (allTab) allTab.classList.add('active');
      history.replaceState(null, null, window.location.pathname + window.location.search);
      renderProblemGrid();
    });
  }

  // Handle URL hash changes dynamically
  window.addEventListener('hashchange', () => {
    applyBookmarkUrlOrPreference();
    renderProblemGrid();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.showAllProblems = function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const statusSelect = document.getElementById('statusFilterSelect');
  if (statusSelect) statusSelect.value = 'ALL';

  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  const allTopic = document.querySelector('.filter-pill[data-topic="ALL"]');
  if (allTopic) allTopic.classList.add('active');

  document.querySelectorAll('.series-tab').forEach(t => t.classList.remove('active'));
  const allTab = document.querySelector('.series-tab[data-series="ALL"]');
  if (allTab) allTab.classList.add('active');

  userState.startWithBookmarks = false;
  saveUserState();
  updateStartWithBookmarkBtn();

  history.replaceState(null, null, window.location.pathname);
  renderProblemGrid();
};

document.addEventListener('DOMContentLoaded', initApp);
