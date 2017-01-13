const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const fs = require( 'fs' )
const walk = require( 'walk' )
const path = require( 'path' )
const { question } = require( 'readline-sync' )
const { indexOf } = require( 'lodash' )
const { Console } = require( 'easy/core' )
const { Directory } = require( 'easy/fs' )
const { transformAsBundleName, asSnakeCase, cleanAccents } = require( 'easy/lib/string' )

module.exports.command = 'bundle <name>'
module.exports.describe = 'Generate new bundle with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate bundle <name>' )
        .example( 'easy generate bundle test', 'Generate bundle Test from skeleton' )
        .demandCommand( 1, 'I need you provide the name of the new bundle.' )
}
module.exports.handler = argv => {
    const schemaDatabaseService = application.container.get( 'database.schema' )
    const bundleName = argv.name
    console.log( argv )
    process.exit()

    const positiveAnswers = [ 'y', 'ye', 'yes' ]
    const negativeAnswers = [ 'n', 'no' ]
    const bundlesPath = path.resolve( kernel.path.bundles )

    const skeletonBundlePath = path.resolve( `${kernel.path.root}/config/bundles/skeleton` )
    const defaultSkeletonBundlePath = path.resolve( `${kernel.path.root}/node_modules/easy/.cache/bundles/skeleton` )
    const bundlesDefinitionPath = path.resolve( `${kernel.path.config}/bundles/activated.js` )

    const formattedBundleName = transformAsBundleName( bundleName )
    const formattedBundleNameCapitalized = formattedBundleName.capitalizeFirstLetter()
    const formattedBundleNameDecapitalized = formattedBundleName.decapitalizeFirstLetter()
    const bundlePath = path.resolve( `${bundlesPath}/${formattedBundleNameDecapitalized}` )

    /*
     * Check if bundle isn't defined yet
     */
    const bundleDirectory = new Directory( `${bundlesPath}/${formattedBundleNameDecapitalized}` )

    if ( bundleDirectory.exists() ) {
        exitWithError( `${formattedBundleNameCapitalized} bundle already exists.` )
    }

    if ( !checkIfSkeletonIsDefined() ) {
        exitWithError( "Skeleton bundle not found." )
    }

    if ( !createBundleDirectory() ) {
        exitWithError( "Error when trying to create bundle directory" )
    }

    if ( askToActivateBundle() ) {
        activateBundle( bundlesDefinitionPath )
    }

    changeBundleRights( bundleDirectory )
        .then( () => {
            if ( askToActivateBundle() ) {
                return activateBundle( bundleName, bundlesDefinitionPath, formattedBundleName )
            }

            return true
        })
        .then( () => createBundleStructure({ skeletonBundlePath, formattedBundleNameCapitalized, formattedBundleNameDecapitalized, bundlePath }) )
        .then( exitProgram )
        .catch( exitWithError )
}

/**
 * checkIfSkeletonIsDefined - check if skeleton directory exists in config
 *
 * @returns {boolean}
 */
function checkIfSkeletonIsDefined() {
    const skeletonDirectory = new Directory( skeletonBundlePath )

    if ( !skeletonDirectory.exists() ) {
        return checkIfDefaultSkeletonIsDefined()
    }

    return true
}

/**
 * checkIfDefaultSkeletonIsDefined - check if default skeleton exists (easy skeleton)
 *
 * @returns {boolean}
 */
function checkIfDefaultSkeletonIsDefined() {
    return new Directory( defaultSkeletonBundlePath ).exists()
}

/**
 * createBundleDirectory - create directory of the new bundle
 *
 * @returns {Promise} Description
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

            const addBundleImportInExports = `module.exports$1 = [\n\t${formattedBundleNameDecapitalized},\n`
            data = data.replace( /module\.exports(\s*)/gi, addBundleImportInExports )

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
                const newDirectoryName = directoryStat.name.replace( /Skeleton/gi, formattedBundleNameCapitalized );

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
            })

            next()
        })

        walker.on( "file", ( root, fileStats, next ) => {
            const skeletonFilePath = path.join( root, fileStats.name )
            const newBundleFilePath = path.resolve( `${bundlePath}${skeletonFilePath.replace( skeletonBundlePath, '' ).replace( /Skeleton/g, formattedBundleNameCapitalized ).replace( /skeleton/g, formattedBundleNameDecapitalized )}` )

            try {
                let data = fs.readFileSync( skeletonFilePath, 'utf8' )
                const filename = fileStats.name

                /*
                 * We don't create entities file here, rather with cli when generating entity
                 */
                if ( -1 === filename.toLowerCase().indexOf( 'skeleton.js' ) && -1 === filename.toLowerCase().indexOf( 'skeleton.repository.js' ) ) {
                    fs.writeFileSync( newBundleFilePath, data.replace( /Skeleton/g, formattedBundleNameCapitalized ).replace( /skeleton/g, formattedBundleNameDecapitalized ), { encoding: 'utf8' })
                    fs.chmodSync( newBundleFilePath, parseInt( 755, 8 ) )
                }

                next()
            } catch( error ) {
                reject( error )
            }
        })

        walker.on( "errors", ( root, nodeStatsArray, next ) => next() )
        walker.on( "end", resolve )
    })
}

/**
 * exitProgram - exit program
 */
function exitProgram() {
    Console.line()
    Console.success( `Bundle ${formattedBundleNameCapitalized} created.`, true )
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
