(function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var ready = false;
        var hls = null;

        function prepare() {
            if (!video || ready || !stream) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        }

        function playVideo() {
            if (!video) {
                return;
            }

            prepare();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                box.classList.remove('is-playing');
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
