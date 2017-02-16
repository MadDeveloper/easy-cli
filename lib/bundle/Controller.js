const Component = require( './Component' )

/**
 * @class Controller
 * @extends Component
 */
 class Controller extends Component {
     /**
      * @constructor
      *
      * @param {string} name
      * @param {string} fileName
      * @param {Bundle} bundle
      */
    constructor( name, fileName, bundle ) {
        super( name, `${bundle.path}/controllers/${fileName}`, bundle )
    }

    /**
     * createFile - create controller file
     *
     * @returns {Promise}
     */
    async createFile() {
        return super.createFileFromTemplate( `${this.bundle.skeleton.path}/controllers/skeleton.controller.js` )
    }

    /**
     * replaceSkeletonOccurrences - replace skeleton template by current component values
     *
     * @param {string} template
     *
     * @returns {string}
     */
    replaceSkeletonOccurrences( template ) {
        template = template.replace( /SkeletonController/gi, this.name )

        return super.replaceSkeletonOccurrences( template )
    }
}

module.exports = Controller
