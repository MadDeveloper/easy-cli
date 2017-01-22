const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { transform } = require( 'easy/lib/string' )
const { Console } = require( 'easy/core' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )
const { Bundle, Skeleton, Controller } = require( '../../lib/bundle' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

module.exports.command = 'service <name>'
module.exports.describe = 'Generate new service with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate service <name>' )
        .example( 'easy generate service myService', 'Generate service myService' )
        .demandCommand( 1, 'Please, provide me the name of the service and everything will be ok.' )
}
module.exports.handler = argv => {}

/**
 * confirmServiceName - confirm if service name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {boolean}
 */
function confirmServiceName( name ) {
    const newName = question( `Service name (default: ${name}): ` ).trim()

    if ( newName.length > 0 ) {
        return newName
    }

    return name
}

/**
 * confirmServiceFileName - confirm if service file name transformed correspond to user attempts
 *
 * @param {string} fileName
 *
 * @returns {boolean}
 */
function confirmServiceFileName( fileName ) {
    const newFileName = question( `Service file name (default: ${fileName}): ` ).trim()

    if ( newFileName.length > 0 ) {
        return newFileName
    }

    return fileName
}
