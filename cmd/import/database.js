const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const execsql = require( 'execsql' )
const Console = require( 'easy/core/Console' )
const ConfigLoader = require( 'easy/core/ConfigLoader' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

module.exports.command = 'database'
module.exports.describe = 'Import the .sql database file into database (following configurations)'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy import database' )
        .example( 'easy import database', 'Import the default .sql file (following database name in configurations)' )
}
module.exports.handler = argv => {
	const titleError = "Error when importing database"
	const consequenceError = "Importation aborted."
	const databaseConfig = ConfigLoader.loadFromGlobal( 'database' )
	const sql = `use ${databaseConfig.config.database}`
	const sqlFile = `${kernel.path.config}/database/${databaseConfig.config.database}.sql`

	execsql
		.config( databaseConfig.config )
		.exec( sql, ( error, results ) => {
		    if ( error ) {
		        exitWithError( error )
		    }
		})
		.execFile( sqlFile, ( error, results ) => {
		    if ( error ) {
		        exitWithError( err )
		    } else {
				exitWithSuccess( 'Database imported, master.' )
		    }
		})
}
