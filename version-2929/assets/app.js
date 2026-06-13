(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

        if (slides.length > 1) {
            var activeIndex = 0;

            function setSlide(index) {
                activeIndex = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === activeIndex);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === activeIndex);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    setSlide(index);
                });
            });

            setInterval(function () {
                setSlide(activeIndex + 1);
            }, 6200);
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var container = scope.parentElement || document;
            var items = Array.prototype.slice.call(container.querySelectorAll("[data-filter-item]"));
            var empty = container.querySelector("[data-no-results]");
            var buttonValue = "all";

            function update() {
                var query = normalizeText(input ? input.value : "");
                var shown = 0;

                items.forEach(function (item) {
                    var text = normalizeText(item.getAttribute("data-filter-text") || item.textContent);
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesButton = buttonValue === "all" || text.indexOf(normalizeText(buttonValue)) !== -1;
                    var visible = matchesQuery && matchesButton;

                    item.classList.toggle("hidden-by-filter", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            if (input) {
                input.addEventListener("input", update);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttonValue = button.getAttribute("data-filter-button") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    update();
                });
            });

            update();
        });
    });
})();

function setupMoviePlayer(videoUrl) {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playerOverlay");

        if (!video || !overlay || !videoUrl) {
            return;
        }

        var loaded = false;
        var hlsInstance = null;

        function attachAndPlay() {
            if (!loaded) {
                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(videoUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = videoUrl;
                }
            }

            overlay.classList.add("is-hidden");
            video.controls = true;
            video.play().catch(function () {});
        }

        overlay.addEventListener("click", attachAndPlay);
        video.addEventListener("click", function () {
            if (!loaded) {
                attachAndPlay();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
}
