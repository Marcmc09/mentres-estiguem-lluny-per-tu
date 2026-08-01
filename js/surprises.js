/* =========================================================
   MENTRE ESTIGUEM LLUNY
   Gestión automática de las sorpresas
   ========================================================= */

(function () {
    "use strict";

    const UPDATE_INTERVAL = 60 * 1000;

    let initialized = false;
    let intervalId = null;
    let lastRenderedDate = null;
    let lastFocusedElement = null;


    /* =====================================================
       ICONOS
       ===================================================== */

    const ICONS = {
        lock: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                ></rect>

                <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                ></path>
            </svg>
        `,

        arrow: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M5 12h14M14 7l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
            </svg>
        `
    };


    /* =====================================================
       OBTENER CONFIGURACIÓN
       ===================================================== */

    function getConfig() {
        if (!window.APP_CONFIG) {
            console.error(
                "No se ha encontrado APP_CONFIG. " +
                "Revisa que config.js se cargue antes que surprises.js."
            );

            return null;
        }

        return window.APP_CONFIG;
    }


    /* =====================================================
       OBTENER ELEMENTOS DEL HTML
       ===================================================== */

    function getElements() {
        return {
            featuredCard: document.getElementById(
                "featured-surprise"
            ),

            featuredBadge: document.getElementById(
                "featured-surprise-badge"
            ),

            featuredNumber: document.getElementById(
                "featured-surprise-number"
            ),

            featuredName: document.getElementById(
                "featured-surprise-name"
            ),

            featuredDescription: document.getElementById(
                "featured-surprise-description"
            ),

            featuredButton: document.getElementById(
                "featured-surprise-button"
            ),

            surprisesList: document.getElementById(
                "surprises-list"
            ),

            modal: document.getElementById(
                "locked-modal"
            ),

            modalOverlay: document.getElementById(
                "modal-overlay"
            ),

            modalClose: document.getElementById(
                "modal-close"
            ),

            modalConfirm: document.getElementById(
                "modal-confirm"
            ),

            modalEyebrow: document.querySelector(
                "#locked-modal .modal__eyebrow"
            ),

            modalTitle: document.getElementById(
                "locked-modal-title"
            ),

            modalDescription: document.getElementById(
                "locked-modal-description"
            ),

            modalDate: document.getElementById(
                "locked-modal-date"
            )
        };
    }


    /* =====================================================
       VALIDAR FECHAS
       ===================================================== */

    function parseDate(dateValue) {
        if (!dateValue) {
            return null;
        }

        const parsedDate = new Date(dateValue);

        if (Number.isNaN(parsedDate.getTime())) {
            console.error(
                "La fecha indicada no es válida:",
                dateValue
            );

            return null;
        }

        return parsedDate;
    }


    /* =====================================================
       ZONA HORARIA
       ===================================================== */

    function getTimeZone(config) {
        return config.timeZone || "Europe/Madrid";
    }


    /* =====================================================
       FECHA ACTUAL

       En modo de prueba se utiliza previewDate.
       ===================================================== */

    function getCurrentDate(config) {
        const debug = config.debug || {};

        if (debug.enabled && debug.previewDate) {
            const previewDate = parseDate(
                debug.previewDate
            );

            if (previewDate) {
                return previewDate;
            }
        }

        return new Date();
    }


    /* =====================================================
       CONVERTIR FECHA A YYYY-MM-DD
       ===================================================== */

    function getDateKey(date, config) {
        const formatter = new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: getTimeZone(config),
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        );

        const parts = formatter.formatToParts(date);

        const year = parts.find(
            part => part.type === "year"
        )?.value;

        const month = parts.find(
            part => part.type === "month"
        )?.value;

        const day = parts.find(
            part => part.type === "day"
        )?.value;

        if (!year || !month || !day) {
            return "";
        }

        return `${year}-${month}-${day}`;
    }


    /* =====================================================
       COMPROBAR SI UNA SORPRESA ESTÁ DESBLOQUEADA

       Las fechas YYYY-MM-DD pueden compararse directamente.
       ===================================================== */

    function isSurpriseUnlocked(surprise, currentDateKey) {
        if (!surprise || !surprise.unlockDate) {
            return false;
        }

        return currentDateKey >= surprise.unlockDate;
    }


    /* =====================================================
       ORDENAR SORPRESAS POR FECHA
       ===================================================== */

    function getSortedSurprises(config) {
        const surprises =
            Array.isArray(config.surprises)
                ? config.surprises
                : [];

        return [...surprises].sort(
            (firstSurprise, secondSurprise) =>
                firstSurprise.unlockDate.localeCompare(
                    secondSurprise.unlockDate
                )
        );
    }


    /* =====================================================
       BUSCAR SORPRESA DESTACADA

       - Si existen sorpresas abiertas, muestra la última.
       - Si todavía no hay ninguna abierta, muestra la primera.
       ===================================================== */

    function getFeaturedSurprise(
        surprises,
        currentDateKey
    ) {
        if (surprises.length === 0) {
            return null;
        }

        const unlockedSurprises =
            surprises.filter(
                surprise =>
                    isSurpriseUnlocked(
                        surprise,
                        currentDateKey
                    )
            );

        if (unlockedSurprises.length > 0) {
            return unlockedSurprises[
                unlockedSurprises.length - 1
            ];
        }

        return surprises[0];
    }


    /* =====================================================
       CREAR ELEMENTOS HTML
       ===================================================== */

    function createElement(
        tagName,
        className = "",
        textContent = ""
    ) {
        const element =
            document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }


    /* =====================================================
       CREAR FECHA DE DESBLOQUEO
       ===================================================== */

    function getUnlockMessage(surprise) {
        if (surprise.displayDate) {
            return `S’obrirà el ${surprise.displayDate}`;
        }

        return "S’obrirà molt aviat";
    }


    /* =====================================================
       CONFIGURAR SORPRESA DESTACADA ABIERTA
       ===================================================== */

    function renderUnlockedFeatured(
        elements,
        surprise,
        config
    ) {
        const texts = config.texts || {};

        elements.featuredCard.classList.remove(
            "is-locked"
        );

        elements.featuredCard.classList.add(
            "is-unlocked"
        );

        elements.featuredBadge.className =
            "status-badge status-badge--available";

        elements.featuredBadge.textContent =
            texts.latestAvailable ||
            texts.featuredAvailable ||
            "Ja disponible";

        elements.featuredButton.className =
            "button button--primary";

        elements.featuredButton.href =
            surprise.pdf || "#";

        elements.featuredButton.target =
            "_blank";

        elements.featuredButton.rel =
            "noopener noreferrer";

        elements.featuredButton.removeAttribute(
            "role"
        );

        elements.featuredButton.removeAttribute(
            "aria-disabled"
        );

        elements.featuredButton.innerHTML = `
            <span>
                ${
                    surprise.buttonText ||
                    texts.openSurprise ||
                    "Obrir la sorpresa"
                }
            </span>

            ${ICONS.arrow}
        `;

        elements.featuredButton.onclick = null;
    }


    /* =====================================================
       CONFIGURAR SORPRESA DESTACADA CERRADA
       ===================================================== */

    function renderLockedFeatured(
        elements,
        surprise,
        config
    ) {
        const texts = config.texts || {};

        elements.featuredCard.classList.add(
            "is-locked"
        );

        elements.featuredCard.classList.remove(
            "is-unlocked"
        );

        elements.featuredBadge.className =
            "status-badge status-badge--locked";

        elements.featuredBadge.textContent =
            getUnlockMessage(surprise);

        elements.featuredButton.className =
            "button button--secondary";

        elements.featuredButton.removeAttribute(
            "href"
        );

        elements.featuredButton.removeAttribute(
            "target"
        );

        elements.featuredButton.removeAttribute(
            "rel"
        );

        elements.featuredButton.setAttribute(
            "role",
            "button"
        );

        elements.featuredButton.setAttribute(
            "aria-disabled",
            "true"
        );

        elements.featuredButton.innerHTML = `
            <span>
                ${
                    texts.locked ||
                    "Encara no"
                }
            </span>

            ${ICONS.lock}
        `;

        elements.featuredButton.onclick =
            function (event) {
                event.preventDefault();

                openLockedModal(surprise);
            };
    }


    /* =====================================================
       MOSTRAR SORPRESA DESTACADA
       ===================================================== */

    function renderFeatured(
        elements,
        surprise,
        currentDateKey,
        config
    ) {
        if (
            !elements.featuredCard ||
            !elements.featuredBadge ||
            !elements.featuredNumber ||
            !elements.featuredName ||
            !elements.featuredDescription ||
            !elements.featuredButton
        ) {
            console.warn(
                "Faltan elementos de la sorpresa destacada."
            );

            return;
        }

        if (!surprise) {
            elements.featuredCard.classList.add(
                "is-hidden"
            );

            return;
        }

        elements.featuredCard.classList.remove(
            "is-hidden"
        );

        elements.featuredNumber.textContent =
            `${
                config.texts?.surprisePrefix ||
                "Sorpresa"
            } ${surprise.number}`;

        elements.featuredName.textContent =
            surprise.title;

        elements.featuredDescription.textContent =
            surprise.featuredDescription ||
            surprise.description ||
            "";

        const unlocked =
            isSurpriseUnlocked(
                surprise,
                currentDateKey
            );

        if (unlocked) {
            renderUnlockedFeatured(
                elements,
                surprise,
                config
            );
        } else {
            renderLockedFeatured(
                elements,
                surprise,
                config
            );
        }
    }


    /* =====================================================
       CREAR MARCADOR DE SORPRESA
       ===================================================== */

    function createSurpriseMarker(surprise) {
        const marker = createElement(
            "div",
            "surprise-item__marker"
        );

        marker.setAttribute(
            "aria-hidden",
            "true"
        );

        const markerNumber =
            createElement(
                "span",
                "",
                surprise.number
            );

        marker.appendChild(markerNumber);

        return marker;
    }


    /* =====================================================
       CREAR ESTADO DE SORPRESA
       ===================================================== */

    function createSurpriseStatus(
        unlocked,
        config
    ) {
        const texts = config.texts || {};

        const status = createElement(
            "span",
            unlocked
                ? "surprise-item__status surprise-item__status--available"
                : "surprise-item__status surprise-item__status--locked"
        );

        if (unlocked) {
            status.textContent =
                texts.opened || "Oberta";
        } else {
            status.innerHTML = `
                ${ICONS.lock}

                <span>
                    ${texts.locked || "Tancada"}
                </span>
            `;
        }

        return status;
    }


    /* =====================================================
       CREAR ENLACE DE SORPRESA ABIERTA
       ===================================================== */

    function createUnlockedLink(
        surprise,
        config
    ) {
        const link = createElement(
            "a",
            "surprise-item__link"
        );

        link.href = surprise.pdf || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const linkText =
            createElement(
                "span",
                "",
                surprise.buttonText ||
                config.texts?.openSurprise ||
                "Obrir la sorpresa"
            );

        link.appendChild(linkText);

        link.insertAdjacentHTML(
            "beforeend",
            ICONS.arrow
        );

        return link;
    }


    /* =====================================================
       CREAR MENSAJE DE SORPRESA CERRADA
       ===================================================== */

    function createLockedMessage(surprise) {
        const lockedMessage =
            createElement(
                "button",
                "surprise-item__locked-message",
                getUnlockMessage(surprise)
            );

        lockedMessage.type = "button";

        lockedMessage.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                openLockedModal(surprise);
            }
        );

        return lockedMessage;
    }


    /* =====================================================
       CREAR UNA SORPRESA DE LA LISTA
       ===================================================== */

    function createSurpriseItem(
        surprise,
        currentDateKey,
        config
    ) {
        const unlocked =
            isSurpriseUnlocked(
                surprise,
                currentDateKey
            );

        const article = createElement(
            "article",
            unlocked
                ? "surprise-item surprise-item--available"
                : "surprise-item surprise-item--locked is-locked"
        );

        article.dataset.surpriseId =
            surprise.id || "";

        article.appendChild(
            createSurpriseMarker(surprise)
        );

        const content = createElement(
            "div",
            "surprise-item__content"
        );

        const heading = createElement(
            "div",
            "surprise-item__heading"
        );

        const titleContainer =
            createElement("div");

        const date = createElement(
            "span",
            "surprise-item__date",
            surprise.displayDate ||
            surprise.unlockDate
        );

        const title = createElement(
            "h3",
            "surprise-item__title",
            surprise.title
        );

        titleContainer.appendChild(date);
        titleContainer.appendChild(title);

        heading.appendChild(titleContainer);

        heading.appendChild(
            createSurpriseStatus(
                unlocked,
                config
            )
        );

        const description = createElement(
            "p",
            "surprise-item__description",
            surprise.description || ""
        );

        content.appendChild(heading);
        content.appendChild(description);

        if (unlocked) {
            content.appendChild(
                createUnlockedLink(
                    surprise,
                    config
                )
            );
        } else {
            content.appendChild(
                createLockedMessage(surprise)
            );

            article.tabIndex = 0;
            article.setAttribute(
                "role",
                "button"
            );

            article.setAttribute(
                "aria-label",
                `${surprise.title}. ${getUnlockMessage(surprise)}`
            );

            article.addEventListener(
                "click",
                function () {
                    openLockedModal(surprise);
                }
            );

            article.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();

                        openLockedModal(surprise);
                    }
                }
            );
        }

        article.appendChild(content);

        return article;
    }


    /* =====================================================
       MOSTRAR LISTA DE SORPRESAS
       ===================================================== */

    function renderSurprisesList(
        elements,
        surprises,
        currentDateKey,
        config
    ) {
        if (!elements.surprisesList) {
            console.warn(
                "No se ha encontrado #surprises-list."
            );

            return;
        }

        const fragment =
            document.createDocumentFragment();

        surprises.forEach(function (surprise) {
            fragment.appendChild(
                createSurpriseItem(
                    surprise,
                    currentDateKey,
                    config
                )
            );
        });

        elements.surprisesList.replaceChildren(
            fragment
        );
    }


    /* =====================================================
       ABRIR MODAL
       ===================================================== */

    function openLockedModal(surprise) {
        const config = getConfig();
        const elements = getElements();

        if (!config || !elements.modal) {
            return;
        }

        lastFocusedElement =
            document.activeElement;

        const modalTexts =
            config.texts?.modal || {};

        if (elements.modalEyebrow) {
            elements.modalEyebrow.textContent =
                modalTexts.eyebrow ||
                "Encara no";
        }

        if (elements.modalTitle) {
            elements.modalTitle.textContent =
                modalTexts.title ||
                "Aquesta sorpresa està tancada";
        }

        if (elements.modalDescription) {
            elements.modalDescription.textContent =
                modalTexts.description ||
                "Hauràs d’esperar una mica més per descobrir-la.";
        }

        if (elements.modalDate) {
            elements.modalDate.textContent =
                getUnlockMessage(surprise);
        }

        if (elements.modalConfirm) {
            elements.modalConfirm.textContent =
                modalTexts.button ||
                "Esperaré amb paciència";
        }

        elements.modal.hidden = false;

        document.body.classList.add(
            "modal-open"
        );

        window.requestAnimationFrame(
            function () {
                elements.modalClose?.focus();
            }
        );
    }


    /* =====================================================
       CERRAR MODAL
       ===================================================== */

    function closeLockedModal() {
        const elements = getElements();

        if (!elements.modal) {
            return;
        }

        elements.modal.hidden = true;

        document.body.classList.remove(
            "modal-open"
        );

        if (
            lastFocusedElement &&
            typeof lastFocusedElement.focus ===
                "function"
        ) {
            lastFocusedElement.focus();
        }

        lastFocusedElement = null;
    }


    /* =====================================================
       CONTROL DE TECLADO EN EL MODAL
       ===================================================== */

    function handleModalKeydown(event) {
        const elements = getElements();

        if (
            !elements.modal ||
            elements.modal.hidden
        ) {
            return;
        }

        if (event.key === "Escape") {
            closeLockedModal();
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusableElements =
            elements.modal.querySelectorAll(
                [
                    "button:not([disabled])",
                    "a[href]",
                    "[tabindex]:not([tabindex='-1'])"
                ].join(",")
            );

        if (focusableElements.length === 0) {
            return;
        }

        const firstElement =
            focusableElements[0];

        const lastElement =
            focusableElements[
                focusableElements.length - 1
            ];

        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {
            event.preventDefault();
            lastElement.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {
            event.preventDefault();
            firstElement.focus();
        }
    }


    /* =====================================================
       EVENTOS DEL MODAL
       ===================================================== */

    function bindModalEvents(elements) {
        elements.modalClose?.addEventListener(
            "click",
            closeLockedModal
        );

        elements.modalConfirm?.addEventListener(
            "click",
            closeLockedModal
        );

        elements.modalOverlay?.addEventListener(
            "click",
            closeLockedModal
        );

        document.addEventListener(
            "keydown",
            handleModalKeydown
        );
    }


    /* =====================================================
       ACTUALIZAR SORPRESAS
       ===================================================== */

    function update(forceUpdate = false) {
        const config = getConfig();

        if (!config) {
            stop();
            return;
        }

        const elements = getElements();

        const currentDate =
            getCurrentDate(config);

        const currentDateKey =
            getDateKey(
                currentDate,
                config
            );

        if (
            !forceUpdate &&
            currentDateKey === lastRenderedDate
        ) {
            return;
        }

        const surprises =
            getSortedSurprises(config);

        const featuredSurprise =
            getFeaturedSurprise(
                surprises,
                currentDateKey
            );

        renderFeatured(
            elements,
            featuredSurprise,
            currentDateKey,
            config
        );

        renderSurprisesList(
            elements,
            surprises,
            currentDateKey,
            config
        );

        lastRenderedDate =
            currentDateKey;
    }


    /* =====================================================
       CAMBIO DE PESTAÑA
       ===================================================== */

    function handleVisibilityChange() {
        if (!document.hidden) {
            update(true);
        }
    }


    /* =====================================================
       INICIAR
       ===================================================== */

    function init() {
        if (initialized) {
            update(true);
            return;
        }

        const config = getConfig();

        if (!config) {
            return;
        }

        const elements = getElements();

        if (!elements.surprisesList) {
            console.warn(
                "No se ha encontrado el listado de sorpresas."
            );

            return;
        }

        initialized = true;

        bindModalEvents(elements);

        update(true);

        intervalId = window.setInterval(
            update,
            UPDATE_INTERVAL
        );

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.addEventListener(
            "focus",
            function () {
                update(true);
            }
        );

        window.addEventListener(
            "beforeunload",
            stop,
            { once: true }
        );
    }


    /* =====================================================
       DETENER
       ===================================================== */

    function stop() {
        if (intervalId !== null) {
            window.clearInterval(
                intervalId
            );

            intervalId = null;
        }
    }


    /* =====================================================
       REINICIAR
       ===================================================== */

    function restart() {
        stop();

        initialized = false;
        lastRenderedDate = null;

        init();
    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.Surprises = {
        init,
        update,
        stop,
        restart,
        openLockedModal,
        closeLockedModal,
        isSurpriseUnlocked
    };


    /* =====================================================
       INICIO AUTOMÁTICO
       ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();