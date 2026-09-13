/* ==========================================================================
   INSM · Herramientas del sitio
   - Botón flotante: Buscador / directorio de lugares del sitio
   - Envío AJAX genérico para formularios de preinscripción (.insm-ajax-form)
   Este archivo se referencia desde todas las páginas del sitio.
   ========================================================================== */
(function () {
	'use strict';

	/* -------------------- 0) Backend de formularios (Google Apps Script) --------
	   Pegar acá la URL que termina en /exec, obtenida al implementar Code.gs
	   como Aplicación Web (ver instrucciones dentro de ese archivo). Este es
	   el ÚNICO lugar del sitio que hay que tocar para conectar los formularios
	   a la planilla de Google Sheets. */
	var APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzJ6U2Rcy2cTkB6K_yI-aRyJbR6oVIIyFsXg7YB31HPQhRSLt_bCrWZqMhRhUbi8xje/exec';

	/* -------------------- 1) Directorio de lugares del sitio -------------------- */
	var SITE_DIRECTORY = [
		{ title: 'Inicio', desc: 'Página principal del instituto', url: 'index.html', icon: 'home' },
		{ title: 'Nuestro Colegio (resumen)', desc: 'Presentación institucional en la portada', url: 'index.html#nuestro-colegio', icon: 'info' },
		{ title: 'Niveles Educativos (resumen)', desc: 'Acceso rápido a todos los niveles', url: 'index.html#niveles', icon: 'levels' },
		{ title: 'Proyectos (resumen)', desc: 'Últimos proyectos institucionales', url: 'index.html#proyectos', icon: 'project' },
		{ title: 'Testimonios', desc: 'Opiniones de la comunidad educativa', url: 'index.html#testimonios', icon: 'chat' },
		{ title: 'Recorrido Virtual', desc: 'Tour 360° por el instituto', url: 'index.html#virtual-tour', icon: 'tour' },
		{ title: 'Contacto rápido (Inicio)', desc: 'Datos de contacto desde la portada', url: 'index.html#contacto-home', icon: 'mail' },

		{ title: 'Nuestro Colegio', desc: 'Historia, misión y valores institucionales', url: 'NuestroColegio.html', icon: 'info' },
		{ title: 'Quiénes Somos', desc: 'Identidad institucional', url: 'NuestroColegio.html#quienes-somos', icon: 'info' },
		{ title: 'Trayectoria', desc: 'Historia del instituto', url: 'NuestroColegio.html#trayectoria', icon: 'info' },
		{ title: 'Misión y Valores', desc: 'Misión, visión y valores mercedarios', url: 'NuestroColegio.html#mision', icon: 'info' },

		{ title: 'Nivel Inicial', desc: 'Jardín · Salas de 3, 4 y 5 años', url: 'NivelInicial.html', icon: 'levels' },
		{ title: 'Preinscripción Nivel Inicial', desc: 'Formulario de preinscripción del Jardín', url: 'NivelInicial.html#inscripcion', icon: 'form' },
		{ title: 'Nivel Primario', desc: 'Educación Primaria completa', url: 'NivelPrimario.html', icon: 'levels' },
		{ title: 'Preinscripción Nivel Primario', desc: 'Formulario de preinscripción de Primaria', url: 'NivelPrimario.html#inscripcion', icon: 'form' },
		{ title: 'Nivel Secundario', desc: 'Educación Secundaria completa', url: 'NivelSecundario.html', icon: 'levels' },
		{ title: 'Preinscripción Nivel Secundario', desc: 'Formulario de preinscripción de Secundaria', url: 'NivelSecundario.html#inscripcion', icon: 'form' },
		{ title: 'Elegí tu Especialidad', desc: 'Inscripción a Informática o Humanidades (correo institucional)', url: 'NivelSecundario.html#inscripcion-especialidad', icon: 'form' },
		{ title: 'Nivel Terciario', desc: 'Profesorados de Nivel Superior', url: 'NivelTerciario.html', icon: 'levels' },
		{ title: 'Preinscripción Nivel Terciario', desc: 'Ficha de preinscripción del profesorado', url: 'NivelTerciario.html#inscripcion', icon: 'form' },

		{ title: 'Proyectos', desc: 'Todos los proyectos institucionales', url: 'Proyectos.html', icon: 'project' },

		{ title: 'Contacto', desc: 'Información de contacto general', url: 'Contacto.html', icon: 'mail' },
		{ title: 'Formulario de Contacto', desc: 'Envianos un mensaje', url: 'Contacto.html#contact-form', icon: 'form' },
		{ title: 'Cómo Llegar / Mapa', desc: 'Ubicación del instituto en el mapa', url: 'Contacto.html#mapa', icon: 'pin' },
	];

	/* -------------------- 2) Utilidades -------------------- */
	function normalize(str) {
		return (str || '')
			.toString()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}

	function currentPageName() {
		var path = window.location.pathname.split('/').pop();
		return path || 'index.html';
	}

	var ICONS = {
		home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h5v-6h4v6h5v-9"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none"/>',
		levels: '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/>',
		project: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M8 4v-1M16 4v-1"/>',
		chat: '<path d="M4 5h16v10H8l-4 4V5Z"/>',
		tour: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z"/>',
		mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
		form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
		pin: '<path d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/>',
	};

	function svgIcon(name, extra) {
		var body = ICONS[name] || ICONS.info;
		return (
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
			'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' + (extra || '') + '>' + body + '</svg>'
		);
	}

	/* -------------------- 3) Estilos inyectados -------------------- */
	var style = document.createElement('style');
	style.id = 'insm-tools-style';
	style.textContent =
		'.insm-fab-group{position:fixed;left:18px;bottom:18px;z-index:1900;display:flex;flex-direction:column;gap:12px;}' +
		'.insm-fab{width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
		'background:#cf0621;color:#fff;box-shadow:0 8px 20px rgba(30,10,10,0.28);transition:transform .2s ease,background-color .2s ease;padding:0;}' +
		'.insm-fab:hover{transform:translateY(-2px) scale(1.05);background:#a7051a;}' +
		'.insm-fab:active{transform:scale(0.96);}' +
		'.insm-fab svg{width:24px;height:24px;}' +
		'@media(max-width:600px){.insm-fab-group{left:12px;bottom:12px;gap:10px;}.insm-fab{width:46px;height:46px;}.insm-fab svg{width:20px;height:20px;}}' +

		'.insm-search-overlay{position:fixed;inset:0;background:rgba(20,10,10,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
		'z-index:3000;display:flex;align-items:flex-start;justify-content:center;padding:8vh 16px 16px;opacity:0;pointer-events:none;transition:opacity .25s ease;}' +
		'.insm-search-overlay.insm-open{opacity:1;pointer-events:all;}' +
		'.insm-search-panel{background:#fff;width:100%;max-width:560px;border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,0.35);' +
		'display:flex;flex-direction:column;max-height:78vh;overflow:hidden;transform:translateY(-16px);transition:transform .25s ease;font-family:"ProximaNova",sans-serif;}' +
		'.insm-search-overlay.insm-open .insm-search-panel{transform:translateY(0);}' +
		'.insm-search-header{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid #eee;flex-shrink:0;}' +
		'.insm-search-header svg{width:20px;height:20px;color:#cf0621;flex-shrink:0;}' +
		'.insm-search-header input{flex:1;border:none;outline:none;font-size:1.05em;font-family:"ProximaNova",sans-serif;color:#2b2b2b;background:transparent;}' +
		'.insm-search-close{border:none;background:#f4f6f8;color:#555;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
		'.insm-search-close:hover{background:#eee;}' +
		'.insm-search-close svg{width:16px;height:16px;}' +
		'.insm-search-list{overflow-y:auto;padding:8px;}' +
		'.insm-search-item{display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:8px;text-decoration:none;color:inherit;}' +
		'.insm-search-item:hover,.insm-search-item.insm-active{background:#fdf1ee;}' +
		'.insm-search-item .insm-icon{width:36px;height:36px;border-radius:8px;background:rgba(207,6,33,0.1);color:#cf0621;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
		'.insm-search-item .insm-icon svg{width:18px;height:18px;}' +
		'.insm-search-item strong{display:block;font-family:"Heuristica",serif;font-weight:normal;color:#2b2b2b;font-size:1em;}' +
		'.insm-search-item span{display:block;color:#777;font-size:0.85em;margin-top:2px;}' +
		'.insm-search-item .insm-here{font-size:0.7em;color:#cf0621;font-weight:bold;margin-left:6px;}' +
		'.insm-search-empty{padding:30px 16px;text-align:center;color:#888;font-family:"ProximaNova",sans-serif;}';
	document.head.appendChild(style);

	/* -------------------- 4) Botón flotante de búsqueda -------------------- */
	var fabGroup = document.createElement('div');
	fabGroup.className = 'insm-fab-group';

	var searchBtn = document.createElement('button');
	searchBtn.type = 'button';
	searchBtn.className = 'insm-fab';
	searchBtn.setAttribute('aria-label', 'Buscar en el sitio');
	searchBtn.title = 'Buscar en el sitio';
	searchBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>';

	fabGroup.appendChild(searchBtn);

	/* -------------------- 5) Buscador / directorio del sitio -------------------- */
	var overlay = document.createElement('div');
	overlay.className = 'insm-search-overlay';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-label', 'Buscador del sitio');

	var panel = document.createElement('div');
	panel.className = 'insm-search-panel';

	var header = document.createElement('div');
	header.className = 'insm-search-header';
	header.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>';

	var input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Buscar página o sección del sitio...';
	input.setAttribute('aria-label', 'Buscar en el sitio');
	header.appendChild(input);

	var closeBtn = document.createElement('button');
	closeBtn.type = 'button';
	closeBtn.className = 'insm-search-close';
	closeBtn.setAttribute('aria-label', 'Cerrar buscador');
	closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m5 5 14 14M19 5 5 19"/></svg>';
	header.appendChild(closeBtn);

	var list = document.createElement('div');
	list.className = 'insm-search-list';

	panel.appendChild(header);
	panel.appendChild(list);
	overlay.appendChild(panel);

	function renderList(filter) {
		var q = normalize(filter);
		var page = currentPageName();
		var items = SITE_DIRECTORY.filter(function (item) {
			if (!q) return true;
			return normalize(item.title + ' ' + item.desc).indexOf(q) !== -1;
		});

		list.innerHTML = '';

		if (!items.length) {
			var empty = document.createElement('div');
			empty.className = 'insm-search-empty';
			empty.textContent = 'No encontramos resultados para "' + filter + '".';
			list.appendChild(empty);
			return;
		}

		items.forEach(function (item) {
			var a = document.createElement('a');
			a.className = 'insm-search-item';
			a.href = item.url;
			var isHere = item.url.split('#')[0] === page || (item.url.indexOf('#') === -1 && item.url === page);
			a.innerHTML =
				'<span class="insm-icon">' + svgIcon(item.icon) + '</span>' +
				'<span><strong>' + item.title + (isHere ? '<span class="insm-here">ESTÁS ACÁ</span>' : '') + '</strong>' +
				'<span>' + item.desc + '</span></span>';
			list.appendChild(a);
		});
	}

	function openSearch() {
		overlay.classList.add('insm-open');
		document.documentElement.classList.add('no-scroll');
		document.body.classList.add('no-scroll');
		input.value = '';
		renderList('');
		setTimeout(function () {
			input.focus();
		}, 50);
	}

	function closeSearch() {
		overlay.classList.remove('insm-open');
		document.documentElement.classList.remove('no-scroll');
		document.body.classList.remove('no-scroll');
		searchBtn.focus();
	}

	searchBtn.addEventListener('click', openSearch);
	closeBtn.addEventListener('click', closeSearch);
	overlay.addEventListener('click', function (e) {
		if (e.target === overlay) closeSearch();
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && overlay.classList.contains('insm-open')) closeSearch();
	});
	input.addEventListener('input', function () {
		renderList(input.value);
	});

	/* -------------------- 6) Envío genérico de formularios de preinscripción --------
	   Los datos van a un Web App de Google Apps Script (ver Code.gs), que los
	   guarda en Google Sheets y reenvía el aviso por email. Como Apps Script
	   no permite leer la respuesta desde el navegador (limitación de CORS),
	   el envío se hace en modo "no-cors": si el navegador pudo mandar la
	   petición, se considera exitoso; solo se muestra error si hay un
	   problema de red real (sin conexión, URL mal pegada, etc.). -------------------- */
	function initAjaxForm(form) {
		var btn = form.querySelector('.submit-btn');
		var responseDiv = form.parentElement.querySelector('.response-message');
		if (!btn || !responseDiv) return;

		var successMsg = form.getAttribute('data-success-msg') || '¡Gracias! Recibimos tu preinscripción y nos vamos a contactar a la brevedad.';
		var fallbackEmail = form.getAttribute('data-fallback-email') || 'info@institutolamerced.edu.ar';
		var originalBtnText = btn.textContent;

		form.addEventListener('submit', function (e) {
			e.preventDefault();

			responseDiv.style.display = 'none';
			responseDiv.className = 'response-message';

			var invalid = form.querySelector(':invalid');
			if (invalid) {
				invalid.reportValidity();
				return;
			}

			if (APPS_SCRIPT_ENDPOINT.indexOf('PEGAR_AQUI') !== -1) {
				console.error('insm-tools.js: falta configurar APPS_SCRIPT_ENDPOINT con la URL real de Apps Script.');
				responseDiv.textContent = 'El formulario todavía no está conectado. Escribinos directamente a ' + fallbackEmail + '.';
				responseDiv.classList.add('response-error');
				responseDiv.style.display = 'block';
				return;
			}

			btn.disabled = true;
			btn.textContent = 'Enviando...';

			var params = new URLSearchParams(new FormData(form));
			params.append('_to', fallbackEmail);

			fetch(APPS_SCRIPT_ENDPOINT, {
				method: 'POST',
				mode: 'no-cors',
				body: params,
			})
				.then(function () {
					responseDiv.textContent = successMsg;
					responseDiv.classList.add('response-success');
					form.reset();
				})
				.catch(function (err) {
					console.error('Error al enviar el formulario de preinscripción:', err);
					responseDiv.textContent = 'Lo sentimos, hubo un problema al enviar el formulario. Por favor, reintentá o escribinos a ' + fallbackEmail + '.';
					responseDiv.classList.add('response-error');
				})
				.finally(function () {
					btn.disabled = false;
					btn.textContent = originalBtnText;
					responseDiv.style.display = 'block';
				});
		});
	}

	/* -------------------- 7) Montaje -------------------- */
	function mount() {
		document.body.appendChild(fabGroup);
		document.body.appendChild(overlay);
		document.querySelectorAll('form.insm-ajax-form').forEach(initAjaxForm);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		mount();
	}
})();
