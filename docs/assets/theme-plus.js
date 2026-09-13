(function () {
	"use strict";

	/* ---------- 1) MODO OSCURO ---------- */
	var STORAGE_KEY = "insm-theme";
	var root = document.documentElement;

	function applyTheme(theme) {
		if (theme === "dark") {
			root.classList.add("dark-mode");
		} else {
			root.classList.remove("dark-mode");
		}
	}

	function getPreferredTheme() {
		var saved = null;
		try {
			saved = localStorage.getItem(STORAGE_KEY);
		} catch (e) {
			/* almacenamiento no disponible (modo privado, etc.) */
		}
		if (saved === "dark" || saved === "light") return saved;
		var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		return prefersDark ? "dark" : "light";
	}

	var currentTheme = getPreferredTheme();
	applyTheme(currentTheme);

	function createToggleButton() {
		var btn = document.createElement("button");
		btn.className = "theme-toggle-btn";
		btn.type = "button";
		btn.setAttribute("aria-label", "Cambiar entre modo claro y oscuro");
		btn.innerHTML = '<i class="fas ' + (currentTheme === "dark" ? "fa-sun" : "fa-moon") + '"></i>';

		btn.addEventListener("click", function () {
			currentTheme = currentTheme === "dark" ? "light" : "dark";
			applyTheme(currentTheme);
			try {
				localStorage.setItem(STORAGE_KEY, currentTheme);
			} catch (e) {}
			var icon = btn.querySelector("i");
			if (icon) {
				icon.className = "fas " + (currentTheme === "dark" ? "fa-sun" : "fa-moon");
			}
		});

		document.body.appendChild(btn);
	}

	/* ---------- 2) REVELADO SUAVE AL HACER SCROLL ---------- */
	function setupScrollReveal() {
		var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		var selectors = [
			".projects-card",
			".gallery-col",
			".level-info",
			".testimonial-quote",
			".contact-home-icon-box",
			".shortcut-item",
			".levels-title",
		];
		var targets = document.querySelectorAll(selectors.join(","));

		if (prefersReducedMotion || !("IntersectionObserver" in window) || !targets.length) {
			return;
		}

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
		);

		targets.forEach(function (el, i) {
			el.classList.add("reveal-init");
			// Pequeño escalonado para que no aparezca todo a la vez.
			el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
			observer.observe(el);
		});
	}

	function init() {
		createToggleButton();
		setupScrollReveal();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
