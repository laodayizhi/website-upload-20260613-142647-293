(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot') || '0');
                showSlide(nextIndex);
                startAutoPlay();
            });
        });

        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters(scope) {
        var input = scope.querySelector('[data-card-filter]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var regionSelect = scope.querySelector('[data-region-filter]');
        var list = document.querySelector('[data-card-list]');
        var emptyHint = document.querySelector('[data-empty-hint]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.children);

        function getSearchText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var year = normalize(yearSelect && yearSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var searchText = getSearchText(card);
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchesYear = !year || cardYear === year;
                var matchesRegion = !region || cardRegion === region;
                var shouldShow = matchesKeyword && matchesYear && matchesRegion;

                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visibleCount += 1;
                }
            });

            if (emptyHint) {
                emptyHint.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        if (regionSelect) {
            regionSelect.addEventListener('change', applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        if (input && input.hasAttribute('data-autofocus-query') && query) {
            input.focus();
        }

        applyFilter();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(initFilters);

    function loadHlsScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector('script[data-hls-dynamic]');

        if (existing) {
            existing.addEventListener('load', callback);
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-dynamic', 'true');
        script.addEventListener('load', callback);
        document.head.appendChild(script);
    }

    function initPlayer(wrap) {
        var video = wrap.querySelector('video[data-src]');
        var playButton = wrap.querySelector('[data-play-button]');
        var message = wrap.querySelector('[data-player-message]');
        var initialized = false;
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function attachSource(done) {
            var source = video.getAttribute('data-src');

            if (!source) {
                setMessage('当前影片暂未提供播放地址。');
                return;
            }

            if (initialized) {
                done();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                initialized = true;
                done();
                return;
            }

            loadHlsScript(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        initialized = true;
                        done();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载失败，请刷新页面或更换浏览器。');
                        }
                    });
                } else {
                    video.src = source;
                    initialized = true;
                    setMessage('浏览器可能不支持 HLS，已尝试直接加载播放源。');
                    done();
                }
            });
        }

        function playVideo() {
            setMessage('正在加载播放源...');
            attachSource(function () {
                var playPromise = video.play();
                wrap.classList.add('is-playing');
                setMessage('');

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('浏览器阻止了自动播放，请使用播放器控件再次点击播放。');
                        wrap.classList.remove('is-playing');
                    });
                }
            });
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            wrap.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                wrap.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player-wrap]').forEach(initPlayer);
}());
