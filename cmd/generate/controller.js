const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { transform } = require( 'easy/lib/string' )
const { Console } = require( 'easy/core' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )
const { Bundle, Skeleton, Controller } = require( '../../lib/bundle' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

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
module.exports.handler = argv => {
    Console.line()

    const controllerName = confirmControllerName( transform.asClassName( argv.name ) )
    const controllerFileName = confirmControllerFileName( transform.asControllerFileName( controllerName ) )
    const bundleName = argv.bundle
    const bundle = new Bundle( bundleName, kernel )
    const skeleton = new Skeleton( kernel )
    const controller = new Controller( controllerName, controllerFileName, bundle )
    const errorInfos = {
        title: 'Impossible to create controller',
        consequence: 'Creation aborted'
    }

    skeleton
        .selectCorrect()
        .catch( error => exitWithError( errorInfos.title, `Skeleton bundle not found. ${error}`, errorInfos.consequence ) )
        .then( () => bundle.defineStructureSkeleton( skeleton ) )
        .then( () => bundle.exists() )
        .catch( error => exitWithError( errorInfos.title, `${bundle.name} bundle doesn't exists. ${error}`, errorInfos.consequence ) )
        .then( () => controller.createFile() )
        .then( () => exitWithSuccess( `Controller ${controller.name} created in bundle ${bundle.name}` ) )
        .catch( error => exitWithError( errorInfos.title, error, errorInfos.consequence ) )
}

/**
 * confirmControllerName - confirm if controller name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {boolean}
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
 * @returns {boolean}
 */
function confirmControllerFileName( fileName ) {
    const newFileName = question( `Controller file name (default: ${fileName}): ` ).trim()

    if ( newFileName.length > 0 ) {
        return newFileName
    }

    return fileName
}
