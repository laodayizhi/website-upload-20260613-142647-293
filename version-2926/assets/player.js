(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !sourceUrl) {
      return;
    }
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
