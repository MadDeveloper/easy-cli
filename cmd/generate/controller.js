const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { transform } = require( 'easy/lib/string' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )

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
    const controller = confirmControllerName( transform.asClassName( argv.name ) )
    const bundle = argv.bundle

    let skeletonBundlePath = path.resolve( `${kernel.path.root}/config/bundles/skeleton` )
    const defaultSkeletonBundlePath = path.resolve( `${kernel.path.root}/node_modules/easy/.cache/skeleton` )

    if ( !checkIfSkeletonIsDefined( skeletonBundlePath ) ) {
        if ( !checkIfDefaultSkeletonIsDefined( defaultSkeletonBundlePath ) ) {
            exitWithError( "Skeleton bundle not found." )
        }

        skeletonBundlePath = defaultSkeletonBundlePath
    }
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
 * checkIfSkeletonIsDefined - check if skeleton directory exists in config
 *
 * @returns {boolean}
 */
function checkIfSkeletonIsDefined( skeletonBundlePath, defaultSkeletonBundlePath ) {
    return new Directory( skeletonBundlePath ).exists()
}

/**
 * checkIfDefaultSkeletonIsDefined - check if default skeleton exists (easy skeleton)
 *
 * @returns {boolean}
 */
function checkIfDefaultSkeletonIsDefined( defaultSkeletonBundlePath ) {
    return new Directory( defaultSkeletonBundlePath ).exists()
}
