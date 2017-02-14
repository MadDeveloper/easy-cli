const Component = require( './bundle/Component' )
const { Directory, File } = require( 'easy/fs' )
const mkdirp = require( 'mkdirp' )

/**
 * @class Service
 * @extends Component
 */
 class Service {
     /**
      * @constructor
      *
      * @param {string} name
      * @param {string} fileName
      * @param {string} path
      * @param {Map} dependencies
      */
    constructor( name, fileName, path, dependencies ) {
        this.name = name
        this.fileName = fileName
        this.file = new File( path )
        this.path = path
        this.dependencies = dependencies
    }

    /**
     * createPathDirectories - create all directories, which don't exist, in service file path
     *
     * @returns {Promise}
     *
     * @memberOf Service
     */
    createPathDirectories() {
        return new Promise( ( resolve, reject ) => {
            mkdirp( this.file.directory.path, error => {
                if ( error ) {
                    reject( error )
                } else {
                    resolve()
                }
            })
        })
    }

    /**
     * fileExists - check if service file exists
     *
     * @returns {Promise}
     *
     * @memberOf Service
     */
    fileExists() {
        return this.file.exists()
    }

     /**
      * createFile - create service file
      *
      * @returns {Promise}
      */
    createFile() {
        return this
            .createPathDirectories()
            .then( () => this.file.create() )
            .then( () => this.writeContent() )
    }

    /**
     * writeContent - write content in service file
     *
     * @returns {Promise}
     *
     * @memberOf Service
     */
    writeContent() {
        this.file.content = `/**\n * @class ${this.name}\n */\nclass ${this.name} {}\n\nmodule.exports = ${this.name}`

        return this.file.write()
    }
}

module.exports = Service
