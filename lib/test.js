const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const Jasmine = require( 'jasmine' )

const jasmine = new Jasmine()

global.easy = { application }
global.jasmine = jasmine.jasmine

jasmine.loadConfigFile( `${kernel.path.root}/jasmine.json` )
jasmine.execute()
