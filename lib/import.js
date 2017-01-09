module.exports.command = 'import <command>'
module.exports.describe = 'Manage imports (configurations, database, etc.)'
module.exports.builder = yargs => yargs.commandDir( './import' )
module.exports.handler = argv => {}
