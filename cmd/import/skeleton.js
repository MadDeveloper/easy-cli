const { application } = require( `${easy.appRootPath}/src/bootstrap` )
const { Console } = require( `${easy.easyPath}/core` )
const path = require( 'path' )
const { Skeleton } = require( '../../lib/bundle' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )
const kernel = application.kernel

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
module.exports.handler = async argv => {
    let url = argv.url
    const enriched = argv.enriched
    const defaultOption = argv.default
    const enrichedSkeletonUrl = 'MadDeveloper/easy-bundle-skeleton'
    const skeleton = new Skeleton( kernel )

    try {
        await skeleton.removeInConfigurations()

        if ( defaultOption ) {
            await skeleton.importDefault()
        } else if ( enriched || ( 'string' === typeof url && url.length > 0 ) ) {
            if ( enriched ) {
                url = enrichedSkeletonUrl
            }

            await skeleton.downloadFromRepository( url )
        }

        exitWithSuccess( 'Skeleton imported' )
    } catch ( error ) {
        exitWithError( error )
    }
}
