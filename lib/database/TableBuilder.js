/**
 * @class TableBuilder
 */
class TableBuilder {
    constructor() {}

    build() {
        return this.askForTable()
    }

    async askForTable() {
        const createAssociatedTable = question( 'Do you want create an associated table into database? (y/n) ' ).trim().toLowerCase()

        if ( positiveAnswers.includes( createAssociatedTable ) ) {
            /*
            * Table associated requested
            */
            return checkExistanceOfSchemaFile().then( askForTableName )
        } else if ( negativeAnswers.includes( createAssociatedTable ) ) {
            /*
            * No table associated requested
            */
            return Promise.resolve()
        } else {
            return askForTable()
        }
    }

    askForTableName() {
        Console.line()

        const defaultTableName = `${snakeCase( formattedBundleNameDecapitalized )}s`
        const answerTableName = snakeCase( question( `Table name (default: ${defaultTableName}): ` ) )

        tableName = ( answerTableName.length > 0 ) ? answerTableName : defaultTableName

        askForProperties()
    }

    askForProperties() {
        Console.line()

        /*
        * We ask for properties
        */
        const columnName = snakeCase( question( 'Column name (let empty if the table is complete): ' ) )
        const propertiesLength = Object.keys( properties ).length

        if ( 0 === columnName.length && 0 === propertiesLength ) {
            askForTable()
        } else if ( 0 === columnName.length && propertiesLength > 0 ) {
            createTable()
        } else {
            const columnType = deburr( question( `Column type: (availables: ${availablesColumnType.join( ', ' )}): ` ).toLowerCase().trim() )

            if ( availablesColumnType.includes( columnType ) ) {
                /*
                * Everything is ok, we push new column
                */
                properties[ columnName ] = {}
                properties[ columnName ].type = columnType

                /*
                * Special property ? Ask for more details
                */
                if ( specialColumnType.includes( columnType ) ) {
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

    askDetailsForSpecialColumnType( type, columnName ) {
        let property = properties[ columnName ]

        switch ( type ) {

            case 'increments':
                const anwserDefineAsPrimary = question( 'Define as primary? (y/n) ' ).trim().toLowerCase()

                if ( positiveAnswers.includes( anwserDefineAsPrimary ) ) {
                    /*
                    * Define as primary
                    */
                    property.primary = true
                } else if ( negativeAnswers.includes( anwserDefineAsPrimary ) ) {
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

                if ( positiveAnswers.includes( answerIsAReference ) ) {
                    /*
                    * Define as reference
                    */
                    property.unsigned = true

                    const answerReference = question( 'Table.ColumnId as reference (exemple: roles.id): ' ).trim().toLowerCase()

                    if ( answerReference.includes( '.' ) && answerReference.match( /^\w+\.\w+$/ ) ) {
                        property.references = answerReference

                        const validsOnEventAction = [ 'restrict', 'cascade', 'set null', 'no action' ]
                        let defaultOnEventAction = 'restrict'

                        /*
                        * OnDelete
                        */
                        const answerOnDelete = question( `On delete action: (${validsOnEventAction.join( ', ' )}, default: ${defaultOnEventAction}) ` ).trim().toLowerCase()

                        if ( validsOnEventAction.includes( answerOnDelete ) ) {
                            property.onDelete = answerOnDelete
                        } else {
                            property.onDelete = defaultOnEventAction
                        }

                        /*
                        * OnUpdate
                        */
                        const answerOnUpdate = question( `On update action: (${validsOnEventAction.join( ', ' )}, default: ${defaultOnEventAction}) ` ).trim().toLowerCase()

                        if ( validsOnEventAction.includes( answerOnUpdate ) ) {
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

                if ( validsTextType.includes( anwserTypeOfText ) ) {
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

    askForNullableColumn( columnName ) {
        const answerNullable = question( 'Define as nullable? (y/n) ' ).trim().toLowerCase()

        if ( positiveAnswers.includes( answerNullable ) ) {
            /*
            * Define as nullable
            */
            properties[ columnName ].nullable = true
        } else if ( negativeAnswers.includes( answerNullable ) ) {
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

    askForUniqueColumn( columnName ) {
        const answerAsUnique = question( 'Define as unique? (y/n) ' ).trim().toLowerCase()

        if ( positiveAnswers.includes( answerAsUnique ) ) {
            /*
            * Define as unique
            */
            properties[ columnName ].unique = true
        } else if ( negativeAnswers.includes( answerAsUnique ) ) {
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

    createTable() {
        schemaDatabaseService
            .createTable( tableName, properties )
            .then( updateSchema )
            .catch( error => {
                Console.error({
                    title: "Error when creating table",
                    message: error,
                    consequence: "Bundle creation aborted.",
                    exit: 0
                })
            })
    }
}

module.exports = TableBuilder
