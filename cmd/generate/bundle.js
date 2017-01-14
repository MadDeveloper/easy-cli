const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { question } = require( 'readline-sync' )
const { indexOf } = require( 'lodash' )
const { Console } = require( 'easy/core' )
const { transform } = require( 'easy/lib/string' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { Bundle, Skeleton } = require( '../../lib/bundle' )

module.exports.command = 'bundle <name>'
module.exports.describe = 'Generate new bundle with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate bundle <name>' )
        .example( 'easy generate bundle test', 'Generate bundle Test from skeleton' )
        .demandCommand( 1, 'I need you provide the name of the new bundle.' )
}
module.exports.handler = argv => {
    Console.line()

    const bundleName = confirmBundleName( transform.asBundleName( argv.name ) )
    const bundle = new Bundle( bundleName, kernel )
    const skeleton = new Skeleton( kernel )

    skeleton
        .selectCorrect()
        .catch( error => exitWithError( `Skeleton bundle not found. ${error}` ) )
        .then( () => bundle.defineStructureSkeleton( skeleton ) )
        .then( () => bundle.exists() )
        .then( error => exitWithError( `${bundleName} bundle already exists. ${error}` ) )
        .catch( () => bundle.createDirectory() )
        .catch( error => exitWithError( `Error when trying to create bundle directory. ${error}` ) )
        .then( askToActivateBundle )
        .then( activate => activate ? bundle.activate() : Promise.resolve() )
        .catch( error => exitWithError( `Error when activating bundle. ${error}` ) )
        .then( () => bundle.createStucture() )
        .then( () => exitProgram( bundle ) )
        .catch( error => exitWithError( `Error when creating bundle structure. ${error}` ) )
}

/**
 * confirmBundleName - confirm if bundle name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {boolean}
 */
function confirmBundleName( name ) {
    const newName = question( `Bundle name (default: ${name}): ` ).trim()

    if ( newName.length > 0 ) {
        return newName
    }

    return name
}

/**
 * askToActivateBundle - ask if user want activate the bundle
 *
 * @returns {boolean}
 */
function askToActivateBundle() {
    const answerActivateBundle = question( 'Do you want to activate bundle? (y/n) ' ).trim().toLowerCase()

    return -1 !== indexOf( positiveAnswers, answerActivateBundle )
}

/**
 * exitProgram - exit program
 */
function exitProgram( bundle ) {
    Console.line()
    Console.success( `Bundle ${bundle.name} created.`, true )
    Console.line()
}

/**
 * exitWithError - exit program with an error
 *
 * @param {string} message
 */
function exitWithError( message ) {
    Console.error({
        title: "Impossible to create bundle",
        message,
        consequence: "Creation aborted",
        exit: 1
    })
}
