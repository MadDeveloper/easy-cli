const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const sequence = require( 'when/sequence' )
const Console = require( 'easy/core/Console' )
const { indexOf, has, keys, map } = require( 'lodash' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

let knex
let database
let schema

module.exports.command = 'database'
module.exports.describe = 'Migrate the database with schema.js file (Warning: it will erase all data in current database tables)'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy migrate database' )
        .example( 'easy migrate database', 'Migrate database' )
}
module.exports.handler = argv => {
	database = application.container.get( 'component.databasesmanager' ).getEntityManager().database
	knex = database.instance.knex

	schema = require( 'src/config/database/schema' )

    dropTables()
		.then( createTables )
		.then( () => exitWithSuccess( "I finished the migration chief!." ) )
		.catch( error => exitWithError( 'Error when migrating database', error ) )
}

function dropTables() {
    let tables 		= []
    let tableNames	= keys( schema )

    // we need to reverse tables schema, to delete in first table which contains fk and not the parents, otherwise error will occur because of fk.
    tableNames.reverse()
    tables = map( tableNames, tableName => () => dropTable( tableName ) )

    return sequence( tables )
}

function createTables () {
	let tables 			= []
	const tableNames 	= keys( schema )

	tables = map( tableNames, tableName => () => createTable( tableName, schema[ tableName ]) )

    return sequence( tables )
}

/**
 * dropTable - remove table
 *
 * @param  {string} tableName
 * @returns {Promise}
 */
function dropTable( tableName ) {
	return knex.schema.dropTableIfExists( tableName )
}


/**
 * createTable - create new table
 *
 * @param  {string} tableName
 * @param  {Object} tableSchema
 * @returns {Promise}
 */
function createTable( tableName, tableSchema ) {
	return knex
		.schema
		.createTable( tableName, table => {
			let column
			let columnKeys = keys( tableSchema )

			each( columnKeys, key => {
				if ( 'text' === tableSchema[ key ].type && tableSchema[ key ].hasOwnProperty( 'fieldtype' ) ) {
					column = table[ tableSchema[ key ].type ]( key, tableSchema[ key ].fieldtype )
				} else if ( 'string' === tableSchema[ key ].type && tableSchema[ key ].hasOwnProperty( 'maxlength' ) ) {
					column = table[ tableSchema[ key ].type ]( key, tableSchema[ key ].maxlength )
				} else if ( ( 'float' === tableSchema[ key ].type || 'decimal' === tableSchema[ key ].type ) ) {
					const defaultPrecision = 8
					const precision = ( tableSchema[ key ].hasOwnProperty( 'precision' ) ) ? tableSchema[ key ].precision : defaultPrecision

					if ( 'decimal' === tableSchema[ key ].type ) {
						const defaultScale = 2
						const scale = ( tableSchema[ key ].hasOwnProperty( 'scale' ) ) ? tableSchema[ key ].scale : defaultScale

						table[ tableSchema[ key ].type ]( key, precision, scale )
					} else {
						table[ tableSchema[ key ].type ]( key, precision )
					}
				} else {
					column = table[ tableSchema[ key ].type ]( key )
				}

				if ( tableSchema[ key ].hasOwnProperty( 'nullable' ) && true === tableSchema[ key ].nullable ) {
					column.nullable()
				} else {
					column.notNullable()
				}

				if ( tableSchema[ key ].hasOwnProperty( 'primary' ) && true === tableSchema[ key ].primary ) {
					column.primary()
				}

				if ( tableSchema[ key ].hasOwnProperty( 'unique' ) && tableSchema[ key ].unique ) {
					column.unique()
				}

				if ( tableSchema[ key ].hasOwnProperty( 'unsigned' ) && tableSchema[ key ].unsigned ) {
					column.unsigned()
				}

				if ( tableSchema[ key ].hasOwnProperty( ) ) {
					column.references( tableSchema[ key ].references )
				}

				if ( tableSchema[ key ].hasOwnProperty( 'onDelete' ) && tableSchema[ key ].onDelete.length > 0 ) {
					column.onDelete( tableSchema[ key ].onDelete )
				}

				if ( tableSchema[ key ].hasOwnProperty( 'onUpdate' ) && tableSchema[ key ].onUpdate.length > 0 ) {
					column.onUpdate( tableSchema[ key ].onUpdate )
				}

				if ( tableSchema[ key ].hasOwnProperty( 'defaultTo' ) ) {
					column.defaultTo( tableSchema[ key ].defaultTo )
				}
			})
		})
}
