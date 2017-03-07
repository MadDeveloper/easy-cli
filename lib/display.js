const chalk = require( 'chalk' )

/**
 * Exit program with a success message
 *
 * @param {string} message
 */
module.exports.displaySuccess = message => {
    console.log( chalk.green( `\n${message}` ) )
}

/**
 * Exit the program with an error
 *
 * @param {string} message
 */
module.exports.displayError = ( title, message = '', consequence = '' ) => {
    console.log( `\n${chalk.red( chalk.underline( title ) )}` )

    if ( message.length > 0 ) {
        console.log( chalk.red( `  -> ${message}` ) )
    }

    if ( consequence.length > 0 ) {
        console.log( chalk.red( `  -> ${consequence}` ) )
    }
}
