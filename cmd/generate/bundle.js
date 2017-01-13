const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const fs = require( 'fs' )
const walk = require( 'walk' )
const path = require( 'path' )
const { question } = require( 'readline-sync' )
const { indexOf } = require( 'lodash' )
const { Console } = require( 'easy/core' )
const { Directory } = require( 'easy/fs' )
const { transform, cleanAccents } = require( 'easy/lib/string' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )

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
    const bundlesPath = path.resolve( kernel.path.bundles )
    let skeletonBundlePath = path.resolve( `${kernel.path.root}/config/bundles/skeleton` )
    const defaultSkeletonBundlePath = path.resolve( `${kernel.path.root}/node_modules/easy/.cache/skeleton` )
    const bundlesDefinitionPath = path.resolve( `${kernel.path.config}/bundles/activated.js` )
    const formattedBundleNameCapitalized = bundleName.capitalizeFirstLetter()
    const formattedBundleNameDecapitalized = bundleName.decapitalizeFirstLetter()
    const bundlePath = path.resolve( `${bundlesPath}/${formattedBundleNameDecapitalized}` )

    /*
     * Check if bundle isn't defined yet
     */
    const bundleDirectory = new Directory( `${bundlesPath}/${formattedBundleNameDecapitalized}` )

    if ( bundleDirectory.exists() ) {
        exitWithError( `${bundleName} bundle already exists.` )
    }

    if ( !checkIfSkeletonIsDefined( skeletonBundlePath ) ) {
        if ( !checkIfDefaultSkeletonIsDefined( defaultSkeletonBundlePath ) ) {
            exitWithError( "Skeleton bundle not found." )
        }

        skeletonBundlePath = defaultSkeletonBundlePath
    }

    if ( !createBundleDirectory( bundleDirectory ) ) {
        exitWithError( "Error when trying to create bundle directory" )
    }

    changeBundleRights( bundleDirectory )
        .then( askToActivateBundle )
        .then( activate => {
            if ( activate ) {
                return activateBundle( bundleName, bundlesDefinitionPath, formattedBundleNameDecapitalized )
            } else {
                return Promise.resolve()
            }
        })
        .then( () => createBundleStructure({ skeletonBundlePath, formattedBundleNameCapitalized, formattedBundleNameDecapitalized, bundlePath }) )
        .then( () => exitProgram( bundleName ) )
        .catch( exitWithError )
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

/**
 * createBundleDirectory - create directory of the new bundle
 *
 * @returns {boolean} Description
 */
function createBundleDirectory( bundleDirectory ) {
    return bundleDirectory.create()
}

/**
 * changeBundleRights - change bundle rights with chmod
 *
 * @param {Directory} bundleDirectory
 *
 * @returns {Promise}
 */
function changeBundleRights( bundleDirectory ) {
    return new Promise( ( resolve, reject ) => {
        fs.chmod( bundleDirectory.path, parseInt( 755, 8 ), error => {
            error ? reject( error ) : resolve()
        })
    })
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
 * activateBundle - activate bundle into configurations
 *
 * @param {string} bundleName
 * @param {string} bundlesDefinitionPath
 * @param {string} formattedBundleNameDecapitalized
 *
 * @returns {Promise}
 */
function activateBundle( bundleName, bundlesDefinitionPath, formattedBundleNameDecapitalized ) {
    return new Promise( ( resolve, reject ) => {
        fs.readFile( bundlesDefinitionPath, { encoding: 'utf8' }, ( error, data ) => {
            if ( error ) {
                reject( error )
                return
            }

            const addBundleImport = `const ${formattedBundleNameDecapitalized} = require( 'src/bundles/${bundleName}' )`
            data = `${addBundleImport}\n${data}`

            const addBundleImportInExports = `module.exports$1= [\n\t${formattedBundleNameDecapitalized},`
            data = data.replace( /module\.exports(\s*)=\s*\[/gi, addBundleImportInExports )

            fs.writeFile( bundlesDefinitionPath, data, { encoding: 'utf8' }, error => {
                error ? reject( error ) : resolve()
            })
        })
    })

}

/**
 * createBundleStructure - create bundle structure (files, directories)
 *
 * @param {type}   { skeletonBundlePath
 * @param {type}   formattedBundleNameCapitalized
 * @param {type}   formattedBundleNameDecapitalized
 * @param {type}   bundlePath }
 *
 * @returns {Promise}
 */
function createBundleStructure({ skeletonBundlePath, formattedBundleNameCapitalized, formattedBundleNameDecapitalized, bundlePath }) {
    const walker = walk.walk( skeletonBundlePath )

    return new Promise( ( resolve, reject ) => {
        walker.on( "names", ( root, nodeNamesArray ) => {
            nodeNamesArray.sort( ( a, b ) => {
                if ( a > b ) {
                    return 1
                }

                if ( a < b ) {
                    return -1
                }

                return 0
            })
        })

        walker.on( "directories", ( root, dirStatsArray, next ) => {
            // dirStatsArray is an array of `stat` objects with the additional attributes
            // * type
            // * error
            // * name
            dirStatsArray.forEach( directoryStat => {
                const newDirectoryName = directoryStat.name.replace( /Skeleton/gi, formattedBundleNameCapitalized )

                /*
                 * We don't create entity folder
                 */
                if ( 'entity' !== newDirectoryName ) {
                    fs.mkdir( `${bundlePath}/${newDirectoryName}`, error => {
                        if ( error ) {
                            reject( error )
                        }

                        try {
                            fs.chmodSync( `${bundlePath}/${newDirectoryName}`, parseInt( 755, 8 ) )
                        } catch ( chmodError ) {
                            reject( chmodError )
                        }
                    })
                }
            })

            next()
        })

        walker.on( "file", ( root, fileStats, next ) => {
            const skeletonFilePath = path.join( root, fileStats.name )
            const newBundleFilePath = path.resolve( `${bundlePath}${skeletonFilePath.replace( skeletonBundlePath, '' ).replace( /Skeleton/g, formattedBundleNameCapitalized ).replace( /skeleton/g, formattedBundleNameDecapitalized )}` )

            let data = fs.readFileSync( skeletonFilePath, 'utf8' )
            const filename = fileStats.name

            /*
             * We don't create entities file here, rather with cli when generating entity
             */
            if ( 'skeleton.js' !== filename.toLowerCase() && 'skeleton.repository.js' !== filename.toLowerCase() ) {
                fs.writeFile( newBundleFilePath, data.replace( /Skeleton/g, formattedBundleNameCapitalized ).replace( /skeleton/g, formattedBundleNameDecapitalized ), { encoding: 'utf8' }, error => {
                    if ( error ) {
                        reject( error )
                        return
                    }

                    fs.chmod( newBundleFilePath, parseInt( 755, 8 ), error => {
                        if ( error ) {
                            reject( error )
                            return
                        }

                        next()
                    })
                })
            }

            next()
        })

        walker.on( "errors", ( root, nodeStatsArray, next ) => next() )
        walker.on( "end", resolve )
    })
}

/**
 * exitProgram - exit program
 */
function exitProgram( bundleName ) {
    Console.line()
    Console.success( `Bundle ${bundleName} created.`, true )
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
