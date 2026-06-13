(function () {
  window.initMoviePlayer = function (src) {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('playerCover');
    var ready = false;
    var hls = null;

    if (!video || !cover || !src) {
      return;
    }

    function bindVideo() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function startPlay() {
      bindVideo();
      cover.classList.add('is-hidden');
      var playAction = video.play();

      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', startPlay);

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        cover.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
