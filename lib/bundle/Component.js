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
      * createFileFromTemplate - create new file from skeleton template
      *
      * @returns {Promise}
      */
    async createFileFromTemplate( skeletonTemplatePath ) {
        if ( !this.path.endsWith( '.js' ) ) {
            this.path += '.js'
        }

        const skeletonTemplate = new File( skeletonTemplatePath )
        const content = await skeletonTemplate.read()
        const repositoryFile = new File( this.path, this.replaceSkeletonOccurrences( content ) )

        return repositoryFile.write()
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
