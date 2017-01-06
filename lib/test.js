const Jasmine = require( 'jasmine' )
const { kernel, application } = require( `${cwd}/src/bootstrap` )

const jasmine = new Jasmine()

global.easy = { application }
global.jasmine = jasmine.jasmine

jasmine.loadConfigFile( `${kernel.path.root}/jasmine.json` )
jasmine.execute()