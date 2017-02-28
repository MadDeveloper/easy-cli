const { application } = require( `${easy.appRootPath}/src/bootstrap` )
const { transform } = require( `${easy.easyPath}/lib/string` )
const { Console } = require( `${easy.easyPath}/core` )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )
const { Bundle, Skeleton, Entity } = require( '../../lib/bundle' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )
const { snakeCase, deburr } = require( 'lodash' )
const { handler } = require( './repository' )
const TableBuilder = require( '../../lib/database/TableBuilder' )
const SchemaBuilder = require( '../../lib/database/SchemaBuilder' )
const inquirer = require( 'inquirer' )
const prompt = inquirer.createPromptModule()
const kernel = application.kernel

let container = application.container
let databasesManager = container.get( 'component.databasesmanager' )

module.exports.command = 'entity <name> [bundle]'
module.exports.describe = 'Generate new entity with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate entity <name> [bundle]' )
        .example( 'easy generate entity myEntity --bundle test', 'Generate entity myEntity in bundle test' )
        .option( 'bundle', {
            alias: [ 'b' ],
            describe: 'Associated bundle',
            demand: true
        })
        .demandCommand( 1, 'Please, provide me the name of the entity and everything will be ok.' )
}
module.exports.handler = async argv => {
    Console.line()

    let tableName = ''
    let properties = {}

    const availablesColumnType = [ 'increments', 'integer', 'bigInteger', 'text', 'string', 'float', 'decimal', 'boolean', 'date', 'datetime', 'time', 'timestamp' ]
    const specialColumnType = [ 'increments', 'integer', 'bigInteger', 'text', 'string', 'float', 'decimal' ]
    const pathDatabaseSchema = `${kernel.path.config}/database/schema.js`

    const entityName = confirmEntityName( transform.asEntityName( argv.name ) )
    const entityFileName = confirmEntityFileName( transform.asEntityFileName( entityName ) + '.js' )
    const bundleName = argv.bundle
    const bundle = new Bundle( bundleName, kernel )
    const skeleton = new Skeleton( kernel )
    const entity = new Entity( entityName, entityFileName, bundle )
    const tableBuilder = new TableBuilder()
    const schemaBuilder = new SchemaBuilder()
    const errorInfos = {
        title: 'Impossible to create entity',
        consequence: 'Creation aborted'
    }

    try {
        await bundle.selectSkeleton( skeleton )

        const exists = await bundle.exists()

        if ( !exists ) {
            throw new Error( `${bundleName} bundle doesn't exists` )
        }

        await entity.createFile()

        // askForTable()

        const createAssociatedRepository = askToCreateAssociatedRepository()

        if ( createAssociatedRepository ) {
            Console.line()
            Console.success( `Entity ${entity.name} created in bundle ${bundle.name}` )
            Console.line()
            Console.log( 'Now we gonna create the repository' )

            handler({ name: transform.asRepositoryName( entityName ), bundle: bundle.name })
        } else {
            exitWithSuccess( `Entity ${entity.name} created in bundle ${bundle.name}` )
        }
    } catch ( error ) {
        exitWithError( errorInfos.title, error, errorInfos.consequence )
    }

    // data = data.replace( /tableName(\s*):(\s*)('|")\w*('|")/i, `tableName$1:$2$3${tableName}$4` )
}

/**
 * confirmEntityName - confirm if entity name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {string}
 */
function confirmEntityName( name ) {
    const newName = question( `Entity name (default: ${name}): ` ).trim()

    if ( newName.length > 0 ) {
        return newName
    }

    return name
}

/**
 * confirmEntityFileName - confirm if entity file name transformed correspond to user attempts
 *
 * @param {string} fileName
 *
 * @returns {string}
 */
function confirmEntityFileName( fileName ) {
    const newFileName = question( `Entity file name (default: ${fileName}): ` ).trim()

    if ( newFileName.length > 0 ) {
        return newFileName
    }

    return fileName
}

/**
 * askToCreateAssociatedRepository - ask if user want create and associated repository to the entity
 *
 * @returns {boolean}
 */
function askToCreateAssociatedRepository() {
    Console.line()

    const answer = question( 'Do you want an associated repository to that entity? (y/n) ' ).trim().toLowerCase()

    return positiveAnswers.includes( answer )
}
