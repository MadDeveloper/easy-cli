module.exports.command = 'controller <name> [bundle]'
module.exports.describe = 'Generate new controller with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate controller <name> [bundle]' )
        .example( 'easy generate controller myController --bundle test', 'Generate controller myController in bundle test' )
        .option( 'bundle', {
            alias: [ 'b' ],
            describe: 'Associated bundle',
            demand: true
        })
        .demandCommand( 1, 'I need the name of the controller you want to create.' )
}
module.exports.handler = argv => {
    const name = argv.name
    const bundle = argv.bundle
    console.log( 'controller' )
}
