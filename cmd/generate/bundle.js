const { application } = require( `${easy.easyPath}/bootstrap` )
const { question } = require( 'readline-sync' )
const { transform } = require( `${easy.easyPath}/lib/string` )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { Bundle, Skeleton } = require( '../../lib/bundle' )
const { displaySuccess, displayError } = require( '../../lib/display' )
const kernel = application.kernel

module.exports.command = 'bundle <name>'
module.exports.describe = 'Generate new bundle with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate bundle <name>' )
        .example( 'easy generate bundle test', 'Generate bundle Test from skeleton' )
        .demandCommand( 1, 'I need you provide the name of the new bundle.' )
}
module.exports.handler = async argv => {
    const bundleName = confirmBundleName( transform.asBundleName( argv.name ) )
    const bundle = new Bundle( bundleName, kernel )
    const skeleton = new Skeleton( kernel )
    const errorInfos = {
        title: 'Impossible to create bundle',
        consequence: 'Creation aborted'
    }

    try {
        await bundle.selectSkeleton( skeleton )
        const exists = await bundle.exists()

        if ( exists ) {
            throw new Error( `${bundleName} bundle already exists` )
        }

        await bundle.createRootDirectory()

        const activate = askToActivateBundle()

        if ( activate ) {
            await bundle.activate()
        }

        await bundle.createStucture()
        displaySuccess( `Bundle ${bundle.name} created.` )
    } catch ( error ) {
        displayError( errorInfos.title, error, errorInfos.consequence )
    }
}

/**
 * confirmBundleName - confirm if bundle name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {string}
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

    return positiveAnswers.includes( answerActivateBundle )
}
