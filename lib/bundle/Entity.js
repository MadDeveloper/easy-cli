const { File } = require( `${easy.easyPath}/fs` )
const Component = require( './Component' )
const { upperFirst } = require( 'lodash' )

/**
 * @class Entity
 * @extends Component
 */
 class Entity extends Component {
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
     * createFile - create entity file
     *
     * @returns {Promise}
     */
    async createFile() {
        return super.createFileFromTemplate( `${this.bundle.skeleton.path}/entity/skeleton.js` )
    }

    /**
     * replaceSkeletonOccurrences - replace skeleton template by current component values
     *
     * @param {string} template
     *
     * @returns {string}
     */
    replaceSkeletonOccurrences( template ) {
        template = template.replace( /Skeleton/g, upperFirst( this.name ) )
        template = template.replace( /skeleton/g, upperFirst( this.name ) )

        return template
    }
}

module.exports = Entity
