const walk = require( 'walk' )
const { Directory, File } = require( 'easy/fs' )
const path = require( 'path' )

/**
 * @class Skeleton
 */
class Skeleton {
    /**
     * constructor
     *
     * @param {string} [path=easy/.cache/skeleton]
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
    exists() {
        return new Directory( this.path ).exists()
    }

    /**
     * selectCorrect - determine correct skeleton (custom or default)
     *
     * @returns {Promise}
     */
    selectCorrect() {
        return this
            .checkIfCustomIsDefined()
            .then( () => this.selectCustom() )
            .catch( () => this.selectDefault() )
    }

    /**
     * checkIfCustomIsDefined - check if skeleton directory exists in config
     *
     * @returns {Promise}
     */
    checkIfCustomIsDefined() {
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
        this.defaultPath

        return this
    }
}

module.exports = Skeleton
