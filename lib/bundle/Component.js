const { File } = require( 'easy/fs' )

/**
 * @class Component
 */
 class Component {
     /**
      * @constructor
      *
      * @param {string} name
      * @param {string} path
      * @param {Bundle} bundle
      */
    constructor( name, path, bundle ) {
        this.name = name
        this.path = path
        this.bundle = bundle
    }

     /**
      * createFile
      *
      * @returns {Promise}
      */
    createFile( skeletonTemplatePath ) {
        if ( '.js' !== this.path.substring( this.path.length - 3 ) ) {
            this.path += '.js'
        }

        const skeletonTemplate = new File( skeletonTemplatePath )

        return skeletonTemplate
            .read()
            .then( content => new File( this.path, this.replaceSkeletonOccurrences( content ) ).write() )
    }

    /**
     * replaceSkeletonOccurrences - replace skeleton template by current component values
     *
     * @param {string} template
     *
     * @returns {string}
     */
    replaceSkeletonOccurrences( template ) {
        template = template.replace( /Skeleton/g, this.bundle.formattedNameCapitalized )
        template = template.replace( /skeleton/g, this.bundle.formattedNameDecapitalized )

        return template
    }
}

module.exports = Component
