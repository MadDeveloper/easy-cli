const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { question } = require( 'readline-sync' )
const { indexOf } = require( 'lodash' )
const { Console } = require( 'easy/core' )
const { transform } = require( 'easy/lib/string' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { Bundle, Skeleton } = require( '../../lib/bundle' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

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

    const errorInfos = {
        title: 'Impossible to create bundle',
        consequence: 'Creation aborted'
    }

    bundle
        .selectSkeleton( skeleton )
        .catch( error => exitWithError( errorInfos.title, `Skeleton bundle not found. ${error}`, errorInfos.consequence ) )
        .then( () => bundle.exists() )
        .then( error => exitWithError( errorInfos.title, `${bundleName} bundle already exists. ${error}`, errorInfos.consequence ) )
        .catch( () => bundle.createRootDirectory() )
        .catch( error => exitWithError( errorInfos.title, `Error when trying to create bundle directory. ${error}`, errorInfos.consequence ) )
        .then( askToActivateBundle )
        .then( activate => activate ? bundle.activate() : Promise.resolve() )
        .catch( error => exitWithError( errorInfos.title, `Error when activating bundle. ${error}`, errorInfos.consequence ) )
        .then( () => bundle.createStucture() )
        .then( () => exitWithSuccess( `Bundle ${bundle.name} created.` ) )
        .catch( error => exitWithError( errorInfos.title, `Error when creating bundle structure. ${error}`, errorInfos.consequence ) )
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
