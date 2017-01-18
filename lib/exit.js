/**
 * exitProgram - exit program
 *
 * @param {string} message
 */
module.exports.exitWithSuccess = function( message ) {
    Console.line()
    Console.success( message, true )
    Console.line()
}

/**
 * exitWithError - exit program with an error
 *
 * @param {string} message
 */
module.exports.exitWithError = function( title, message = '', consequence = '' ) {
    Console.error({ title, message, consequence, exit: 1 })
}
