/**
 * @class SchemaBuilder
 */
class SchemaBuilder {
    constructor() {}

    updateSchema() {
        /*
        * We stringify properties and insert it into ~/config/database/schema.js
        */
        checkExistanceOfSchemaFile()
            .then( () => {
                fs.readFile( pathDatabaseSchema, { encoding: 'utf8' }, ( error, data ) => {
                    if ( !error ) {
                        const stringToWrite = `module.exports = {\n\t${tableName}: ${JSON.stringify( properties )},\n`
                        const dataUpdated = data.replace( /module\.exports = \{/i, stringToWrite )

                        fs.writeFile( pathDatabaseSchema, dataUpdated, { encoding: 'utf8' }, error => {
                            if ( !error ) {
                                createBundleDirectory()
                            } else {
                                errorEditingSchema( error )
                            }
                        })
                    } else {
                        errorEditingSchema( error )
                    }
                })
            })

        function errorEditingSchema( error ) {
            Console.error({
                title: "Impossible to update schema",
                message: `Error when editing schema.js file: ${error}`,
                consequence: "Bundle creation aborted."
            })
        }
    }

    checkExistanceOfSchemaFile() {
        return new Promise( ( resolve, reject ) => {
            fs.lstat( pathDatabaseSchema, ( error, stat ) => {
                if ( !error && stat.isFile() ) {
                    resolve()
                } else {
                    Console.error({
                        title: "Impossible to update schema",
                        message: `schema.js not found at: ${pathDatabaseSchema}`,
                        consequence: "Bundle creation aborted."
                    })
                }
            })
        })
    }
}

module.exports = SchemaBuilder
