const { Directory } = require( 'easy/fs' )
const walk = require( 'walk' )
const path = require( 'path' )
const { question } = require( 'readline-sync' )
const fs = require( 'fs' )

/**
 * @class Bundle
 */
class Bundle {
    /**
     * constructor -
     *
     * @param {string} name
     * @param {Kernel} kernel
     */
    constructor( name, kernel ) {
        this.name = name
        this.kernel = kernel
        this.formattedNameCapitalized = name.capitalizeFirstLetter()
        this.formattedNameDecapitalized = name.decapitalizeFirstLetter()
        this.skeleton = null
    }

    /**
     * rename - redefine bundle name
     *
     * @param {string} name
     *
     * @returns {Bbundle}
     */
    rename( name ) {
        this.name = name
        return this
    }

    /**
     * exists - check if bundle directory exists
     *
     * @returns {Promise}
     */
    exists() {
        return new Directory( `${this.kernel.path.bundles}/${this.name}` ).exists()
    }

    /**
     * createDirectory - create bundle directory
     *
     * @returns {Promise}
     */
    createDirectory() {
        return new Directory( `${this.kernel.path.bundles}/${this.name}` ).create()
    }

    /**
     * defineStructureSkeleton - define skeleton base for bundle
     *
     * @param {Skeleton} skeleton
     *
     * @returns {Bundle}
     */
    defineStructureSkeleton( skeleton ) {
        this.skeleton = skeleton

        return this
    }

    /**
     * createStucture - create bundle directories and files structure from skeleton
     *
     * @returns {Promise}
     */
    createStucture() {
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
}
