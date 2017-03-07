const Project = require( '../lib/Project' )
const { displaySuccess, displayError } = require( '../lib/display' )

module.exports.command = 'new <project>'
module.exports.describe = 'Create new empty easy project'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy new [project]' )
        .example( 'easy new MyProject', 'Will create new empty easy project' )
        .demandCommand( 1, 'I need the name of the project!' )
}
module.exports.handler = async argv => {
    const easyAppRepository = 'MadDeveloper/easy-app'
    const project = new Project( argv.project )

    try {
        await project.downloadFromRepository( easyAppRepository )

        displaySuccess( `The project ${project.name} has been created` )
    } catch ( error ) {
        displayError( error )
    }
}
