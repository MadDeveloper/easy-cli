module.exports.command = 'show <command>'
module.exports.describe = 'Show application informations'
module.exports.builder = yargs => yargs.commandDir( './restore' )
module.exports.handler = argv => {}
