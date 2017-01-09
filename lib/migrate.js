module.exports.command = 'migrate <command>'
module.exports.describe = 'Manage migrations'
module.exports.builder = yargs => yargs.commandDir( './migrate' )
module.exports.handler = argv => {}
