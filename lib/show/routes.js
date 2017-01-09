const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const fs = require( 'fs' )
const path = require( 'path' )
const pad = require( 'pad-right' )
const minimist = require( 'minimist' )
const Console = require( 'easy/core/Console' )

module.exports.command = 'routes'
module.exports.describe = 'Show all the application\'s routes'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy show routes' )
        .example( 'easy show routes', 'Show all routes defined in application' )
}
module.exports.handler = argv => {
    const router = application.container.get( 'component.router' )
    const save = argv.s || 's' === argv._[ 0 ] || argv.save || 'save' === argv._[ 0 ]

    let route = ''
    let routes = ''
    let currentDisplayRoute = ''

    const routesStack = router.scope.stack
    for ( let stack in routesStack ) {
        if ( routesStack.hasOwnProperty( stack ) ) {
            route = routesStack[ stack ].route

            if ( route ) {
                route.stack.forEach( layer => {
                    if ( layer.method ) {
                        currentDisplayRoute = `${pad( layer.method.toUpperCase(), 'delete'.length, ' ' )} - ${route.path}`

                        if ( save ) {
                            routes += `${currentDisplayRoute}\n`
                        } else {
                            Console.log( currentDisplayRoute )
                        }
                    }
                })
            }
        }
    }

    if ( save ) {
        const routesFilePath = path.resolve( `${__dirname}/../../routes.txt` )
        fs.writeFileSync( routesFilePath, routes, { encoding: 'utf8' })
        Console.success( `Routes saved into ${routesFilePath}` )
    }

    Console.line()
    process.exit()
}