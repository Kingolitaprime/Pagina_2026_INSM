(function () {
	"use strict";

	/* ---------------------------------------------------------------------
	   Índice de búsqueda del sitio (estático, sin backend).
	   Se define acá mismo (no en un .json aparte) para que funcione incluso
	   abriendo los archivos con doble clic (file://), donde un fetch() a
	   otro archivo puede fallar por CORS.
	   --------------------------------------------------------------------- */
	var SEARCH_INDEX = [
		{
			title: "Inicio",
			url: "index.html",
			description: "Página principal del Instituto Nuestra Señora de la Merced.",
			keywords: "inicio home instituto colegio arroyito córdoba nuestro colegio niveles proyectos tour virtual testimonios recorrido",
		},
		{
			title: "Nuestro Colegio",
			url: "NuestroColegio.html",
			description: "Historia, trayectoria y propuesta educativa del instituto.",
			keywords: "historia trayectoria fundación carisma misión propuesta educativa matrícula mixta creación secundario informática quiénes somos",
		},
		{
			title: "Nivel Inicial",
			url: "NivelInicial.html",
			description: "Jardín y primeros años escolares.",
			keywords: "inicial jardín sala primeros años admisión inscripción uniforme inglés deportes directora",
		},
		{
			title: "Nivel Primario",
			url: "NivelPrimario.html",
			description: "Educación primaria, de 1° a 6° grado.",
			keywords: "primario primaria grado admisión inscripción uniforme inglés deportes director directora",
		},
		{
			title: "Nivel Secundario",
			url: "NivelSecundario.html",
			description: "Educación secundaria y orientaciones.",
			keywords: "secundario secundaria orientación informática admisión inscripción uniforme inglés deportes director directora",
		},
		{
			title: "Nivel Terciario",
			url: "NivelTerciario.html",
			description: "Formación docente y estudios superiores.",
			keywords: "terciario profesorado formación docente superior admisión inscripción director directora",
		},
		{
			title: "Proyectos",
			url: "Proyectos.html",
			description: "Proyectos, eventos y producciones de la comunidad educativa.",
			keywords: "proyectos revista eme premios torres eventos cortometrajes desfile fin de año producciones",
		},
		{
			title: "Contacto",
			url: "Contacto.html",
			description: "Información de contacto, mail y formulario de consultas.",
			keywords: "contacto teléfono dirección mail correo karina lucero zulma moreira maría victoria celi 9 de julio arroyito formulario consulta",
		},
	];

	/* Quita tildes/diacríticos para que "matricula" encuentre "matrícula". */
	function normalize(str) {
		return (str || "")
			.toString()
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	}

	function search(query) {
		var q = normalize(query).trim();
		if (!q) return [];
		var terms = q.split(/\s+/);

		return SEARCH_INDEX.map(function (entry) {
			var haystack = normalize(entry.title + " " + entry.description + " " + entry.keywords);
			var score = 0;
			terms.forEach(function (term) {
				if (normalize(entry.title).indexOf(term) !== -1) score += 3;
				if (haystack.indexOf(term) !== -1) score += 1;
			});
			return { entry: entry, score: score };
		})
			.filter(function (r) {
				return r.score > 0;
			})
			.sort(function (a, b) {
				return b.score - a.score;
			})
			.map(function (r) {
				return r.entry;
			})
			.slice(0, 6);
	}

	/* ---------------------------------------------------------------------
	   Interfaz: ícono de lupa en el nav + panel desplegable con resultados
	   --------------------------------------------------------------------- */
	function buildUI() {
		var nav = document.querySelector(".header-main nav ul");
		if (!nav) return;

		var searchLi = document.createElement("li");
		searchLi.className = "search-icon";
		searchLi.innerHTML = '<i class="fas fa-search" aria-label="Buscar en el sitio"></i>';
		searchLi.setAttribute("role", "button");
		searchLi.setAttribute("tabindex", "0");

		var menuIconLi = nav.querySelector(".menu-icon");
		if (menuIconLi) {
			nav.insertBefore(searchLi, menuIconLi);
		} else {
			nav.appendChild(searchLi);
		}

		var overlay = document.createElement("div");
		overlay.className = "search-overlay";
		overlay.innerHTML =
			'<div class="search-panel">' +
			'<div class="search-input-row">' +
			'<i class="fas fa-search"></i>' +
			'<input type="text" class="search-input" placeholder="Buscar en el sitio... (ej: uniforme, proyectos, contacto)" autocomplete="off" />' +
			'<button type="button" class="search-close" aria-label="Cerrar búsqueda"><i class="fas fa-times"></i></button>' +
			"</div>" +
			'<div class="search-results"></div>' +
			"</div>";
		document.body.appendChild(overlay);

		var input = overlay.querySelector(".search-input");
		var resultsBox = overlay.querySelector(".search-results");
		var closeBtn = overlay.querySelector(".search-close");

		function renderResults(query) {
			var results = search(query);
			if (!query.trim()) {
				resultsBox.innerHTML = '<p class="search-hint">Escribí para buscar en todo el sitio.</p>';
				return;
			}
			if (!results.length) {
				resultsBox.innerHTML = '<p class="search-hint">No se encontraron resultados para "' + query + '".</p>';
				return;
			}
			resultsBox.innerHTML = results
				.map(function (r) {
					return (
						'<a class="search-result-item" href="' +
						r.url +
						'">' +
						'<span class="search-result-title">' +
						r.title +
						"</span>" +
						'<span class="search-result-desc">' +
						r.description +
						"</span>" +
						"</a>"
					);
				})
				.join("");
		}

		function openOverlay() {
			overlay.classList.add("open");
			renderResults("");
			setTimeout(function () {
				input.focus();
			}, 50);
			document.body.style.overflow = "hidden";
		}

		function closeOverlay() {
			overlay.classList.remove("open");
			input.value = "";
			document.body.style.overflow = "";
		}

		searchLi.addEventListener("click", openOverlay);
		searchLi.addEventListener("keydown", function (e) {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openOverlay();
			}
		});

		closeBtn.addEventListener("click", closeOverlay);

		overlay.addEventListener("click", function (e) {
			if (e.target === overlay) closeOverlay();
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && overlay.classList.contains("open")) {
				closeOverlay();
			}
			// Atajo rápido: Ctrl/Cmd + K abre el buscador desde cualquier lado.
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				openOverlay();
			}
		});

		input.addEventListener("input", function () {
			renderResults(input.value);
		});

		input.addEventListener("keydown", function (e) {
			if (e.key === "Enter") {
				var first = resultsBox.querySelector(".search-result-item");
				if (first) window.location.href = first.getAttribute("href");
			}
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", buildUI);
	} else {
		buildUI();
	}
})();
