module.exports.command = 'show <command>'
module.exports.describe = 'Show application informations'
module.exports.builder = yargs => {
    return yargs
        .commandDir( './show' )
        .demandCommand( 1, 'You want a show from me? No way!' )
}
module.exports.handler = argv => {}
