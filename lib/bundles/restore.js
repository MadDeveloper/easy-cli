const { kernel, application } = require( '../../src/bootstrap' )
const copydir = require( 'copy-dir' )
const { exec } = require( 'child_process' )
const Console = require( `easy/core/Console` )
const path = require( 'path' )

const bundleSkeletonPath = path.resolve( `${kernal.path.config}/bundles/skeleton` )
const restoreBundleSkeletonPath = path.resolve( `${kernal.path.root}/node_modules/easy/.cache/bundles/skeleton` )

exec( `rm -r ${bundleSkeletonPath}`, error => {
    copydir( restoreBundleSkeletonPath, bundleSkeletonPath, error => {
        if ( error ) {
            Console.error({
                title: `Error when restoring skeleton bundle from ${restoreBundleSkeletonPath}`,
                message: error,
                consequence: `Verify if both path are corrects: ${bundleSkeletonPath} - ${restoreBundleSkeletonPath}`,
                exit: 0
            })
        } else {
            Console.success( 'Skeleton restored.' )
            Console.line()
        }
    })
})