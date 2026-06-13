(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
        showSlide(next);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterList = document.querySelector("[data-filter-list]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (filterInput && filterList) {
    var queryName = filterInput.getAttribute("data-url-query");
    if (queryName) {
      var params = new URLSearchParams(window.location.search);
      var urlValue = params.get(queryName);
      if (urlValue) {
        filterInput.value = urlValue;
      }
    }

    var items = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    function applyFilter() {
      var value = filterInput.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var haystack = (item.getAttribute("data-search") || item.textContent).toLowerCase();
        var visible = !value || haystack.indexOf(value) !== -1;
        item.classList.toggle("is-hidden-card", !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("show", shown === 0);
      }
    }

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }
})();

function initMoviePlayer(videoId, playButtonId, streamUrl) {
  var video = document.getElementById(videoId);
  var playButton = document.getElementById(playButtonId);
  var hlsInstance = null;
  var started = false;

  if (!video || !playButton || !streamUrl) {
    return;
  }

  function beginPlayback() {
    if (started) {
      video.play();
      return;
    }

    started = true;
    playButton.classList.add("is-hidden");
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play();
      return;
    }

    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      hlsInstance.on(Hls.Events.ERROR, function () {
        if (!video.src) {
          video.src = streamUrl;
          video.play();
        }
      });
      return;
    }

    video.src = streamUrl;
    video.play();
  }

  playButton.addEventListener("click", beginPlayback);
  video.addEventListener("click", beginPlayback);

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
