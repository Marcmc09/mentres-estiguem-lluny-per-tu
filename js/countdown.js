/* =========================================================
   MENTRE ESTIGUEM LLUNY
   Control automático del contador
   ========================================================= */

(function () {
    "use strict";

    const MILLISECONDS = {
        second: 1000,
        minute: 1000 * 60,
        hour: 1000 * 60 * 60,
        day: 1000 * 60 * 60 * 24
    };

    let intervalId = null;
    let initialized = false;

    let previewStartDate = null;
    let previewRealStartDate = null;


    /* =====================================================
       OBTENER CONFIGURACIÓN
       ===================================================== */

    function getConfig() {
        if (!window.APP_CONFIG) {
            console.error(
                "No se ha encontrado APP_CONFIG. Revisa que config.js se cargue antes que countdown.js."
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
            countdown: document.getElementById("countdown"),

            days: document.getElementById("countdown-days"),
            hours: document.getElementById("countdown-hours"),
            minutes: document.getElementById("countdown-minutes"),
            seconds: document.getElementById("countdown-seconds"),

            message: document.getElementById("countdown-message")
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
                "La fecha del contador no es válida:",
                dateValue
            );

            return null;
        }

        return parsedDate;
    }


    /* =====================================================
       FECHA ACTUAL

       Si el modo de prueba está activado, el contador
       comienza desde previewDate y continúa avanzando.
       ===================================================== */

    function getCurrentDate(config) {
        const debug = config.debug || {};

        if (!debug.enabled || !debug.previewDate) {
            return new Date();
        }

        if (!previewStartDate) {
            previewStartDate = parseDate(debug.previewDate);
            previewRealStartDate = new Date();
        }

        if (!previewStartDate || !previewRealStartDate) {
            return new Date();
        }

        const elapsedTime =
            Date.now() - previewRealStartDate.getTime();

        return new Date(
            previewStartDate.getTime() + elapsedTime
        );
    }


    /* =====================================================
       FORMATEAR NÚMEROS
       ===================================================== */

    function padNumber(number, minimumLength = 2) {
        return String(number).padStart(minimumLength, "0");
    }


    /* =====================================================
       CALCULAR TIEMPO RESTANTE
       ===================================================== */

    function calculateRemainingTime(currentDate, targetDate) {
        const difference =
            targetDate.getTime() - currentDate.getTime();

        if (difference <= 0) {
            return {
                finished: true,
                totalMilliseconds: 0,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }

        const days = Math.floor(
            difference / MILLISECONDS.day
        );

        const remainingAfterDays =
            difference % MILLISECONDS.day;

        const hours = Math.floor(
            remainingAfterDays / MILLISECONDS.hour
        );

        const remainingAfterHours =
            remainingAfterDays % MILLISECONDS.hour;

        const minutes = Math.floor(
            remainingAfterHours / MILLISECONDS.minute
        );

        const remainingAfterMinutes =
            remainingAfterHours % MILLISECONDS.minute;

        const seconds = Math.floor(
            remainingAfterMinutes / MILLISECONDS.second
        );

        return {
            finished: false,
            totalMilliseconds: difference,
            days,
            hours,
            minutes,
            seconds
        };
    }


    /* =====================================================
       ACTUALIZAR NÚMERO CON PEQUEÑA ANIMACIÓN
       ===================================================== */

    function updateNumber(element, value, minimumLength = 2) {
        if (!element) {
            return;
        }

        const formattedValue =
            padNumber(value, minimumLength);

        if (element.textContent === formattedValue) {
            return;
        }

        element.textContent = formattedValue;

        element.classList.remove("countdown__number--changed");

        void element.offsetWidth;

        element.classList.add("countdown__number--changed");
    }


    /* =====================================================
       CAMBIAR ETIQUETAS DEL CONTADOR
       ===================================================== */

    function updateLabels(config) {
        const labels =
            config.countdown?.labels || {};

        const labelElements = {
            days: document.querySelector(
                "#countdown-days + .countdown__label"
            ),

            hours: document.querySelector(
                "#countdown-hours + .countdown__label"
            ),

            minutes: document.querySelector(
                "#countdown-minutes + .countdown__label"
            ),

            seconds: document.querySelector(
                "#countdown-seconds + .countdown__label"
            )
        };

        if (labelElements.days && labels.days) {
            labelElements.days.textContent = labels.days;
        }

        if (labelElements.hours && labels.hours) {
            labelElements.hours.textContent = labels.hours;
        }

        if (labelElements.minutes && labels.minutes) {
            labelElements.minutes.textContent =
                labels.minutes;
        }

        if (labelElements.seconds && labels.seconds) {
            labelElements.seconds.textContent =
                labels.seconds;
        }
    }


    /* =====================================================
       MENSAJE DEL CONTADOR
       ===================================================== */

    function getCountdownMessage(config, remainingTime) {
        const countdownConfig =
            config.countdown || {};

        if (remainingTime.finished) {
            return (
                countdownConfig.finishedMessage ||
                "El compte enrere ha acabat."
            );
        }

        if (
            remainingTime.totalMilliseconds <=
            MILLISECONDS.day
        ) {
            return (
                countdownConfig.lastDayMessage ||
                countdownConfig.defaultMessage ||
                ""
            );
        }

        return countdownConfig.defaultMessage || "";
    }


    /* =====================================================
       TEXTO ACCESIBLE
       ===================================================== */

    function createAccessibleText(config, remainingTime) {
        const labels =
            config.countdown?.labels || {};

        if (remainingTime.finished) {
            return (
                config.countdown?.finishedMessage ||
                "El compte enrere ha acabat."
            );
        }

        return [
            remainingTime.days,
            labels.days || "Dies",

            remainingTime.hours,
            labels.hours || "Hores",

            remainingTime.minutes,
            labels.minutes || "Minuts",

            remainingTime.seconds,
            labels.seconds || "Segons"
        ].join(" ");
    }


    /* =====================================================
       ESTADO FINAL
       ===================================================== */

    function setFinishedState(elements, config) {
        updateNumber(elements.days, 0);
        updateNumber(elements.hours, 0);
        updateNumber(elements.minutes, 0);
        updateNumber(elements.seconds, 0);

        if (elements.countdown) {
            elements.countdown.classList.add(
                "countdown--finished"
            );

            elements.countdown.setAttribute(
                "aria-label",
                config.countdown?.finishedMessage ||
                    "El compte enrere ha acabat."
            );
        }

        if (elements.message) {
            elements.message.textContent =
                config.countdown?.finishedMessage ||
                "El compte enrere ha acabat.";
        }

        stop();
    }


    /* =====================================================
       ACTUALIZAR CONTADOR
       ===================================================== */

    function update() {
        const config = getConfig();

        if (!config) {
            stop();
            return;
        }

        const elements = getElements();

        if (
            !elements.countdown ||
            !elements.days ||
            !elements.hours ||
            !elements.minutes ||
            !elements.seconds
        ) {
            console.warn(
                "No se han encontrado todos los elementos del contador."
            );

            stop();
            return;
        }

        const targetDate = parseDate(
            config.countdown?.targetDate ||
            config.dates?.reunion
        );

        if (!targetDate) {
            stop();
            return;
        }

        const currentDate = getCurrentDate(config);

        const remainingTime =
            calculateRemainingTime(
                currentDate,
                targetDate
            );

        if (remainingTime.finished) {
            setFinishedState(elements, config);
            return;
        }

        elements.countdown.classList.remove(
            "countdown--finished"
        );

        updateNumber(
            elements.days,
            remainingTime.days
        );

        updateNumber(
            elements.hours,
            remainingTime.hours
        );

        updateNumber(
            elements.minutes,
            remainingTime.minutes
        );

        updateNumber(
            elements.seconds,
            remainingTime.seconds
        );

        if (elements.message) {
            elements.message.textContent =
                getCountdownMessage(
                    config,
                    remainingTime
                );
        }

        elements.countdown.setAttribute(
            "aria-label",
            createAccessibleText(
                config,
                remainingTime
            )
        );
    }


    /* =====================================================
       INICIAR CONTADOR
       ===================================================== */

    function init() {
        if (initialized) {
            update();
            return;
        }

        const config = getConfig();

        if (!config) {
            return;
        }

        const elements = getElements();

        if (!elements.countdown) {
            console.warn(
                "No se ha encontrado el elemento #countdown."
            );

            return;
        }

        initialized = true;

        updateLabels(config);
        update();

        intervalId = window.setInterval(
            update,
            MILLISECONDS.second
        );

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.addEventListener(
            "focus",
            update
        );

        window.addEventListener(
            "beforeunload",
            stop,
            { once: true }
        );
    }


    /* =====================================================
       DETENER CONTADOR
       ===================================================== */

    function stop() {
        if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    }


    /* =====================================================
       REINICIAR CONTADOR
       ===================================================== */

    function restart() {
        stop();

        initialized = false;

        previewStartDate = null;
        previewRealStartDate = null;

        init();
    }


    /* =====================================================
       CONTROL CUANDO SE CAMBIA DE PESTAÑA
       ===================================================== */

    function handleVisibilityChange() {
        if (!document.hidden) {
            update();
        }
    }


    /* =====================================================
       API PÚBLICA

       Permitirá controlar el contador desde main.js.
       ===================================================== */

    window.Countdown = {
        init,
        update,
        stop,
        restart
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