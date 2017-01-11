const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const execsql = require( 'execsql' )
const Console = require( 'easy/core/Console' )
const ConfigLoader = require( 'easy/core/ConfigLoader' )

const titleError = "Error when importing database"
const consequenceError = "Importation aborted."
const databaseConfig = ConfigLoader.loadFromGlobal( 'database' )
const sql = `use ${databaseConfig.config.database}`
const sqlFile	= `${kernel.path.config}/database/${databaseConfig.config.database}.sql`

function raiseError( err ) {
    Console.error({
        title: titleError,
        message: err,
        consequence: consequenceError,
        exit: 0
    })
}

module.exports.command = 'database'
module.exports.describe = 'Import the .sql database file into database (following configurations)'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy import database' )
        .example( 'easy import database', 'Import the default .sql file (following database name in configurations)' )
}
module.exports.handler = argv => {
	execsql
		.config( databaseConfig.config )
		.exec( sql, ( err, results ) => {
		    if ( err ) {
		        raiseError( err )
		    }
		})
		.execFile( sqlFile, ( err, results ) => {
		    if ( err ) {
		        raiseError( err )
		    } else {
				Console.success( "Database imported, master.", true )
		    }
		    process.exit()
		})
}
