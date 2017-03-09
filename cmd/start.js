/*
* This file is part of the easy framework.
*
* (c) Julien Sergent <sergent.julien@icloud.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const spawn = require( 'child_process' ).spawn
const chokidar = require( 'chokidar' )
const readline = require( 'readline' )

module.exports.command = 'start'
module.exports.describe = 'Start application'
module.exports.handler = argv => {
    let applicationProcess = spawn( 'node', [ `${easy.easyPath}/server.js` ], { stdio: 'inherit' })
    let applicationStarted = true
    const watcher = chokidar.watch( `${easy.appRootPath}/src`, { persistent: true })
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    watcher.on( 'change', path => {
        applicationProcess = restartApplication( applicationProcess )
    })

    rl.setPrompt( '' )
    rl.prompt()
    rl.on( 'line', line => {
        const restartCommands = [ 'rs', 'restart' ]
        const stopCommands = [ 'stop' ]
        const startCommand = [ 'start' ]
        const exitCommand = [ 'ex', 'exit' ]

        line = line.trim().toLowerCase()

        console.log( '' )

        if ( restartCommands.includes( line ) ) {
            applicationProcess = restartApplication( applicationProcess )
        } else if ( stopCommands.includes( line ) ) {
            stopApplication( applicationProcess )
        } else if ( startCommand.includes( line ) ) {
            applicationProcess = startApplication()
        } else if ( exitCommand.includes( line ) ) {
            process.emit( 'SIGINT' )
        }
    })
    rl.on( 'SIGINT', () => process.emit( 'SIGINT' ) )

    process.on( 'SIGINT', () => {
        if ( applicationStarted ) {
            stopApplication( applicationProcess )
        }

        console.log( 'Exiting easy cli...' )
        process.exit()
    })
}

/**
 * Restart the application
 *
 * @param {ChildProcess} applicationProcess
 * @returns {ChildProcess}
 */
function restartApplication( applicationProcess ) {
    stopApplication( applicationProcess )

    return startApplication()
}

/**
 * Stop the application
 *
 * @param {ChildProcess} applicationProcess
 */
function stopApplication( applicationProcess ) {
    console.log( 'Stopping the application...' )
    applicationProcess.kill()
    console.log( 'Application stopped\n' )
}

/**
 * Start the application
 *
 * @returns {ChildProcess}
 */
function startApplication() {
    console.log( 'Starting the application...\n' )

    return spawn( 'node', [ 'node_modules/easy/server.js' ], { stdio: 'inherit' })
}
