const inquirer = require( 'inquirer' )
const prompt = inquirer.createPromptModule()
const Bookshelf = require( 'bookshelf' )

/**
 * @class DatabaseSelector
 */
class DatabaseSelector {
    /**
     * Creates an instance of DatabaseSelector.
     *
     *
     * @memberOf DatabaseSelector
     */
    constructor( container ) {
        this._selected = null
        this._container = container
        this._databases = new Map()
    }

    async selectDatabase() {
        const answer = await prompt([ {
            type: 'list',
            name: 'database',
            message: ''
        } ])
    }

    filterDatabases() {
        const databasesManager = this._container.get( 'component.databasesmanager' )
        let databases = new Map()

        for ( let [ key, em ] of databasesManager.ems ) {
            databases.set( key, em.database )
        }

        databases.filter( database => {
            console.log( database.config.instance.constructor )
            return true
        })
    }

    /**
     * get the selected database
     *
     * @readonly
     *
     * @memberOf DatabaseSelector
     */
    get selected() {
        return this._selected
    }

    /**
     * get all the databases
     *
     * @readonly
     *
     * @memberOf DatabaseSelector
     */
    get databases() {
        return this._databases
    }
}

module.exports = DatabaseSelector
