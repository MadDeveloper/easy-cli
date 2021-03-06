const { application } = require( `${easy.easyPath}/bootstrap` )
const { transform } = require( `${easy.easyPath}/lib/string` )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )
const { Bundle, Skeleton, Controller } = require( '../../lib/bundle' )
const { displaySuccess, displayError } = require( '../../lib/display' )
const kernel = application.kernel

module.exports.command = 'controller <name> [bundle]'
module.exports.describe = 'Generate new controller with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate controller <name> [bundle]' )
        .example( 'easy generate controller myController --bundle test', 'Generate controller myController in bundle test' )
        .option( 'bundle', {
            alias: [ 'b' ],
            describe: 'Associated bundle',
            demand: true
        })
        .demandCommand( 1, 'I need the name of the controller you want to create.' )
}
module.exports.handler = async argv => {
    const controllerName = confirmControllerName( transform.asControllerName( argv.name ) )
    const controllerFileName = confirmControllerFileName( transform.asControllerFileName( controllerName ) )
    const bundleName = argv.bundle
    const bundle = new Bundle( bundleName, kernel )
    const skeleton = new Skeleton( kernel )
    const controller = new Controller( controllerName, controllerFileName, bundle )
    const errorInfos = {
        title: 'Impossible to create controller',
        consequence: 'Creation aborted'
    }

    try {
        await bundle.selectSkeleton( skeleton )

        const exists = await bundle.exists()

        if ( !exists ) {
            throw new Error( `${bundleName} bundle doesn't exists` )
        }

        await controller.createFile()
        displaySuccess( `Controller ${controller.name} created in bundle ${bundle.name}` )
    } catch ( error ) {
        displayError( errorInfos.title, error, errorInfos.consequence )
    }
}

/**
 * confirmControllerName - confirm if controller name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {string}
 */
function confirmControllerName( name ) {
    const newName = question( `Controller name (default: ${name}): ` ).trim()

    if ( newName.length > 0 ) {
        return newName
    }

    return name
}

/**
 * confirmControllerName - confirm if controller file name transformed correspond to user attempts
 *
 * @param {string} fileName
 *
 * @returns {string}
 */
function confirmControllerFileName( fileName ) {
    const newFileName = question( `Controller file name (default: ${fileName}): ` ).trim()

    if ( newFileName.length > 0 ) {
        return newFileName
    }

    return fileName
}
