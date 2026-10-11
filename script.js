/* =========================================================
   script.js — jQuery interactions for the personal site
   Features: mobile nav, active link, smooth scroll, theme
   toggle, scroll progress, back-to-top, fade-in on scroll,
   animated skill bars, counters, typed text, chess board,
   live age calculation, print buttons.
   ========================================================= */

$(function () {
  var $win = $(window);

  /* ---------- 1. Theme (saved in localStorage) ---------- */
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("sk-theme"); } catch (e) {}
  if (savedTheme === "dark") {
    $("html").attr("data-theme", "dark");
    $(".theme-toggle").text("☀");
  }

  $(".theme-toggle").on("click", function () {
    var isDark = $("html").attr("data-theme") === "dark";
    if (isDark) {
      $("html").removeAttr("data-theme");
      $(this).text("☾");
    } else {
      $("html").attr("data-theme", "dark");
      $(this).text("☀");
    }
    try { localStorage.setItem("sk-theme", isDark ? "light" : "dark"); } catch (e) {}
  });

  /* ---------- 2. Mobile navigation toggle ---------- */
  $(".nav-toggle").on("click", function () {
    var open = !$(this).hasClass("open");
    $(this).toggleClass("open", open).attr("aria-expanded", open);
    $(".main-nav").toggleClass("open", open);
  });

  $(".main-nav a").on("click", function () {
    $(".nav-toggle").removeClass("open").attr("aria-expanded", false);
    $(".main-nav").removeClass("open");
  });

  /* ---------- 3. Highlight the active page link ---------- */
  var page = window.location.pathname.split("/").pop() || "index.html";
  $(".nav-link").each(function () {
    if ($(this).attr("href") === page) $(this).addClass("active");
  });

  /* ---------- 4. Smooth scrolling for in-page anchors ---------- */
  $('a[href^="#"]').on("click", function (e) {
    var target = $(this.getAttribute("href"));
    if (target.length) {
      e.preventDefault();
      $("html, body").animate({ scrollTop: target.offset().top - 84 }, 700);
    }
  });

  /* ---------- 5. Scroll progress bar + back-to-top ---------- */
  $("body").append('<div class="progress-bar"></div><button class="to-top" aria-label="Back to top">↑</button>');

  $(".to-top").on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
  });

  function onScroll() {
    var st = $win.scrollTop();
    var max = $(document).height() - $win.height();
    $(".progress-bar").css("width", (max > 0 ? (st / max) * 100 : 0) + "%");
    $(".to-top").toggleClass("show", st > 400);
    revealOnScroll();
  }

  /* ---------- 6. Fade-in reveal + skill bars + counters ---------- */
  function inView($el, offset) {
    var top = $el.offset().top;
    var viewBottom = $win.scrollTop() + $win.height();
    return top < viewBottom - (offset || 70);
  }

  function animateCounter($el) {
    if ($el.data("done")) return;
    $el.data("done", true);
    var end = parseFloat($el.data("count"));
    var decimals = ($el.data("count") + "").indexOf(".") > -1 ? ($el.data("count") + "").split(".")[1].length : 0;
    var suffix = $el.data("suffix") || "";
    $({ n: 0 }).animate({ n: end }, {
      duration: 1600,
      easing: "swing",
      step: function (now) { $el.text(now.toFixed(decimals) + suffix); },
      complete: function () { $el.text(end.toFixed(decimals) + suffix); }
    });
  }

  function revealOnScroll() {
    $(".reveal:not(.in)").each(function () {
      if (inView($(this))) $(this).addClass("in");
    });

    $(".skill-fill").each(function () {
      var $bar = $(this);
      if (!$bar.data("done") && inView($bar, 40)) {
        $bar.data("done", true);
        $bar.css("width", $bar.data("level") + "%");
        $bar.closest(".skill").find(".pct").text($bar.data("level") + "%");
      }
    });

    $("[data-count]").each(function () {
      if (inView($(this), 40)) animateCounter($(this));
    });
  }

  $win.on("scroll resize", onScroll);
  onScroll();

  /* ---------- 7. Typed text effect (home page) ---------- */
  var $typed = $("#typed");
  if ($typed.length) {
    var phrases = [
      "CSE student · RV Institution of Technology",
      "Java & C++ problem solver",
      "Chess player · Trader in the making",
      "Building things, one commit at a time"
    ];
    var p = 0, c = 0, deleting = false;

    (function tick() {
      var word = phrases[p];
      c += deleting ? -1 : 1;
      $typed.text(word.substring(0, c));

      var delay = deleting ? 35 : 70;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- 8. Chessboard motif (home page) ---------- */
  var $board = $("#board");
  if ($board.length) {
    var layout = [
      "♜♞♝♛♚♝♞♜",
      "♟♟♟♟♟♟♟♟",
      "        ",
      "        ",
      "        ",
      "        ",
      "♙♙♙♙♙♙♙♙",
      "♖♘♗♕♔♗♘♖"
    ];
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var ch = layout[r].charAt(f);
        var shade = (r + f) % 2 === 0 ? "light" : "dark";
        var $sq = $("<div>").addClass("sq " + shade).text(ch.trim());
        if (ch.trim()) $sq.addClass("piece");
        $board.append($sq);
      }
    }

    var $selected = null;
    $board.on("click", ".sq", function () {
      var $sq = $(this);
      if ($selected && !$sq.hasClass("piece")) {
        $sq.text($selected.text()).addClass("piece");
        $selected.text("").removeClass("piece");
        $selected = null;
        $(".board-tag").text("Nice move ♟");
      } else if ($sq.hasClass("piece")) {
        $selected = $sq;
        $(".board-tag").text("Now pick an empty square");
      }
    });
  }

  /* ---------- 9. Live age from date of birth (bio-data) ---------- */
  var $age = $("#age");
  if ($age.length) {
    var dob = new Date($age.data("dob"));
    var today = new Date();
    var years = today.getFullYear() - dob.getFullYear();
    var m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
    $age.text(years + " years");
  }

  /* ---------- 10. Print buttons ---------- */
  $(".print-btn").on("click", function () { window.print(); });

  /* ---------- 11. Copy-to-clipboard for contact items ---------- */
  $(".copyable").on("click", function () {
    var $el = $(this);
    var text = $el.data("copy");
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).then(function () {
        var old = $el.attr("title");
        $el.attr("title", "Copied!");
        $el.css("color", "var(--accent)");
        setTimeout(function () { $el.css("color", ""); $el.attr("title", old); }, 1200);
      });
    }
  });

  /* ---------- 12. Footer year ---------- */
  $("#year").text(new Date().getFullYear());
});
