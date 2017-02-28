const { Console } = require( `${easy.easyPath}/core` )

/**
 * exitProgram - exit program
 *
 * @param {string} message
 */
module.exports.exitWithSuccess = message => {
    Console.line()
    Console.success( message, true )
    Console.line()
    Console.line()
}

/**
 * exitWithError - exit program with an error
 *
 * @param {string} message
 */
module.exports.exitWithError = ( title, message = '', consequence = '' ) => {
    Console.error({ title, message, consequence, exit: 1 })
}
