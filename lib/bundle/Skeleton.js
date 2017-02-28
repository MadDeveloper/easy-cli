const { Directory, File } = require( `${easy.easyPath}/fs` )
const path = require( 'path' )
const { exec } = require( 'child_process' )
const download = require( 'download-git-repo' )
const copydir = require( 'copy-dir' )

/**
 * @class Skeleton
 */
class Skeleton {
    /**
     * @constructor
     *
     * @param {Kernel} kernel
     */
    constructor( kernel ) {
        this.defaultPath = path.resolve( `${kernel.path.root}/node_modules/easy/.cache/skeleton` )
        this.customPath = path.resolve( `${kernel.path.config}/bundles/skeleton` )
        this.path = this.defaultPath
    }

    /**
     * exists - check if Skeleton bundle path exists
     *
     * @returns {Promise}
     */
    async exists() {
        return new Directory( this.path ).exists()
    }

    /**
     * selectCorrect - determine correct skeleton (custom or default)
     *
     * @returns {Promise}
     */
    async selectCorrect() {
        const isDefined = await this.checkIfCustomIsDefined()

        if ( isDefined ) {
            this.selectCustom()
        } else {
            this.selectDefault()
        }
    }

    /**
     * checkIfCustomIsDefined - check if skeleton directory exists in config
     *
     * @returns {Promise}
     */
    async checkIfCustomIsDefined() {
        return new Directory( this.customPath ).exists()
    }

    /**
     * selectCustom - set path branched on custom path
     *
     * @returns {Skeleton}
     */
    selectCustom() {
        this.path = this.customPath

        return this
    }

    /**
     * selectDefault - set path branched on default path
     *
     * @returns {Skeleton}
     */
    selectDefault() {
        this.path = this.defaultPath

        return this
    }

    /**
     * remove custom skeleton directory if exists
     *
     * @memberOf Skeleton
     */
    async removeInConfigurations() {
        const customSkeletonDirectory = new Directory( this.customPath )
        const exists = await customSkeletonDirectory.exists()

        if ( exists ) {
            return customSkeletonDirectory.delete()
        }

        return true
    }

    /**
     * Import default skeleton into configurations
     *
     * @returns {Promise}
     *
     * @memberOf Skeleton
     */
    importDefault() {
        return new Promise( ( resolve, reject ) => {
            copydir( this.defaultPath, this.customPath, error => {
                if ( error ) {
                    reject( `Error when copying default skeleton in configurations.\n${error}` )
                } else {
                    resolve()
                }
            })
        })
    }

    /**
     * Download skeleton into configurations from repository
     *
     * @param {string} url
     *
     * @returns {Promise}
     *
     * @memberOf Skeleton
     */
    async downloadFromRepository( url ) {
        return new Promise( ( resolve, reject ) => {
            download( url, this.customPath, async error => {
                if ( error ) {
                    reject( `Error when downloading skeleton bundle repository from ${url}.\n${error}` )
                } else {
                    const licence = new File( `${this.customPath}/LICENSE` )
                    const readme = new File( `${this.customPath}/README.md` )

                    try {
                        await licence.delete()
                        await readme.delete()

                        resolve()
                    } catch ( err ) {
                        reject( err )
                    }
                }
            })
        })
    }
}

module.exports = Skeleton
