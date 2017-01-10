module.exports.command = 'repository <name> [bundle]'
module.exports.describe = 'Generate new repository with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate repository <name> [bundle]' )
        .example( 'easy generate repository myRepository --bundle test', 'Generate repository myRepository in bundle test' )
        .option( 'bundle', {
            alias: [ 'b' ],
            describe: 'Associated bundle',
            demand: true
        })
        .demandCommand( 1, 'Provide me the name of the repository and you won\'t have problems.' )
}
module.exports.handler = argv => {
    const name = argv.name
    const bundle = argv.bundle
    console.log( 'repository' )
}
