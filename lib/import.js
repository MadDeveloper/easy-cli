module.exports.command = 'import <command>'
module.exports.describe = 'Manage imports (configurations, database, etc.)'
module.exports.builder = yargs => {
    return yargs
        .commandDir( './import' )
        .demandCommand( 1, 'I\'m not able to guess what to import.' )
}
module.exports.handler = argv => {}
