const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const execsql = require( 'execsql' )
const Console = require( 'easy/core/Console' )
const ConfigLoader = require( 'easy/core/ConfigLoader' )

module.exports.command = 'database'
module.exports.describe = 'Import the .sql database file into database (following configurations)'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy import database' )
        .example( 'easy import database', 'Import the default .sql file (following database name in configurations)' )
}
module.exports.handler = argv => {
	const config 	= ConfigLoader.loadFromGlobal( 'database' )
	const dbConfig	= {
		host: config.connection.host,
		user: config.connection.user,
		password: config.connection.password
	}

	const titleError		= "Error when importing database"
	const consequenceError	= "Importation aborted."

	const sql = `use ${config.connection.database}`
	const sqlFile	= `${kernel.path.config}/database/${config.connection.database}.sql`

	function raiseError( err ) {
		Console.error({
			title: titleError,
			message: err,
			consequence: consequenceError,
			exit: 0
		})
	}

	execsql
		.config( dbConfig )
		.exec( sql, ( err, results ) => {
		    if ( err ) {
		        raiseError( err )
		    }
		})
		.execFile( sqlFile, ( err, results ) => {
		    if ( err ) {
		        raiseError( err )
		    } else {
				Console.success( "Database imported.", true )
		    }
		    process.exit()
		})
}