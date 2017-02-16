const Component = require( './Component' )

/**
 * @class Repository
 * @extends Component
 */
 class Repository extends Component {
     /**
      * @constructor
      *
      * @param {string} name
      * @param {string} fileName
      * @param {Bundle} bundle
      */
    constructor( name, fileName, bundle ) {
        super( name, `${bundle.path}/entity/${fileName}`, bundle )
    }

    /**
     * createFile - create repository file
     *
     * @returns {Promise}
     */
    async createFile() {
        return super.createFileFromTemplate( `${this.bundle.skeleton.path}/entity/skeleton.repository.js` )
    }

    /**
     * replaceSkeletonOccurrences - replace skeleton template by current component values
     *
     * @param {string} template
     *
     * @returns {string}
     */
    replaceSkeletonOccurrences( template ) {
        template = template.replace( /SkeletonRepository/gi, this.name )

        return super.replaceSkeletonOccurrences( template )
    }
}

module.exports = Repository
