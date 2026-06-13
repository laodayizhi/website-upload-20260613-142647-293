
(function () {
  var video = document.getElementById('moviePlayer');
  var startButton = document.getElementById('startPlayer');
  var cover = document.querySelector('.player-cover');
  var hls = null;
  var attached = false;
  var source = typeof playerSource === 'string' ? playerSource : '';

  if (!video || !source) {
    return;
  }

  function playVideo() {
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = source;
    }
  }

  function start() {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    playVideo();
  }

  if (startButton) {
    startButton.addEventListener('click', start);
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!attached) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
