const QUESTION= `
Por favor revisa que los siguientes datos sean correctos: 
DNI: {{DNI}}
Nombres: {{NAMES}}
Apellidos: {{LAST_NAME}}

A) La información es correcta ✅
B) Esta información no es correcta ❌
`

const ANSWER_OK = `
¡Datos validados correctamente! 💪
`
const ANSWER_NOT_VALID =`
Lo siento, no pude verificar los datos. Por favor, ¡vuelve a intentarlo!
`
module.exports ={
  QUESTION,
  ANSWER_OK,
  ANSWER_NOT_VALID
}