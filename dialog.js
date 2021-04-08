var firebase = require('firebase');
var msg = require('./msg.js')
var sendMsg = msg.sendMsg
var sendVid = msg.sendVid
var sendLocation = msg.sendLocation

var geo = require('./geo.js')
var respondToLocation = geo.respondToLocation
var getLocation = geo.getLocation

var info = require('./info.js').info

const firebaseConfig = {
    apiKey: "AIzaSyBHCHvkyc4s5vfLswJFvqafsyG-zOKbSDg",
    authDomain: "vacunape-bot.firebaseapp.com",
    projectId: "vacunape-bot",
    storageBucket: "vacunape-bot.appspot.com",
    messagingSenderId: "701320629400",
    appId: "1:701320629400:web:fcbb1e1803e32b879654ed",
    measurementId: "G-7ML5X7XE6C"
}

var firebaseApp = firebase.initializeApp(firebaseConfig);
var db = firebase.database();

function end() {
    return 'init'
}

function getInfo(userInput) {
    if (userInput == 'preguntas') {
        console.log('preguntas')
        return true
    }
    next = [
    "Si quieres la respuesta a otra pregunta, escribe el número respectivo. Si quieres ver las preguntas nuevamente, escribe 'preguntas'. Para regresar al menú principal, escribe 'menu'." 
    ]
    sendMsg(info[parseInt(userInput)-1], null, next)
    return true; // return true so it goes to success state rather than error
}

function getPosition(userData, userInput) {
    console.log(userData)
    closestLocations = userData.closest_locations
    success = getLocation(userInput, closestLocations) 
    console.log(success)
    return success; // return true so it goes to success state rather than error
}

function writePosition(userData, userInput) {
    if (!('Latitude' in userInput)) {
        return false;
    }
    respondToLocation(userData, userInput, function (lst) {
        updateUser(userData, 'closest_locations', lst)
        updateUser(userData, 'num_registrations', userData.num_registrations+1)
    })

    updateUser(userData, 'position', [userInput.Latitude, userInput.Longitude])
    return true; // return true so it goes to success state rather than error
}

function writeHealth(userData, userInput) {
    console.log('WRITE HEALTH')
    elems = userInput.split(',')
    if (!elems || elems.length < 1) {
        return false;
    }
    updateUser(userData, 'health', elems)
    return true; // return true so it goes to success state rather than error
}

function writeSex(userData, userInput) {
    const sanitizedUserInput = userInput.trim();
    if (!sanitizedUserInput || sanitizedUserInput.length != 1) {
        return false;
    }
    sex = {a: 'M', b: 'F'}
    updateUser(userData, 'sex', sex[userInput])
    return true; // return true so it goes to success state rather than error
}

function writeName(idType, userData, userInput) {
    const sanitizedUserInput = userInput.trim();
    if (!sanitizedUserInput || sanitizedUserInput.length == 0) {
        return false;
    }

    updateUser(userData, idType, sanitizedUserInput)
    return true; // return true so it goes to success state rather than error
}


function writeId(idType, userData, userInput) {
    const sanitizedUserInput = userInput.trim();
    if (!sanitizedUserInput || sanitizedUserInput.length < 8) {
        return false;
    }

    updateUser(userData, idType, sanitizedUserInput)
    return true; // return true so it goes to success state rather than error
}

function writeBirth(userData, userInput) {
    const sanitizedUserInput = userInput.trim();

    // TODO: sanitize birth

    updateUser(userData, 'date_of_birth', sanitizedUserInput)
    return true; // return true so it goes to success state rather than error
}

function chau(dialogConfig, userData) {
    console.log('-----')
    console.log(userData.stateId)
    _transitionId = 'end'
    _newUserState = dialogConfig[_transitionId];
    console.log(_newUserState)
    next = [
            'Comparte esto en tus redes sociales para que tod@s sepan que eres la heroína/héroe sin capa que estamos buscando 🙌:',
`
¡Felicitaciones, has registrado a ` + userData.num_registrations + ` personas!
¡Contigo avanza Perú! 🎉
¡VAMOS PERU! 🇵🇪🇵🇪🇵🇪
👴🏽👵🏽🧔🏽👩🏻‍🦳👧🏽👶🏽
`,
'Manda cualquier texto para regresar al menu principal.'
    ]
    console.log(next)
    sendMsg(_newUserState.message, null, next=next);
    return _transitionId
}

function dialogFlow(dialogConfig, currentUserState, userData, body) {

    const userInput = body.Body
    const currentState = dialogConfig[currentUserState];
    const { transitions } = currentState;
    if (!currentState) {
        console.log(`state: ${currentState} does not exist in config`);
        return;
    }
    
    const sanitizedUserInput = userInput.trim().toLowerCase();
    
    cleanClean = sanitizedUserInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    if (cleanClean === 'menu') {
        transitionId = 'init'
        newUserState = dialogConfig[transitionId];
        sendMsg(newUserState.message);
        return transitionId;
    }

    switch (currentState.type) {
        case 'multiple_choice': {
            const transitionOptions = Object.keys(transitions)
            console.log(transitions)
            console.log(sanitizedUserInput)
            const requestedUserState = transitionOptions.includes(sanitizedUserInput) ? sanitizedUserInput : 'error';
            console.log('requestedUserState->', requestedUserState);
            const  transitionId = transitions[requestedUserState];
            const newUserState = dialogConfig[transitionId];
            console.log('new user state ->', newUserState, '\n');

            if (requestedUserState === 'error') {
                const options = transitionOptions.slice(0, transitionOptions.length - 1).join(', ')
                sendMsg('No entiendo esa opción, vuelve a intentar una de estas opciones [' + options + "] o escriba 'menu' para regresar al menú inicial.");
            } else if (currentState.callback != null) {
                currentState.callback({userData, userInput: sanitizedUserInput})
            } 
            if (userData.stateId != 'get_info' || sanitizedUserInput == 'preguntas') {
                setTimeout(function () {
                    sendMsg(newUserState.message);
                }, 1000)
            }
            return transitionId; // to be stored in user.stateId field in db
        }

        case 'text_input': {
            console.log('TEXT INPUT')
            console.log(sanitizedUserInput)
            const requestedUserState = currentState.callback({ userData, userInput: sanitizedUserInput }) ? 'success' : 'error';
            console.log(userData.stateId)
            console.log(sanitizedUserInput)
            if ((userData.stateId == 'registration_completed' || userData.stateId == 'get_position')
                && sanitizedUserInput == 'chau') {
                return chau(dialogConfig, userData)
            }
            console.log('requestedUserState->', requestedUserState);
            console.log(transitions)
            const transitionId = transitions[requestedUserState];
            console.log(transitionId)
            const newUserState = dialogConfig[transitionId];
            console.log('new user state ->', newUserState, '\n');
            if (requestedUserState === 'error' && transitionId != 'get_position') {
                sendMsg("Por favor ingresa una respuesta valida o escribe 'menu' para regresar al menú inicial.");
            }
            setTimeout(function () {
                sendMsg(newUserState.message);
            }, 1000)
            return transitionId;
        }

        case 'position': {
            if (sanitizedUserInput == 'ayuda') {
                sendVid("", img="https://i.giphy.com/media/ROvblJ07u41GXYpWOe/giphy.mp4")
                return false
            }
            const requestedUserState = currentState.callback({ userData, userInput: body }) ? 'success' : 'error';
            console.log('requestedUserState->', requestedUserState);
            const  transitionId = transitions[requestedUserState];
            const newUserState = dialogConfig[transitionId];
            console.log('new user state ->', newUserState, '\n');
            if (requestedUserState === 'error') {
                sendMsg("Por favor envía tu ubicación o escribe 'menu' para regresar al menú inicial. Si quieres un tutorial sobre cómo mandar tu ubicación desde el Whatsapp, escribe 'ayuda'.")
            } else if (transitionId != 'position') {
                sendMsg(newUserState.message);
            }
            return transitionId;
        }
        default:
            return 'init';
    }


}


function registerUser({ phoneNumber, profileName }) {
    console.log('registering user with phone number:', phoneNumber);
    db.ref('users/' + phoneNumber).set({
        phoneNumber,
        profileName,
        stateId: 'init', // new user at the beginning of the flow
        num_registrations: 0
    });
}

// https://firebase.google.com/docs/database/web/read-and-write
// TODO: this api is kind of wonky,  make it better
function updateUser(userData, key, value) {
    console.log(key, value)
    var updates = {};
    phoneNumber = userData.phoneNumber; // old and new userdata phone number should be the same lol
    updates['/users/' + phoneNumber + '/' + key] = value;
    console.log(updates)
    return firebase.database().ref().update(updates);
}



const dialogConfig = {
    init: {
        message: `
*Bienvenid@ al Whatsapp ChatBot 🤖 de "Vacuna Pe"!*

Donde podrás ayudar a vacunar a los abuelitos🧑‍🎄, abuelitas🤶, tíos👨 y tías👩. Mientras más personas *registres* y ayudes a *vacunar*💉, ¡Salvarás a más Peruan@s! Todo esto lo podrás compartir en tus redes sociales para que tod@s sepan que eres la heroína/héroe sin capa que estamos buscando 🙌

No te preocupes, tu información sólo será usada en privado y con fines médicos.

*Ahora dime, ¿cómo deseas comenzar?*

Para ayudarte escribe la *letra* para acceder a las opciones del menú:

A) Quiero registrarme o quiero registrar a alguien más
B) Quiero conocer los centros de vacunación más cercanos a mi
C) Quiero saber más sobre las vacunas
        `,
        transitions: {
            a: 'sign_up',
            b: 'init',
            c: 'get_info',
            error: 'init',
        },
        type: 'multiple_choice',
    },

    sign_up: {
        message: `
🚨¡Cuidado! Si vas a registrar a alguien más recuerda mantener el distanciamiento social de 2 metros y usar tu mascarilla😷!

Ahora, cuéntame un poco más sobre ti o sobre la persona que vas a registrar.
(Por favor escribe tal cual sale en tu documento de identidad)

¿Cuáles son tus *Nombres*? Por ejemplo: Juana Carla, Juan Carlos 
        `,

        type: 'text_input',
        callback: ({ userData, userInput }) => writeName('first_name', userData, userInput),
        transitions: {
            success: 'last_name',
            error: 'sign_up'
        }
    },

    last_name: {
        message: '¿Cuáles son tus *Apellidos?*',
        type: 'text_input',
        callback: ({ userData, userInput }) => writeName('last_name', userData, userInput),
        transitions: {
            success: 'identidad',
            error: 'last_name'
        }
    },

    identidad: {
        message: `
¿Qué *documento de identidad* utilizas?
A) DNI
B) Carnet de Extranjería 
C) Otra identificación 
        `,
        transitions: {
            a: 'dni',
            b: 'ce',
            c: 'other_document',
            error: 'identidad',
        },
        type: 'multiple_choice',
       },

    dni: {
        message: '¿Cuál es tu número de *DNI*?',
        type: 'text_input',
        callback: ({ userData, userInput }) => writeId('dni', userData, userInput),
        transitions: {
            success: 'sex',
            error: 'dni'
        }
    },

    ce: {
        message: '¿Cuál es tu número de *Carnet de Extranjería*?',
        type: 'text_input',
        callback: ({ userData, userInput }) => writeId('ce', userData, userInput),
        transitions: {
            success: 'sex',
            error: 'ce'
        }
    },

    other_document: {
        message: '¿Cuál es tu número de identificación? Por favor precisar qué tipo de documento es.',
        type: 'text_input',
        callback: ({ userData, userInput }) => writeId('other_document', userData, userInput),
        transitions: {
            success: 'sex',
            error: 'other_document',
        }
    },

    sex: {
        message: `
¿Con que *sexo* figuras en tu documento de identidad?
A) Masculino 
B) Femenino 
        `,
        callback: ({ userData, userInput }) => writeSex(userData, userInput),
        transitions: {
            a: 'date_of_birth',
            b: 'date_of_birth',
            error: 'sex'
        },
        type: 'multiple_choice',
    },

    date_of_birth: {
        message: '¿Cuál es el tu fecha de nacimiento (dd/mm/aaaa)? Por ejemplo: 28 de Julio -> 28/07/1821',
        type: 'text_input',
        callback: ({ userData, userInput }) => writeBirth(userData, userInput),
        transitions: {
            success: 'health',
            error: 'date_of_birth'
        }
    },

    health: {
        message: `
¿Tienes alguno de los siguientes diagnósticos? Escribe la letra que aplique a tu situación (para marcar más de una opción, por favor separa las letras con una coma (,). Por ejemplo: A,B,C

A) Hipertensión arterial no controlada
B) Enfermedad cardiovascular
C) Cáncer
D) Diabetes Mellitus
E) Asma moderada o grave
F) Enfermedad pulmonar crónica
G) Insuficiencia renal crónica en tratamiento con hemodiálisis
H) Obesidad Severa (IMC>40)
I) Enfermedad con tratamiento inmunosupresor
J) Ninguna
K) No estoy segur@
        `,
        type: 'text_input',
        callback: ({ userData, userInput }) => writeHealth(userData, userInput),
        transitions: {
            success: 'position',
            error: 'health',
        }
    },

    position: {
        message: `
Para poder brindarte los centros de vacunación más cercanos a tí, por favor mándame tu ubicación📍.
Es importante que esto lo hagas cuando estés en casa 🏠 o cerca de la casa para darte tus mejores opciones.

Si quieres un tutorial sobre cómo mandar tu ubicación desde el Whatsapp, escribe “ayuda”.
ara poder brindarte los centros de vacunación más cercanos a tí, por favor mándame tu ubicación📍.
Es importante que esto lo hagas cuando estés en casa 🏠 o cerca de la casa para darte tus mejores opciones.

Si quieres un tutorial sobre cómo mandar tu ubicación desde el Whatsapp, escribe “ayuda”.
        `,
        type: 'position',
        callback: ({ userData, userInput }) => writePosition(userData, userInput),
        transitions: {
            success: 'registration_completed',
            error: 'position'
        }
    },

    registration_completed: {
        message: '📍¡Ubicación recibida! ✅ Calculando centros de vacunación más cercanos…',
        type: 'text_input',
        callback: ({ userData, userInput }) => getPosition(userData, userInput),
        transitions: {
            success: 'get_position',
            done: 'end',
            error: 'registration_completed'
        }
    },
    
    get_position: {
        message: "Si deseas la ubicación de otro centro ingresa el número, sino escribe 'chau' para finalizar.",
        type: 'text_input',
        callback: ({ userData, userInput }) => getPosition(userData, userInput),
        transitions: {
            success: 'get_position',
            error: 'get_position',
            done: 'end'
        }
    },

    end: {
        message: `
Gracias por responder a todas mis preguntas 🤗. Recuerda siempre usar tu mascarilla 😷 y mantener distanciamiento social de 2 metros. 

🏆 Si has ayudado a registrar a otras personas, sobre todo abuelit@s y/o personas con comorbilidades que tengan dificultad para movilizarse, por favor no te olvides de acompañarlos a su centro de vacunación cuando les toque.

¡Únete a nuestra meta de Cobertura Vacuna pe 100%! 
             `,
        type: 'text_input',
        callback: ({ userData, userInput }) => end(),
        transitions: {
            success: 'init',
        }
    },
    get_info: {
        message: `
❓*Preguntas frequentes sobre la vacuna:*

Por favor escribe el *número* de la pregunta sobre la que quieras conocer más (entre 1-12):

1) ¿Qué son las vacunas?
2) ¿Cómo puedo confiar que una vacuna no me haga daño?
3) ¿La vacuna evita que me enferme y que me contagie?
4) ¿Cuántas dosis son y cuántos días después de la primera dosis me pongo la segunda?
5) ¿Qué efectos secundarios podrían presentarse?
6) ¿Quiénes no deben vacunarse con la vacuna contra el COVID-19?
7) ¿Qué hacer ante una reacción adversa severa a la vacuna?
8) ¿Qué aprobaciones tiene la vacuna de Sinopharm? 
9) Si me pongo la vacuna ¿ya podré volver a l
10) ¿Qué vacunas van a llegar al Perú, cuánta efectividad tienen, cuándo llegan y en qué cantidad?
11) ¿Cuándo me tocará vacunarme?
12) ¿Qué es la inmunidad de rebaño y para qué la queremos?

Para regresar al menú principal, escribe 'menu'.
        `,
        transitions: {
            1: 'get_info',
            2: 'get_info',
            3: 'get_info',
            4: 'get_info',
            5: 'get_info',
            6: 'get_info',
            7: 'get_info',
            8: 'get_info',
            9: 'get_info',
            10: 'get_info',
            11: 'get_info',
            12: 'get_info',
            preguntas: 'get_info',
            error: 'get_info',
        },
        type: 'multiple_choice',
        callback: ({ userInput }) => getInfo(userInput)
    },

};

module.exports = {
    db,
    dialogConfig,
    dialogFlow,
    updateUser,
    registerUser
}
