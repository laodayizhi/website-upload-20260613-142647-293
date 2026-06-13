import { H as Hls } from './video-player-bbsaiqh1.js';

const prefix = window.SITE_PREFIX || document.body.dataset.prefix || '';

function resolveUrl(url) {
  if (!url) {
    return '#';
  }
  if (/^(https?:)?\/\//.test(url) || url.startsWith('#')) {
    return url;
  }
  return prefix + url.replace(/^\//, '');
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function setupMobileMenu() {
  const button = document.querySelector('.js-menu-toggle');
  const menu = document.querySelector('.js-mobile-nav');
  if (!button || !menu) {
    return;
  }
  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector('.js-hero-carousel');
  if (!carousel) {
    return;
  }
  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  if (slides.length <= 1) {
    return;
  }
  let activeIndex = 0;
  let timer = null;

  const activate = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => activate(activeIndex + 1), 6000);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      activate(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
  carousel.addEventListener('mouseleave', start);
  start();
}

function setupSearchForms() {
  const forms = Array.from(document.querySelectorAll('.js-site-search'));
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
  if (!forms.length || !movies.length) {
    return;
  }

  forms.forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    const panel = form.querySelector('.js-search-results');
    if (!input || !panel) {
      return;
    }

    const render = () => {
      const query = normalizeText(input.value);
      if (query.length < 1) {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
      }

      const results = movies
        .filter((movie) => {
          const haystack = normalizeText([
            movie.title,
            movie.category,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            (movie.tags || []).join(' ')
          ].join(' '));
          return haystack.includes(query);
        })
        .sort((a, b) => Number(b.heat || 0) - Number(a.heat || 0))
        .slice(0, 12);

      if (!results.length) {
        panel.hidden = false;
        panel.innerHTML = '<div class="search-empty">没有找到匹配影片，可进入全部片库继续筛选。</div>';
        return;
      }

      panel.hidden = false;
      panel.innerHTML = results.map((movie) => `
        <a class="search-item" href="${resolveUrl(movie.url)}">
          <img src="${resolveUrl(movie.cover)}" alt="${movie.title}">
          <span>
            <strong>${movie.title}</strong>
            <span>${movie.year} · ${movie.region} · ${movie.category}</span>
          </span>
        </a>
      `).join('');
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', (event) => {
      if (!form.contains(event.target)) {
        panel.hidden = true;
      }
    });
  });
}

function setupMovieFilters() {
  const panel = document.querySelector('.js-filter-panel');
  const list = document.querySelector('.js-movie-list');
  if (!panel || !list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('.js-movie-card'));
  const search = panel.querySelector('.js-filter-search');
  const category = panel.querySelector('.js-filter-category');
  const type = panel.querySelector('.js-filter-type');
  const year = panel.querySelector('.js-filter-year');
  const count = panel.querySelector('.js-filter-count');
  const reset = panel.querySelector('.js-filter-reset');

  const apply = () => {
    const query = normalizeText(search.value);
    const categoryValue = category.value;
    const typeValue = type.value;
    const yearValue = year.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = normalizeText([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre
      ].join(' '));
      const matchesQuery = !query || text.includes(query);
      const matchesCategory = !categoryValue || card.dataset.category === categoryValue;
      const matchesType = !typeValue || card.dataset.type === typeValue;
      const matchesYear = !yearValue || card.dataset.year === yearValue;
      const visible = matchesQuery && matchesCategory && matchesType && matchesYear;
      card.classList.toggle('is-hidden', !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (count) {
      count.textContent = String(visibleCount);
    }
  };

  [search, category, type, year].forEach((control) => {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });

  if (reset) {
    reset.addEventListener('click', () => {
      search.value = '';
      category.value = '';
      type.value = '';
      year.value = '';
      apply();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && search) {
    search.value = q;
  }
  apply();
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('.js-player'));
  players.forEach((player) => {
    const video = player.querySelector('.js-video-player');
    const button = player.querySelector('.js-play-button');
    const message = player.querySelector('.js-player-message');
    if (!video || !button) {
      return;
    }

    const source = video.dataset.hls;
    let hlsInstance = null;
    let initialized = false;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    const initialize = () => {
      if (initialized) {
        return;
      }
      initialized = true;
      video.controls = true;

      if (!source) {
        setMessage('当前影片未找到播放源。');
        return;
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('播放源已就绪。');
        });
        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            setMessage('播放加载失败，请稍后重试。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('播放源已就绪。');
      } else {
        setMessage('当前浏览器不支持该视频格式。');
      }
    };

    button.addEventListener('click', async () => {
      initialize();
      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (_error) {
        setMessage('点击视频控件可继续播放。');
      }
    });

    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
    video.addEventListener('ended', () => player.classList.remove('is-playing'));
  });
}

setupMobileMenu();
setupHeroCarousel();
setupSearchForms();
setupMovieFilters();
setupPlayers();
