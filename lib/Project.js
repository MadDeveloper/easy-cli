const download = require( 'download-git-repo' )
const path = require( 'path' )

/**
 * @class Project
 */
class Project {
    /**
     * Creates an instance of Project.
     * @param {string} name
     *
     * @memberOf Project
     */
    constructor( name ) {
        this._name = name
    }

    /**
     * Download the skeleton of an application from repository
     *
     * @param {string} url
     * @returns {Promise}
     *
     * @memberOf Project
     */
    async downloadFromRepository( url ) {
        return new Promise( ( resolve, reject ) => {
            download( url, this.projectPath, async error => {
                if ( error ) {
                    reject( `Error when downloading the project from ${url}.\n${error}` )
                } else {
                    resolve()
                }
            })
        })
    }

    /**
     * Returns the name of the project
     *
     * @readonly
     *
     * @memberOf Project
     */
    get name() {
        return this._name
    }

    /**
     * Get the project path
     *
     * @readonly
     *
     * @memberOf Project
     */
    get projectPath() {
        return path.resolve( `${process.cwd()}/${this.name}` )
    }
}

module.exports = Project
