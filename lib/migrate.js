module.exports.command = 'migrate <command>'
module.exports.describe = 'Manage migrations'
module.exports.builder = yargs => {
    return yargs
        .commandDir( './migrate' )
        .demandCommand( 1, 'I migrate... I migrate... but what then?' )
}
module.exports.handler = argv => {}
