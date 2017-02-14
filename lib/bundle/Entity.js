const { File } = require( 'easy/fs' )
const Component = require( './Component' )

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
    createFile() {
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
        template = template.replace( /Skeleton/g, this.name.capitalizeFirstLetter() )
        template = template.replace( /skeleton/g, this.name.decapitalizeFirstLetter() )

        return template
    }
}

module.exports = Entity
