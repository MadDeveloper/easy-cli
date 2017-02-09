const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { transform } = require( 'easy/lib/string' )
const { Console } = require( 'easy/core' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )
const { Bundle, Skeleton, Repository } = require( '../../lib/bundle' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )
const { handler } = require( './entity' )

module.exports.command = 'repository <name> [bundle]'
module.exports.describe = 'Generate new repository with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate repository <name> [bundle]' )
        .example( 'easy generate repository myRepository --bundle test', 'Generate repository myRepository in bundle test' )
        .option( 'bundle', {
            alias: [ 'b' ],
            describe: 'Associated bundle',
            demand: true
        })
        .demandCommand( 1, 'Provide me the name of the repository and you won\'t have problems.' )
}
module.exports.handler = argv => {
    Console.line()

    const repositoryName = confirmRepositoryName( transform.asRepositoryName( argv.name ) )
    const repositoryFileName = confirmRepositoryFileName( transform.asRepositoryFileName( repositoryName ) )
    const bundleName = argv.bundle
    const bundle = new Bundle( bundleName, kernel )
    const skeleton = new Skeleton( kernel )
    const repository = new Repository( repositoryName, repositoryFileName, bundle )
    const errorInfos = {
        title: 'Impossible to create repository',
        consequence: 'Creation aborted'
    }
    const successMessage = `Repository ${repository.name} created in bundle ${bundle.name}`

    bundle
        .selectSkeleton( skeleton )
        .catch( error => exitWithError( errorInfos.title, `Skeleton bundle not found. ${error}`, errorInfos.consequence ) )
        .then( () => bundle.exists() )
        .catch( error => exitWithError( errorInfos.title, `${bundle.name} bundle doesn't exists. ${error}`, errorInfos.consequence ) )
        .then( () => repository.createFile() )
        .catch( error => exitWithError( errorInfos.title, error, errorInfos.consequence ) )
        .then( askToCreateEntity )
        .catch( () => exitWithSuccess( successMessage ) )
        .then( () => {
            Console.line()
            Console.success( successMessage )
            Console.line()
            Console.log( 'Now we gonna create the entity' )

            return handler({ name: transform.asEntityName( repositoryName ), bundle: bundle.name })
        })
}

/**
 * confirmRepositoryName - confirm if repository name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {boolean}
 */
function confirmRepositoryName( name ) {
    const newName = question( `Repository name (default: ${name}): ` ).trim()

    if ( newName.length > 0 ) {
        return newName
    }

    return name
}

/**
 * confirmRepositoryFileName - confirm if repository file name transformed correspond to user attempts
 *
 * @param {string} fileName
 *
 * @returns {boolean}
 */
function confirmRepositoryFileName( fileName ) {
    const newFileName = question( `Repository file name (default: ${fileName}): ` ).trim()

    if ( newFileName.length > 0 ) {
        return newFileName
    }

    return fileName
}

function askToCreateEntity() {
    Console.line()

    const answer = question( 'Do you want associate entity to that repository? (y/n) ' ).trim().toLowerCase()

    return positiveAnswers.includes( answer ) ? Promise.resolve() : Promise.reject()
}
