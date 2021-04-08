const multipleChoiceError = (options) => {
  return `No entiendo esa opción, vuelve a intentar una de estas opciones ${options}, escriba "regresar" para regresar a la pregunta anterior, o 'menu' para regresar al menú inicial.`;
};
module.exports = multipleChoiceError;
