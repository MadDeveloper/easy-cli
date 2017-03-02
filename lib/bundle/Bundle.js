const fs = require( 'fs' )
const walk = require( 'walk' )
const path = require( 'path' )
const { question } = require( 'readline-sync' )
const { transform } = require( `${easy.easyPath}/lib/string` )
const { upperFirst, lowerFirst } = require( 'lodash' )
const { Directory, File } = require( `${easy.easyPath}/fs` )

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
        this.path = path.resolve( `${this.kernel.path.bundles}/${name}` )
        this.bundlesActivationPath = path.resolve( `${kernel.path.config}/bundles/activated.js` )
        this.formattedNameCapitalized = upperFirst( name )
        this.formattedNameDecapitalized = lowerFirst( name )
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
    async exists() {
        return new Directory( this.path ).exists()
    }

    /**
     * createDirectory - create bundle directory
     *
     * @returns {Promise}
     */
    async createRootDirectory() {
        return new Directory( this.path ).create()
    }

    /**
     * selectSkeleton - select correct skeleton (custom or not)
     *
     * * @param {Skeleton} skeleton
     *
     * @returns {Promise}
     */
    async selectSkeleton( skeleton ) {
        await skeleton.selectCorrect()
        this.defineStructureSkeleton( skeleton )
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
     * activate - activate bundle into configurations
     *
     * @returns {Promise}
     */
    async activate() {
        const bundleActivationFile = new File( this.bundlesActivationPath )
        let content = await bundleActivationFile.read()
        const addBundleImport = `const ${this.formattedNameDecapitalized} = require( '../../bundles/${this.name}' )`
        const addBundleInExports = `module.exports = [\n\t${this.formattedNameDecapitalized},`

        content = `${addBundleImport}\n${content}`
        content = content.replace( /module\.exports\s*=\s*\[/gi, addBundleInExports )

        return bundleActivationFile.write( content )
    }

    /**
     * createStucture - create bundle directories and files structure from skeleton
     *
     * @returns {Promise}
     */
    createStucture() {
        const walker = walk.walk( this.skeleton.path )

        return new Promise( ( resolve, reject ) => {
            walker.on( "names", this.walkerOrderingNames )
            walker.on( "directories", ( root, dirStatsArray, next ) => this.walkerOnDirectory( root, dirStatsArray, next, reject ) )
            walker.on( "file", ( root, fileStats, next ) => this.walkerOnFile( root, fileStats, next, reject ) )
            walker.on( "errors", ( root, nodeStatsArray, next ) => next() )
            walker.on( "end", resolve )
        })
    }

    /**
     * walkerOrderingNames - ordering names when walker starts
     *
     * @param {string} root
     * @param {object} nodeNamesArray
     */
    walkerOrderingNames( root, nodeNamesArray ) {
        nodeNamesArray.sort( ( a, b ) => {
            if ( a > b ) {
                return 1
            }

            if ( a < b ) {
                return -1
            }

            return 0
        })
    }

    /**
     * walkerOnDirectory - event fired when walker find a directory
     *
     * @param {string} root
     * @param {object} dirStatsArray
     * @param {Function} next
     * @param {Function} reject
     */
    async walkerOnDirectory( root, dirStatsArray, next, reject ) {
        // dirStatsArray is an array of `stat` objects with the additional attributes
        // * type
        // * error
        // * name
        await Promise.all( dirStatsArray.map( async directoryStat => {
            const newDirectoryName = directoryStat.name.replace( /Skeleton/gi, this.formattedNameCapitalized )

            /*
             * We don't create entity folder
             */
            if ( 'entity' !== newDirectoryName ) {
                try {
                    await this.createDirectory( newDirectoryName )
                } catch ( error ) {
                    reject( `Error when creating directory: ${newDirectoryName}.\n${error}` )
                }
            }
        }) )

        next()
    }

    /**
     * createDirectory - create directory when walker has found a directory
     *
     * @param {string} newDirectoryName
     *
     * @returns {Promise}
     */
    async createDirectory( newDirectoryName ) {
        return new Directory( `${this.path}/${newDirectoryName}` ).create()
    }

    /**
     * walkerOnFile - event fired when walker find a file
     *
     * @param {string} root
     * @param {object} fileStats
     * @param {Function} next
     * @param {Function} reject
     *
     * @returns {type} Description
     */
    async walkerOnFile( root, fileStats, next, reject ) {
        const skeletonFilePath = path.join( root, fileStats.name )
        const newPath = path.resolve( `${this.path}/${skeletonFilePath.replace( this.skeleton.path, '' ).replace( /Skeleton/g, this.formattedNameCapitalized ).replace( /skeleton/g, this.formattedNameDecapitalized )}` )
        const skeletonFile = new File( skeletonFilePath )
        const content = await skeletonFile.read()
        const name = fileStats.name

        /*
         * We don't create entities file here, rather with cli when generating entity
         */
        if ( 'skeleton.js' !== name.toLowerCase() && 'skeleton.repository.js' !== name.toLowerCase() ) {
            try {
                await this.createFile( newPath, content )
                next()
            } catch ( error ) {
                reject( error )
            }
        } else {
            next()
        }
    }

    /**
     * createFile - create file when walker has found a file
     *
     * @param {string} newPath
     * @param {string} content
     *
     * @returns {Promise}
     */
    async createFile( newPath, content ) {
        content = this.replaceSkeletonTemplate( content )
        const file = new File( newPath, content )

        return file.write()
    }

    /**
     * replaceSkeletonTemplate - replace skeleton template
     *
     * @param {string} template
     *
     * @returns {string}
     */
    replaceSkeletonTemplate( template ) {
        return template.replace( /Skeleton/g, this.formattedNameCapitalized ).replace( /skeleton/g, this.formattedNameDecapitalized )
    }
}

module.exports = Bundle
