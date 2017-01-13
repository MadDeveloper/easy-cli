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
module.exports.handler = argv => {
    const name = argv.name
    const bundle = argv.bundle
    console.log( 'entity' )

    let tableName = ''
    let properties = {}

    const availablesColumnType = [ 'increments', 'integer', 'bigInteger', 'text', 'string', 'float', 'decimal', 'boolean', 'date', 'datetime', 'time', 'timestamp' ]
    const specialColumnType = [ 'increments', 'integer', 'bigInteger', 'text', 'string', 'float', 'decimal' ]
    const pathDatabaseSchema = `${kernel.path.config}/database/schema.js`

    // data = data.replace( /tableName(\s*):(\s*)('|")\w*('|")/i, `tableName$1:$2$3${tableName}$4` )
}

function askForTable() {
    const createAssociatedTable = question( 'Do you want create an associated table into database? (y/n) ' ).trim().toLowerCase()

    if ( indexOf( positiveAnswers, createAssociatedTable ) !== -1 ) {
        /*
         * Table associated requested
         */
        checkExistanceOfSchemaFile()
        .then( () => {
            askForTableName()
        })
    } else if ( indexOf( negativeAnswers, createAssociatedTable ) !== -1 ) {
        /*
         * No table associated requested
         */
        createBundleDirectory()
    } else {
        askForTable()
    }
}

function askForTableName() {
    Console.line()

    const defaultTableName = `${asSnakeCase( formattedBundleNameDecapitalized )}s`
    const answerTableName = asSnakeCase( question( `Table name (default: ${defaultTableName}): ` ) )

    tableName = ( answerTableName.length > 0 ) ? answerTableName : defaultTableName

    askForProperties()
}

function askForProperties() {
    Console.line()

    /*
     * We ask for properties
     */
    const columnName = asSnakeCase( question( 'Column name (let empty if the table is complete): ' ) )
    const propertiesLength = Object.keys( properties ).length

    if ( 0 === columnName.length && 0 === propertiesLength ) {
        askForTable()
    } else if ( 0 === columnName.length && propertiesLength > 0 ) {
        createTable()
    } else {
        const columnType = cleanAccents( question( `Column type: (availables: ${availablesColumnType.join( ', ' )}): ` ).toLowerCase().trim() )

        if ( indexOf( availablesColumnType, columnType ) !== -1 ) {
            /*
             * Everything is ok, we push new column
             */
            properties[ columnName ] = {}
            properties[ columnName ].type = columnType

            /*
             * Special property ? Ask for more details
             */
            if ( indexOf( specialColumnType, columnType ) !== -1 ) {
                askDetailsForSpecialColumnType( columnType, columnName )
            }

            askForProperties()
        } else {
            Console.error({
                title: "Column type not valid",
                message: `Column type can be: ${availablesColumnType.join( ', ' )}`
            })
            askForProperties()
        }
    }
}

function askDetailsForSpecialColumnType( type, columnName ) {
    let property = properties[ columnName ]

    switch ( type ) {

        case 'increments':
            const anwserDefineAsPrimary = question( 'Define as primary? (y/n) ' ).trim().toLowerCase()

            if ( indexOf( positiveAnswers, anwserDefineAsPrimary ) !== -1 ) {
                /*
                 * Define as primary
                 */
                property.primary = true
            } else if ( -1 === indexOf( negativeAnswers, anwserDefineAsPrimary ) ) {
                /*
                 * Not recognized answer
                 */
                askDetailsForSpecialColumnType( type, columnName )
            }

            askForUniqueColumn( columnName )
            property.nullable = false
            break

        case 'integer':
        case 'bigInteger':
            const answerIsAReference = question( 'Define as reference (foreign key)? (y/n) ' ).trim().toLowerCase()

            if ( indexOf( positiveAnswers, answerIsAReference ) !== -1 ) {
                /*
                 * Define as reference
                 */
                property.unsigned = true

                const answerReference = question( 'Table.ColumnId as reference (exemple: roles.id): ' ).trim().toLowerCase()

                if ( answerReference.indexOf( '.' ) !== -1 && answerReference.match( /^\w+\.\w+$/ ) ) {
                    property.references = answerReference

                    const validsOnEventAction = [ 'restrict', 'cascade', 'set null', 'no action' ]
                    let defaultOnEventAction = 'restrict'

                    /*
                     * OnDelete
                     */
                    const answerOnDelete = question( `On delete action: (${validsOnEventAction.join( ', ' )}, default: ${defaultOnEventAction}) ` ).trim().toLowerCase()

                    if ( indexOf( validsOnEventAction, answerOnDelete ) !== -1 ) {
                        property.onDelete = answerOnDelete
                    } else {
                        property.onDelete = defaultOnEventAction
                    }

                    /*
                     * OnUpdate
                     */
                    const answerOnUpdate = question( `On update action: (${validsOnEventAction.join( ', ' )}, default: ${defaultOnEventAction}) ` ).trim().toLowerCase()

                    if ( indexOf( validsOnEventAction, answerOnUpdate ) !== -1 ) {
                        property.onUpdate = answerOnUpdate
                    } else {
                        property.onUpdate = defaultOnEventAction
                    }
                } else {
                    /*
                     * Wrong reference
                     */
                    delete property.unsigned
                    Console.error({
                        title: "Wrong reference",
                        message: `Reference -> ${answerReference} is not a valid reference.`
                    })
                    askDetailsForSpecialColumnType( type, columnName )
                }
            }

            askForUniqueColumn( columnName )
            askForNullableColumn( columnName )
            break

        case 'text':
            const validsTextType = [ 'text', 'mediumtext', 'longtext' ]
            const defaultTextType = 'text'
            const anwserTypeOfText = question( `Which kind of text? ( ${validsTextType.join( ', ' )}, default: ${defaultTextType}) ` ).trim().toLowerCase()

            if ( indexOf( validsTextType, anwserTypeOfText ) !== -1 ) {
                property.fieldtype = anwserTypeOfText
            } else {
                property.fieldtype = defaultTextType
            }

            askForNullableColumn( columnName )
            break

        case 'string':
            const minLength = 1, maxLength = 255
            const answerMaxLength = question( `Max length (${minLength}-${maxLength}, default: ${maxLength}): ` ).trim()

            if ( !isNaN( answerMaxLength ) && answerMaxLength >= minLength && answerMaxLength <= maxLength ) {
                /*
                 * Ok
                 */
                property.maxlength = parseInt( answerMaxLength, 10 )
            } else if ( !isNaN( answerMaxLength ) ) {
                /*
                 * Not in range, default value applicated
                 */
                property.maxlength = maxLength
            } else {
                /*
                 * Wrong answer, we ask again
                 */
                askDetailsForSpecialColumnType( type, columnName )
            }

            askForUniqueColumn( columnName )
            askForNullableColumn( columnName )
            break

        case 'float':
        case 'decimal':
            const defaultPrecision = 8
            const answerPrecision = question( `Precision (integer, default: ${defaultPrecision}): ` ).trim()

            if ( 0 === answerPrecision.length || isNaN( answerPrecision ) || !isFinite( answerPrecision ) ) {
                property.precision = defaultPrecision
            } else {
                property.precision = parseInt( answerPrecision, 10 )
            }

            if ( 'decimal' === type ) {
                /*
                 * Ask for scale
                 */
                const defaultScale = 2
                const answerScale = question( `Scale (integer, default: ${defaultScale}): ` ).trim()

                if ( 0 === answerScale.length || isNaN( answerScale ) || !isFinite( answerScale ) ) {
                    property.scale = defaultScale
                } else {
                    property.scale = parseInt( answerScale, 10 )
                }
            }

            askForNullableColumn( columnName )
            break
    }
}

function askForNullableColumn( columnName ) {
    const answerNullable = question( 'Define as nullable? (y/n) ' ).trim().toLowerCase()

    if ( indexOf( positiveAnswers, answerNullable ) !== -1 ) {
        /*
         * Define as nullable
         */
        properties[ columnName ].nullable = true
    } else if ( indexOf( negativeAnswers, answerNullable ) !== -1 ) {
        /*
         * Not nullable
         */
        properties[ columnName ].nullable = false
    } else {
        /*
         * Wrong answer
         */
        askForNullableColumn( columnName )
    }
}

function askForUniqueColumn( columnName ) {
    const answerAsUnique = question( 'Define as unique? (y/n) ' ).trim().toLowerCase()

    if ( indexOf( positiveAnswers, answerAsUnique ) !== -1 ) {
        /*
         * Define as unique
         */
        properties[ columnName ].unique = true
    } else if ( indexOf( negativeAnswers, answerAsUnique ) !== -1 ) {
        /*
         * Not unique
         */
        properties[ columnName ].unique = false
    } else {
        /*
         * Wrong answer
         */
        askForUniqueColumn( columnName )
    }
}

function createTable() {
    schemaDatabaseService
        .createTable( tableName, properties )
        .then( () => {
            updateSchema()
        })
        .catch( error => {
            Console.error({
                title: "Error when creating table",
                message: error,
                consequence: "Bundle creation aborted.",
                exit: 0
            })
        })
}

function updateSchema() {
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
            consequence: "Bundle creation aborted.",
            exit: 0
        })
    }
}

function checkExistanceOfSchemaFile() {
    return new Promise( ( resolve, reject ) => {
        fs.lstat( pathDatabaseSchema, ( error, stat ) => {
            if ( !error && stat.isFile() ) {
                resolve()
            } else {
                Console.error({
                    title: "Impossible to update schema",
                    message: `schema.js not found at: ${pathDatabaseSchema}`,
                    consequence: "Bundle creation aborted.",
                    exit: 0
                })
            }
        })
    })
}
