
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

  filterPanels.forEach(function (panel) {
    var section = panel.parentElement;
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
    var input = panel.querySelector('.search-input');
    var year = panel.querySelector('.year-filter');
    var type = panel.querySelector('.type-filter');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var visible = true;

        if (q && text.indexOf(q) === -1) {
          visible = false;
        }

        if (y && cardYear !== y) {
          visible = false;
        }

        if (t && cardType.indexOf(t) === -1) {
          visible = false;
        }

        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }

    if (type) {
      type.addEventListener('change', applyFilter);
    }
  });
})();
