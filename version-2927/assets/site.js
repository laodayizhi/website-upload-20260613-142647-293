(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function bindHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
    inputs.forEach(function (input) {
      var scope = input.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('[data-empty-tip]');
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        var visibleCount = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var visible = !keyword || haystack.indexOf(keyword) >= 0;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visibleCount === 0);
        }
      });
    });
  }

  window.initMoviePlayer = function (playlistUrl) {
    var video = document.getElementById('moviePlayer');
    var layer = document.getElementById('playLayer');
    var button = document.getElementById('playButton');
    if (!video || !playlistUrl) {
      return;
    }

    function hideLayer() {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    }

    function showLayer() {
      if (layer) {
        layer.classList.remove('is-hidden');
      }
    }

    function startPlayback() {
      hideLayer();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showLayer();
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlistUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(playlistUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = playlistUrl;
    }

    if (layer) {
      layer.addEventListener('click', startPlayback);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    video.addEventListener('play', hideLayer);
    video.addEventListener('pause', function () {
      if (!video.ended) {
        showLayer();
      }
    });
    video.addEventListener('ended', showLayer);
  };

  ready(function () {
    bindNavigation();
    bindHero();
    bindSearch();
  });
})();
