/* =========================================================
   MENTRE ESTIGUEM LLUNY
   Configuración general de la página

   Aquí podrás cambiar:
   - Fechas
   - Mensajes. 
   - Sorpresas
   - Archivos PDF
   - Textos generales
   ========================================================= */

window.APP_CONFIG = {

    /* =====================================================
       INFORMACIÓN GENERAL
       ===================================================== */

    appName: "Mentre estiguem lluny",

    locale: "ca-ES",

    version: "1.0.0",

    names: {
        recipient: "",
        sender: ""
    },


    /* =====================================================
       FECHAS PRINCIPALES

       El contador terminará el 30 de agosto de 2026.
       La hora está configurada a las 10:00 en España.
       ===================================================== */

    dates: {
        experienceStart: "2026-08-03T00:00:00+02:00",

        reunion: "2026-08-30T10:00:00+02:00"
    },


    /* =====================================================
       MODO DE PRUEBA

       previewDate permite simular una fecha concreta.

       Uso normal:
       previewDate: null

       Para probar, por ejemplo, el día 10 de agosto:
       previewDate: "2026-08-10T12:00:00+02:00"
       ===================================================== */

    debug: {
        enabled: false,
        previewDate: "null"
    },


    /* =====================================================
       CONTADOR
       ===================================================== */

    countdown: {
        targetDate: "2026-08-30T10:00:00+02:00",

        defaultMessage:
            "Cada segon és un segon menys per tornar-te a veure.",

        lastDayMessage:
            "Ja només falta un dia per tornar-nos a veure.",

        finishedMessage:
            "El compte enrere ha acabat. Per fi tornem a estar junts.",

        labels: {
            days: "Dies",
            hours: "Hores",
            minutes: "Minuts",
            seconds: "Segons"
        }
    },


    /* =====================================================
       MENSAJES DIARIOS

       Se mostrará el mensaje correspondiente a cada fecha.

       Si una fecha no tiene mensaje propio, se utilizará uno
       de los mensajes alternativos de fallbackMessages.
       ===================================================== */

    dailyMessages: [
        {
            date: "2026-08-01",
            text:
                "Testimooo moltisisim, ets la millor."
        },

        {
            date: "2026-08-02",
            text:
                "Recorda que sempre estare per tu i que testimoo moltisism i ets la millor"
        },

        {
            date: "2026-08-03",
            text:
                "Avui comença aquest espai que he fet perque em recordis durant el viatge. Perquè, encara que estiguem lluny, puguis sentir-me més a prop."
        },

        {
            date: "2026-08-04",
            text:
                "Només ha passat un dia i ja tinc ganes de tornar a veure el teu somriure."
        },

        {
            date: "2026-08-05",
            text:
                "Ets la persona que, fins i tot lluny, continues fent que qualsevol dia sigui millor."
        },

        {
            date: "2026-08-06",
            text:
                "Avui és el meu aniversari 🤓 , el millor regal d'aquest any ha estat trobar-te a tu."
        },

        {
            date: "2026-08-07",
            text:
                "Espero que aquest primers dies per Londres vaigin molt be, i ja em trobis una miqueta a faltar jejejejej 🙄 "
        },

        {
            date: "2026-08-08",
            text:
                "Avui es un bon dia per recordar que ets la millor i que ets molt important per mi. Em fas molt feliç."
        },

        {
            date: "2026-08-09",
            text:
                "Avui es l'utim dia que tenim el mateix horari, demà ja no 🙃. Recorda que t'estimo moltissim i que et trobo a faltar."
        },

        {
            date: "2026-08-10",
            text:
                "Avui comença el meu viatge. Ja que no et puc portar a la maleta et portare al meu cor. Ojala puguessis venir🤓🫠"
        },

        {
            date: "2026-08-11",
            text:
                "Potser avui no puc abraçar-te, però sí recordar-te que ets una de les coses més especials dels meus dies."
        },

        {
            date: "2026-08-12",
            text:
                "Avui fem 3 mesos, ja que no ens podem veure t'he preparat una petita sorpresa."
        },

        {
            date: "2026-08-13",
            text:
                "Avui només volia dirte una cosa: et trobo a faltar amor, vull veuret."
        },

        {
            date: "2026-08-14",
            text:
                "Quan tornem, tindrem moltes coses a explicar-nos i a fer. Aixi que ves pensant jejejejej"
        },

        {
            date: "2026-08-15",
            text:
                "Ja hem arribat a la meitat. Recorda que t'estimo moltissim mi bebe guapa. M'encanta com em fas sentir."
        },

        {
            date: "2026-08-16",
            text:
                "M'encanta com has arribat a la meva vida, mai te'n vagis."
        },

        {
            date: "2026-08-17",
            text:
                "Espero que avui haguisd tingut un dia fenomenal!!!. Recorda que aquí tens algú pensant en tu jejejejejej."
        },

        {
            date: "2026-08-18",
            text:
                "Estar amb tu converteix un moment normal en un moment molt especial.Per aixo hauries de estar amb mi ara."
        },

        {
            date: "2026-08-19",
            text:
                "Quan em trobis a faltar avui, pensa en totes les coses que farem quan tornem a estar junts. "
        },

        {
            date: "2026-08-20",
            text:
                "Hi ha persones que la sort li arriba amb un 🍀, i a mi mha arribat amb tu. Gracies per ser com ets i per fer-me sentir com em fas sentir."
        },

        {
            date: "2026-08-21",
            text:
                "No sé com serà el moment de tornar-nos a veure, però sé que molara i sera especial perque estas tu🤓"
        },

        {
            date: "2026-08-22",
            text:
                "Demà acaba el teu super mega viatge, ja el farem jo i tu junts 😉 " 
        },

        {
            date: "2026-08-23",
            text:
                "Avui tornes de Londres. Despres d'aquest gran viatge et toca tornar a gaudir del gran poble que es El Masnou!!"
        },

        {
            date: "2026-08-24",
            text:
                "Ja falta menys d’una setmana per veure el millor somriure del món. T'estimooooo"
        },

        {
            date: "2026-08-25",
            text:
                "Despres del teu gran viatge, ara et toca a tu esperarme a mi 😎🥰.Bona sort bebe."
        },

        {
            date: "2026-08-26",
            text:
                "Queden molt pocs dies i tinc moltes ganes de tornar a poder passar dies senser amb tu."
        },

        {
            date: "2026-08-27",
            text:
                "Avui es un bon dia per recordar lo molt que testimo i lo molt que m’agrada estar amb tu. Ets la millor."
        },

        {
            date: "2026-08-28",
            text:
                "Només dos dies. Ja queda molt poc per poder tornar-te a abraçar. Grcaias per formar part de la meva vida"
        },

        {
            date: "2026-08-29",
            text:
                "No hi han paraules suficients per explicar les ganes que tinc de tornar-te a veure. Només queda un dia jejeje!!."
        },

        {
            date: "2026-08-30",
            text:
                "El compte enrere s’ha acabat. Avui ja no toca imaginar estar amb tu. Avui toca tornar-te a veure."
        }

    ],


    /* =====================================================
       MENSAJES ALTERNATIVOS

       Se utilizan antes del 3 de agosto, después del 30
       o cuando no existe un mensaje para una fecha.
       ===================================================== */

    fallbackMessages: [
        "Encara que avui estiguem lluny, hi ha una part de mi que continua al teu costat.",

        "Cada dia que passa és un dia menys per tornar-nos a veure.",

        "Et trobo a faltar, però m’encanta saber que tenim alguna cosa tan bonica per esperar.",

    ],


    /* =====================================================
       SORPRESAS

       Cada sorpresa contiene:
       - id: identificador único
       - number: número que aparece en pantalla
       - unlockDate: día en que se desbloquea
       - title: título
       - description: descripción
       - pdf: ruta del archivo PDF
       - buttonText: texto del botón
       ===================================================== */

    surprises: [

        {
            id: "surprise-01",

            number: "01",

            unlockDate: "2026-08-03",

            displayDate: "3 d’agost",

            title: "Una carta per començar",

            description:
                "Una carta per al primer dia que estiguem lluny.",

            featuredDescription:
                "Hi ha coses que es diuen millor amb una carta. ",

            pdf: "pdf/sorpresa-01.pdf",

            buttonText: "Llegir la carta"
        },

        {
            id: "surprise-02",

            number: "02",

            unlockDate: "2026-08-06",

            displayDate: "6 d’agost",

            title: "Un dia molt especial",

            description:
                "Una sorpresa preparada per a un dia especial. I que no has pugut ser-hi.",

            featuredDescription:
                "Avui és un dia especial i volia compartir-ne una part amb tu.",

            pdf: "pdf/sorpresa-02.pdf",

            buttonText: "Obrir la sorpresa"
        },

        {
            id: "surprise-03",

            number: "03",

            unlockDate: "2026-08-12",

            displayDate: "... d’agost",

            title: "Per sentir-nos més a prop",

            description:
                "Una sorpresa per recordar tot el viscut.",

            featuredDescription:
                "Les imatges valen mes que mil paraules 🤓🤓.",

            pdf: "pdf/sorpresa-03.pdf",

            buttonText: "Descobrir-la"
        },

        {
            id: "surprise-04",

            number: "04",

            unlockDate: "2026-08-20",

            displayDate: "... d’agost",

            title: "Ja queda menys",

            description:
                "Una petita cosa per als dies que ens trobem a faltar.",

            featuredDescription:
                "Per als moments en què la distància sembli molt gran.",

            pdf: "pdf/sorpresa-04.pdf",

            buttonText: "Obrir la sorpresa"
        },

       {
            id: "surprise-05",

            number: "05",

            unlockDate: "2026-08-26",

            displayDate: "... d’agost",

            title: "Una sorpresa, sorpresa🤓",

            description:
                "Una nova sorpresa que segurament no t'esperaves.",

            featuredDescription:
                "Una nova sorpresa que segurament no t'esperaves.",

            pdf: "pdf/sorpresa-06.pdf",

            buttonText: "Obrir la sorpresa"
        },
       
        {
            id: "surprise-06",

            number: "06",

            unlockDate: "2026-08-29",

            displayDate: "29 d’agost",

            title: "Tornem",

            description:
                "L’última sorpresa abans de tornar-nos a veure.",

            featuredDescription:
                "El compte enrere s’ha acabat. Aquesta es última sorpresa, espero que tagradi.",

            pdf: "pdf/sorpresa-05.pdf",

            buttonText: "Obrir l’última sorpresa"
        }

    ],


    /* =====================================================
       TEXTOS DE ESTADO
       ===================================================== */

    texts: {

        today: "Avui",

        featuredAvailable: "Disponible avui",

        latestAvailable: "Ja disponible",

        locked: "Tancada",

        opened: "Oberta",

        surprisePrefix: "Sorpresa",

        openSurprise: "Obrir la sorpresa",

        noSurpriseAvailable:
            "La primera sorpresa encara no està disponible.",

        modal: {
            eyebrow: "Encara no",

            title: "Aquesta sorpresa està tancada",

            description:
                "Hauràs d’esperar una mica més per descobrir-la.",

            button: "Espera amb paciència"
        }

    }

};
