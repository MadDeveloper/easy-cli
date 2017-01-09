module.exports.command = 'restore <command>'
module.exports.describe = 'Restore application elements'
module.exports.builder = yargs => yargs.commandDir( './restore' )
module.exports.handler = argv => {}
