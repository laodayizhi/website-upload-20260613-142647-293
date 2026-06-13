(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
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

  function autoPlay() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      autoPlay();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      autoPlay();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      autoPlay();
    });
  });

  autoPlay();

  var searchInput = document.querySelector('.js-search');
  var yearSelect = document.querySelector('.js-year');
  var typeSelect = document.querySelector('.js-type');
  var regionSelect = document.querySelector('.js-region');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function filterCards() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';

    cards.forEach(function (card) {
      var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-category'));
      var keep = true;

      if (keyword && text.indexOf(keyword) === -1) {
        keep = false;
      }

      if (year && card.getAttribute('data-year') !== year) {
        keep = false;
      }

      if (type && card.getAttribute('data-type') !== type) {
        keep = false;
      }

      if (region && card.getAttribute('data-region') !== region) {
        keep = false;
      }

      card.classList.toggle('is-hidden', !keep);
    });
  }

  [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (node) {
    if (node) {
      node.addEventListener('input', filterCards);
      node.addEventListener('change', filterCards);
    }
  });
})();
