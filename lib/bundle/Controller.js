const { File } = require( 'easy/fs' )

/**
 * @class Controller
 */
 class Controller {
     /**
      * @constructor
      *
      * @param {string} name
      * @param {Bundle} bundle
      */
     constructor( name, fileName, bundle ) {
         this.name = name
         this.path = `${bundle.path}/controllers/${fileName}`
         this.bundle = bundle
     }

     /**
      * createFile
      *
      * @returns {Promise}
      */
     createFile() {
         if ( '.js' !== this.path.substring( this.path.length - 3 ) ) {
             this.path += '.js'
         }

         const skeletonController = new File( `${this.bundle.skeleton.path}/controllers/skeleton.controller.js` )

         return skeletonController
            .read()
            .then( content => new File( this.path, this.replaceSkeletonOccurrences( content ) ).write() )
     }

     replaceSkeletonOccurrences( content ) {
         content = content.replace( /SkeletonController/gi, this.name )
         content = content.replace( /Skeleton/g, this.bundle.formattedNameCapitalized )
         content = content.replace( /skeleton/g, this.bundle.formattedNameDecapitalized )

         return content
     }
}

module.exports = Controller
