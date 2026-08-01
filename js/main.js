/* =========================================================
   MENTRE ESTIGUEM LLUNY
   Archivo principal de la aplicación
   ========================================================= */

(function () {
    "use strict";

    document.documentElement.classList.add("js");

    let initialized = false;
    let revealObserver = null;


    /* =====================================================
       OBTENER CONFIGURACIÓN
       ===================================================== */

    function getConfig() {
        if (!window.APP_CONFIG) {
            console.error(
                "No se ha encontrado APP_CONFIG. " +
                "Revisa que config.js esté cargado correctamente."
            );

            return null;
        }

        return window.APP_CONFIG;
    }


    /* =====================================================
       VALIDAR CONFIGURACIÓN
       ===================================================== */

    function validateConfig(config) {
        const warnings = [];

        if (!config.appName) {
            warnings.push(
                "No se ha definido appName en config.js."
            );
        }

        if (!config.countdown?.targetDate) {
            warnings.push(
                "No se ha definido la fecha del contador."
            );
        }

        if (!Array.isArray(config.dailyMessages)) {
            warnings.push(
                "dailyMessages debe ser una lista."
            );
        }

        if (!Array.isArray(config.surprises)) {
            warnings.push(
                "surprises debe ser una lista."
            );
        }

        config.surprises?.forEach(function (
            surprise,
            index
        ) {
            if (!surprise.unlockDate) {
                warnings.push(
                    `La sorpresa ${index + 1} no tiene unlockDate.`
                );
            }

            if (!surprise.title) {
                warnings.push(
                    `La sorpresa ${index + 1} no tiene título.`
                );
            }

            if (!surprise.pdf) {
                warnings.push(
                    `La sorpresa ${index + 1} no tiene PDF.`
                );
            }
        });

        if (warnings.length > 0) {
            console.group(
                "Avisos de configuración"
            );

            warnings.forEach(function (warning) {
                console.warn(warning);
            });

            console.groupEnd();
        }

        return warnings.length === 0;
    }


    /* =====================================================
       CONFIGURAR INFORMACIÓN DE LA PÁGINA
       ===================================================== */

    function configureDocument(config) {
        if (config.appName) {
            document.title =
                `${config.appName} ❤️`;
        }

        if (config.locale) {
            document.documentElement.lang =
                config.locale.split("-")[0];
        }

        const description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (
            description &&
            config.metaDescription
        ) {
            description.setAttribute(
                "content",
                config.metaDescription
            );
        }
    }


    /* =====================================================
       AÑADIR ESTILOS DE MEJORA

       Estos estilos complementan el CSS principal:
       - Animaciones al hacer scroll
       - Cambio de números del contador
       - Cambio del mensaje diario
       - Indicador del modo de prueba
       ===================================================== */

    function injectEnhancementStyles() {
        if (
            document.getElementById(
                "app-enhancement-styles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "app-enhancement-styles";

        style.textContent = `
            html.js .reveal-item {
                opacity: 0;
                transform: translateY(24px);
                transition:
                    opacity 700ms ease,
                    transform 700ms ease;
            }

            html.js .reveal-item.is-visible {
                opacity: 1;
                transform: translateY(0);
            }

            .countdown__number--changed {
                animation: countdownNumberChange 350ms ease;
            }

            .daily-card__quote--changed {
                animation: dailyMessageChange 650ms ease;
            }

            .app-ready .hero {
                opacity: 1;
            }

            .debug-badge {
                position: fixed;
                z-index: 900;

                right: 12px;
                bottom:
                    calc(12px + env(safe-area-inset-bottom));

                display: inline-flex;
                align-items: center;
                gap: 7px;

                padding: 8px 11px;

                border:
                    1px solid rgba(169, 95, 98, 0.25);
                border-radius: 999px;

                color: #8d4f52;
                background:
                    rgba(255, 248, 247, 0.94);

                box-shadow:
                    0 8px 24px rgba(90, 56, 56, 0.14);

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                font-size: 0.62rem;
                font-weight: 800;
                letter-spacing: 0.08em;
                text-transform: uppercase;

                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }

            .debug-badge::before {
                content: "";

                width: 7px;
                height: 7px;

                border-radius: 50%;

                background: #c98586;

                animation:
                    debugPulse 1.6s ease-in-out infinite;
            }

            @keyframes countdownNumberChange {
                0% {
                    opacity: 0.4;
                    transform: translateY(-4px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes dailyMessageChange {
                0% {
                    opacity: 0;
                    transform: translateY(8px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes debugPulse {
                0%,
                100% {
                    opacity: 0.45;
                    transform: scale(0.85);
                }

                50% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                html.js .reveal-item {
                    opacity: 1;
                    transform: none;
                    transition: none;
                }

                .countdown__number--changed,
                .daily-card__quote--changed,
                .debug-badge::before {
                    animation: none;
                }
            }
        `;

        document.head.appendChild(style);
    }


    /* =====================================================
       ANIMACIONES AL HACER SCROLL
       ===================================================== */

    function setupRevealAnimations() {
        const elements =
            document.querySelectorAll(
                ".section, .footer"
            );

        if (elements.length === 0) {
            return;
        }

        const prefersReducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        if (
            prefersReducedMotion ||
            !("IntersectionObserver" in window)
        ) {
            elements.forEach(function (element) {
                element.classList.add(
                    "is-visible"
                );
            });

            return;
        }

        elements.forEach(function (
            element,
            index
        ) {
            element.classList.add(
                "reveal-item"
            );

            element.style.transitionDelay =
                `${Math.min(index * 35, 140)}ms`;
        });

        revealObserver =
            new IntersectionObserver(
                function (entries, observer) {
                    entries.forEach(function (
                        entry
                    ) {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );

        elements.forEach(function (element) {
            revealObserver.observe(element);
        });
    }


    /* =====================================================
       ENLACES INTERNOS
       ===================================================== */

    function setupInternalLinks() {
        const internalLinks =
            document.querySelectorAll(
                'a[href^="#"]'
            );

        internalLinks.forEach(function (link) {
            link.addEventListener(
                "click",
                function (event) {
                    const targetId =
                        link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior:
                            window.matchMedia(
                                "(prefers-reduced-motion: reduce)"
                            ).matches
                                ? "auto"
                                : "smooth",

                        block: "start"
                    });

                    window.history.replaceState(
                        null,
                        "",
                        targetId
                    );
                }
            );
        });
    }


    /* =====================================================
       SEGURIDAD DE ENLACES EXTERNOS
       ===================================================== */

    function secureExternalLinks() {
        const externalLinks =
            document.querySelectorAll(
                'a[target="_blank"]'
            );

        externalLinks.forEach(function (link) {
            const currentRel =
                link.getAttribute("rel") || "";

            const relValues =
                new Set(
                    currentRel
                        .split(" ")
                        .filter(Boolean)
                );

            relValues.add("noopener");
            relValues.add("noreferrer");

            link.setAttribute(
                "rel",
                Array.from(relValues).join(" ")
            );
        });
    }


    /* =====================================================
       COMPROBAR ENLACES A PDF

       Evita abrir una pestaña vacía cuando todavía no
       se ha añadido el PDF correspondiente.
       ===================================================== */

    function setupPdfLinks() {
        document.addEventListener(
            "click",
            function (event) {
                const link =
                    event.target.closest(
                        'a[href$=".pdf"]'
                    );

                if (!link) {
                    return;
                }

                const href =
                    link.getAttribute("href");

                if (!href || href === "#") {
                    event.preventDefault();

                    console.warn(
                        "Este PDF todavía no está configurado."
                    );
                }
            }
        );
    }


    /* =====================================================
       INDICADOR DE MODO DE PRUEBA
       ===================================================== */

    function setupDebugBadge(config) {
        const existingBadge =
            document.querySelector(
                ".debug-badge"
            );

        if (
            !config.debug?.enabled ||
            !config.debug?.previewDate
        ) {
            existingBadge?.remove();
            return;
        }

        const badge =
            existingBadge ||
            document.createElement("div");

        badge.className = "debug-badge";

        badge.textContent =
            "Mode prova";

        badge.title =
            `Data simulada: ${config.debug.previewDate}`;

        if (!existingBadge) {
            document.body.appendChild(badge);
        }
    }


    /* =====================================================
       INICIAR MÓDULOS
       ===================================================== */

    function initializeModules() {
        const modules = [
            {
                name: "Countdown",
                module: window.Countdown
            },

            {
                name: "DailyMessages",
                module: window.DailyMessages
            },

            {
                name: "Surprises",
                module: window.Surprises
            }
        ];

        modules.forEach(function ({
            name,
            module
        }) {
            if (
                !module ||
                typeof module.init !== "function"
            ) {
                console.warn(
                    `El módulo ${name} no está disponible.`
                );

                return;
            }

            try {
                module.init();
            } catch (error) {
                console.error(
                    `Error al iniciar ${name}:`,
                    error
                );
            }
        });
    }


    /* =====================================================
       ACTUALIZAR TODOS LOS MÓDULOS
       ===================================================== */

    function refresh() {
        const modules = [
            window.Countdown,
            window.DailyMessages,
            window.Surprises
        ];

        modules.forEach(function (module) {
            if (
                module &&
                typeof module.update ===
                    "function"
            ) {
                try {
                    module.update(true);
                } catch (error) {
                    console.error(
                        "No se ha podido actualizar un módulo:",
                        error
                    );
                }
            }
        });

        secureExternalLinks();
    }


    /* =====================================================
       CONTROL DE VISIBILIDAD
       ===================================================== */

    function handleVisibilityChange() {
        if (!document.hidden) {
            refresh();
        }
    }


    /* =====================================================
       DETECTAR CAMBIOS DE TAMAÑO
       ===================================================== */

    function setupViewportHeight() {
        function updateViewportHeight() {
            const viewportHeight =
                window.innerHeight * 0.01;

            document.documentElement.style.setProperty(
                "--viewport-height",
                `${viewportHeight}px`
            );
        }

        updateViewportHeight();

        window.addEventListener(
            "resize",
            updateViewportHeight,
            {
                passive: true
            }
        );

        window.addEventListener(
            "orientationchange",
            updateViewportHeight,
            {
                passive: true
            }
        );
    }


    /* =====================================================
       ERRORES GENERALES
       ===================================================== */

    function setupErrorHandling() {
        window.addEventListener(
            "error",
            function (event) {
                console.error(
                    "Se ha producido un error en la página:",
                    event.error ||
                    event.message
                );
            }
        );

        window.addEventListener(
            "unhandledrejection",
            function (event) {
                console.error(
                    "Se ha producido un error inesperado:",
                    event.reason
                );
            }
        );
    }


    /* =====================================================
       MARCAR LA PÁGINA COMO PREPARADA
       ===================================================== */

    function markAsReady() {
        document.body.classList.add(
            "app-ready"
        );

        document.documentElement.classList.add(
            "app-loaded"
        );
    }


    /* =====================================================
       INICIAR APLICACIÓN
       ===================================================== */

    function init() {
        if (initialized) {
            refresh();
            return;
        }

        const config = getConfig();

        if (!config) {
            return;
        }

        initialized = true;

        validateConfig(config);
        configureDocument(config);
        injectEnhancementStyles();

        initializeModules();

        setupViewportHeight();
        setupInternalLinks();
        setupPdfLinks();
        secureExternalLinks();
        setupRevealAnimations();
        setupDebugBadge(config);
        setupErrorHandling();

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.addEventListener(
            "focus",
            refresh
        );

        window.requestAnimationFrame(
            markAsReady
        );

        console.log(
            `${config.appName || "Aplicació"} preparada ❤️`
        );
    }


    /* =====================================================
       REINICIAR TODA LA APLICACIÓN
       ===================================================== */

    function restart() {
        window.Countdown?.restart?.();
        window.DailyMessages?.restart?.();
        window.Surprises?.restart?.();

        refresh();
    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.App = {
        init,
        refresh,
        restart,
        validateConfig
    };


    /* =====================================================
       INICIO AUTOMÁTICO
       ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }

})();