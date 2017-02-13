const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const Console = require( 'easy/core/Console' )
const download = require( 'download-git-repo' )
const { exec } = require( 'child_process' )
const path = require( 'path' )
const copydir = require( 'copy-dir' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

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
        .option( 'default', {
            alias: [ 'd' ],
            describe: 'Default skeleton'
        })
}
module.exports.handler = argv => {
    const enriched = argv.enriched
    let url = argv.url
    const defaultOption = argv.default
    const configSkeletonPath = path.resolve( `${kernel.path.config}/bundles/skeleton` )
    const defaultSkeletonPath = path.resolve( `${kernel.path.root}/node_modules/easy/.cache/skeleton` )
    const enrichedSkeletonUrl = 'MadDeveloper/easy-bundle-skeleton'

    // MadDeveloper/easy-bundle-skeleton.git
    exec( `rm -rf ${configSkeletonPath}`, error => {
        if ( error ) {
            exitWithError( 'Error when cleaning skeleton directory in config', error )
        }

        if ( defaultOption ) {
            copydir( defaultSkeletonPath, configSkeletonPath, error => {
                if ( error ) {
                    exitWithError( 'Error when copying default skeleton in configurations', error )
                }

                exitWithSuccess( 'Default skeleton imported' )
            })
        }

        if ( enriched || ( 'string' === typeof url && url.length > 0 ) ) {
            if ( enriched ) {
                url = enrichedSkeletonUrl
            }

            download( url, configSkeletonPath, error => {
                if ( error ) {
                    exitWithError( `Error when downloading skeleton bundle repository from ${url}`, error )
                } else {
                    exec( `rm -rf ${configSkeletonPath}/LICENSE ${configSkeletonPath}/README.md`, error => {
                        if ( error ) {
                            exitWithError( 'Error when removing meta files (LICENSE and README)', error )
                        }

                        exitWithSuccess( 'Skeleton imported' )
                    })
                }
            })
        }
    })
}
