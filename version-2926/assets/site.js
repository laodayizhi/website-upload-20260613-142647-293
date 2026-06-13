(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      }, { once: true });
    });
  }

  function setupFilters() {
    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var buttons = scope.querySelectorAll("[data-filter-value]");
      var cards = scope.querySelectorAll("[data-card]");
      var empty = scope.querySelector("[data-empty-result]");
      var activeValue = "";

      function apply() {
        var query = normalize(input ? input.value : "");
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var okText = !query || haystack.indexOf(query) !== -1;
          var okButton = !activeValue || haystack.indexOf(activeValue) !== -1;
          var visible = okText && okButton;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeValue = normalize(button.getAttribute("data-filter-value"));
          apply();
        });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupImages();
    setupFilters();
    setupHero();
  });
})();
