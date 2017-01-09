module.exports.command = 'generate <command>'
module.exports.desc = 'Allows to generate elements (bundle, controller, etc.) with console support'
module.exports.builder = yargs => {
    return yargs
        .commandDir( './generate' )
        .demandCommand( 1, 'I cannot generate nothing...' )
}
module.exports.handler = argv => {}
