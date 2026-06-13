(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';

            if (!value) {
                event.preventDefault();
                return;
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty]');

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var selectedType = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var cardType = card.getAttribute('data-type') || '';
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedType = !selectedType || cardType === selectedType;
            var matched = matchedKeyword && matchedType;

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
})();
