module.exports.command = 'generate <command>'
module.exports.desc = 'Allows to generate elements (bundle, controller, etc.) with console support'
module.exports.builder = yargs => yargs.commandDir( './generate' )
module.exports.handler = argv => {}
