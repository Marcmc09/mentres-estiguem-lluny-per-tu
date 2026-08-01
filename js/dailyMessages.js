/* =========================================================
   MENTRE ESTIGUEM LLUNY
   Mensajes diarios automáticos
   ========================================================= */

(function () {
    "use strict";

    const UPDATE_INTERVAL = 60 * 1000;

    let intervalId = null;
    let initialized = false;
    let lastDisplayedDate = null;


    /* =====================================================
       OBTENER CONFIGURACIÓN
       ===================================================== */

    function getConfig() {
        if (!window.APP_CONFIG) {
            console.error(
                "No se ha encontrado APP_CONFIG. Revisa que config.js se cargue antes que dailyMessages.js."
            );

            return null;
        }

        return window.APP_CONFIG;
    }


    /* =====================================================
       ELEMENTOS DEL HTML
       ===================================================== */

    function getElements() {
        return {
            message: document.getElementById(
                "daily-message"
            ),

            date: document.getElementById(
                "daily-message-date"
            )
        };
    }


    /* =====================================================
       VALIDAR UNA FECHA
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
       FECHA ACTUAL

       Si el modo de prueba está activado, se utiliza
       previewDate en lugar de la fecha real.
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
       ZONA HORARIA
       ===================================================== */

    function getTimeZone(config) {
        return (
            config.timeZone ||
            "Europe/Madrid"
        );
    }


    /* =====================================================
       CONVERTIR FECHA A YYYY-MM-DD

       Utilizamos la zona horaria de España para evitar
       que el mensaje cambie antes o después de medianoche.
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
       BUSCAR MENSAJE EXACTO
       ===================================================== */

    function findMessageByDate(config, dateKey) {
        const dailyMessages =
            Array.isArray(config.dailyMessages)
                ? config.dailyMessages
                : [];

        return dailyMessages.find(
            message => message.date === dateKey
        ) || null;
    }


    /* =====================================================
       CREAR ÍNDICE ESTABLE PARA MENSAJES ALTERNATIVOS

       De esta manera, cada fecha muestra siempre el mismo
       mensaje alternativo y no cambia al actualizar.
       ===================================================== */

    function createDateNumber(dateKey) {
        if (!dateKey) {
            return 0;
        }

        return dateKey
            .split("")
            .reduce(
                (total, character) =>
                    total + character.charCodeAt(0),
                0
            );
    }


    /* =====================================================
       OBTENER MENSAJE ALTERNATIVO
       ===================================================== */

    function getFallbackMessage(config, dateKey) {
        const fallbackMessages =
            Array.isArray(config.fallbackMessages)
                ? config.fallbackMessages
                : [];

        if (fallbackMessages.length === 0) {
            return (
                "Encara que avui estiguem lluny, " +
                "hi ha una part de mi que continua " +
                "al teu costat."
            );
        }

        const dateNumber =
            createDateNumber(dateKey);

        const selectedIndex =
            dateNumber % fallbackMessages.length;

        return fallbackMessages[selectedIndex];
    }


    /* =====================================================
       FORMATEAR FECHA EN CATALÁN
       ===================================================== */

    function formatDisplayDate(date, config) {
        const locale =
            config.locale || "ca-ES";

        const formatter = new Intl.DateTimeFormat(
            locale,
            {
                timeZone: getTimeZone(config),
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

        return formatter.format(date);
    }


    /* =====================================================
       PONER LA PRIMERA LETRA EN MAYÚSCULA
       ===================================================== */

    function capitalizeFirstLetter(text) {
        if (!text) {
            return "";
        }

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }


    /* =====================================================
       TEXTO DE LA FECHA
       ===================================================== */

    function createDateLabel(date, config) {
        const todayText =
            config.texts?.today || "Avui";

        const formattedDate =
            capitalizeFirstLetter(
                formatDisplayDate(date, config)
            );

        return `${todayText} · ${formattedDate}`;
    }


    /* =====================================================
       ANIMAR CAMBIO DE MENSAJE
       ===================================================== */

    function animateMessage(element) {
        if (!element) {
            return;
        }

        element.classList.remove(
            "daily-card__quote--changed"
        );

        void element.offsetWidth;

        element.classList.add(
            "daily-card__quote--changed"
        );
    }


    /* =====================================================
       MOSTRAR MENSAJE
       ===================================================== */

    function renderMessage(elements, messageText, dateLabel) {
        if (elements.message) {
            const messageHasChanged =
                elements.message.textContent.trim() !==
                messageText.trim();

            elements.message.textContent =
                messageText;

            if (messageHasChanged) {
                animateMessage(elements.message);
            }
        }

        if (elements.date) {
            elements.date.textContent =
                dateLabel;
        }
    }


    /* =====================================================
       ACTUALIZAR MENSAJE DIARIO
       ===================================================== */

    function update(forceUpdate = false) {
        const config = getConfig();

        if (!config) {
            stop();
            return;
        }

        const elements = getElements();

        if (!elements.message) {
            console.warn(
                "No se ha encontrado el elemento #daily-message."
            );

            stop();
            return;
        }

        const currentDate =
            getCurrentDate(config);

        const dateKey =
            getDateKey(currentDate, config);

        if (
            !forceUpdate &&
            dateKey === lastDisplayedDate
        ) {
            return;
        }

        const exactMessage =
            findMessageByDate(
                config,
                dateKey
            );

        const messageText = exactMessage
            ? exactMessage.text
            : getFallbackMessage(
                config,
                dateKey
            );

        const dateLabel =
            createDateLabel(
                currentDate,
                config
            );

        renderMessage(
            elements,
            messageText,
            dateLabel
        );

        lastDisplayedDate = dateKey;
    }


    /* =====================================================
       INICIAR MENSAJES
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

        if (!elements.message) {
            console.warn(
                "No se ha encontrado el mensaje diario en el HTML."
            );

            return;
        }

        initialized = true;

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
            handleWindowFocus
        );

        window.addEventListener(
            "beforeunload",
            stop,
            { once: true }
        );
    }


    /* =====================================================
       DETENER ACTUALIZACIÓN
       ===================================================== */

    function stop() {
        if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    }


    /* =====================================================
       REINICIAR
       ===================================================== */

    function restart() {
        stop();

        initialized = false;
        lastDisplayedDate = null;

        init();
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
       VOLVER A LA VENTANA
       ===================================================== */

    function handleWindowFocus() {
        update(true);
    }


    /* =====================================================
       API PÚBLICA

       Permitirá actualizar los mensajes desde main.js
       o desde la consola del navegador.
       ===================================================== */

    window.DailyMessages = {
        init,
        update,
        stop,
        restart,
        getCurrentDate,
        getDateKey
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