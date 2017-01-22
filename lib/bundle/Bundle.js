const fs = require( 'fs' )
const walk = require( 'walk' )
const path = require( 'path' )
const { question } = require( 'readline-sync' )
const { transform } = require( 'easy/lib/string' )
const { indexOf } = require( 'lodash' )
const { Directory, File } = require( 'easy/fs' )

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
        return new Directory( this.path ).exists()
    }

    /**
     * createDirectory - create bundle directory
     *
     * @returns {Promise}
     */
    createRootDirectory() {
        return new Directory( this.path ).create()
    }

    /**
     * selectSkeleton - select correct skeleton (custom or not)
     *
     * * @param {Skeleton} skeleton
     *
     * @returns {Promise}
     */
    selectSkeleton( skeleton ) {
        return skeleton.selectCorrect().then( () => this.defineStructureSkeleton( skeleton ) )
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
    activate() {
        const bundleActivationFile = new File( this.bundlesActivationPath )

        return bundleActivationFile
            .read()
            .then( content => {
                const addBundleImport = `const ${this.formattedNameDecapitalized} = require( 'src/bundles/${this.name}' )`
                const addBundleInExports = `module.exports$1= [\n\t${this.formattedNameDecapitalized},`

                content = `${addBundleImport}\n${content}`
                return content.replace( /module\.exports(\s*)=\s*\[/gi, addBundleInExports )
            })
            .then( content => bundleActivationFile.setContent( content ).write() )
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
    walkerOnDirectory( root, dirStatsArray, next, reject ) {
        // dirStatsArray is an array of `stat` objects with the additional attributes
        // * type
        // * error
        // * name
        dirStatsArray.forEach( directoryStat => {
            const newDirectoryName = directoryStat.name.replace( /Skeleton/gi, this.formattedNameCapitalized )

            /*
             * We don't create entity folder
             */
            if ( 'entity' !== newDirectoryName && !this.createDirectory( newDirectoryName ) ) {
                reject( `Error when creating directory: ${newDirectoryName}` )
            }
        })

        next()
    }

    /**
     * createDirectory - create directory when walker has found a directory
     *
     * @param {string} newDirectoryName
     *
     * @returns {Promise}
     */
    createDirectory( newDirectoryName ) {
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
    walkerOnFile( root, fileStats, next, reject ) {
        const skeletonFilePath = path.join( root, fileStats.name )
        const newPath = path.resolve( `${this.path}/${skeletonFilePath.replace( this.skeleton.path, '' ).replace( /Skeleton/g, this.formattedNameCapitalized ).replace( /skeleton/g, this.formattedNameDecapitalized )}` )

        const content = fs.readFileSync( skeletonFilePath, 'utf8' )
        const name = fileStats.name

        /*
         * We don't create entities file here, rather with cli when generating entity
         */
        if ( 'skeleton.js' !== name.toLowerCase() && 'skeleton.repository.js' !== name.toLowerCase() ) {
            this.createFile( newPath, content )
                .then( next )
                .catch( reject )
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
    createFile( newPath, content ) {
        content = this.replaceSkeletonTemplate( content )

        return new File( newPath, content ).write()
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
