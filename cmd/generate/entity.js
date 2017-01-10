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
}
