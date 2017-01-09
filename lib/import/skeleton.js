const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const Console = require( 'easy/core/Console' )
const ConfigLoader = require( 'easy/core/ConfigLoader' )
const download = require( 'download-git-repo' )
const { exec } = require( 'child_process' )
const path = require( 'path' )
const copydir = require( 'copy-dir' )

module.exports.command = 'skeleton [type]'
module.exports.describe = 'Import skeleton at specified <uri> into ~/src/config (it not <uri> is provided, default is used)'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy import skeleton [type]' )
        .example( 'easy import skeleton', 'Will import the default skeleton defined into easy framework' )
        .example( 'easy import skeleton --enriched', 'Will import the enriched skeleton from official easy github repository' )
        .example( 'easy import skeleton <git url>', 'Will import the skeleton from git repository passed as argument (can be Github, GitLab, Bitbucket, cf. https://www.npmjs.com/package/download-git-repo)' )
        .option( 'enriched', {
            alias: [ 'e' ],
            describe: 'Enriched skeleton'
        })
        .option( 'url', {
            alias: [ 'u' ],
            describe: 'Remote git repository url'
        })
}
module.exports.handler = argv => {
    console.log( argv )
    const enriched = argv.enriched
    const url = argv.url
    const configSkeletonPath = path.resolve( `${kernel.path.config}/skeleton` )
    const restoreBundleSkeletonPath = path.resolve( `${kernel.path.root}/node_modules/easy/.cache/bundles/skeleton` )

    // MadDeveloper/easy-bundle-skeleton.git
    // exec( `rm -r ${bundleSkeletonPath}`, error => {
    //     copydir( restoreBundleSkeletonPath, bundleSkeletonPath, error => {
    //         if ( error ) {
    //             Console.error({
    //                 title: `Error when restoring skeleton bundle from ${restoreBundleSkeletonPath}`,
    //                 message: error,
    //                 consequence: `Verify if both path are corrects: ${bundleSkeletonPath} - ${restoreBundleSkeletonPath}`,
    //                 exit: 0
    //             })
    //         } else {
    //             Console.success( 'Skeleton restored.' )
    //             Console.line()
    //         }
    //     })
    // })
}
