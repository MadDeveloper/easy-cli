/*
* This file is part of the easy framework.
*
* (c) Julien Sergent <sergent.julien@icloud.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const Jasmine = require( 'jasmine' )
const { application } = require( `${easy.easyPath}/bootstrap` )
const kernel = application.kernel

module.exports.command = 'test'
module.exports.describe = 'Start unit tests'
module.exports.handler = argv => {
    const jasmine = new Jasmine()

    global.easy.application = application
    global.jasmine = jasmine.jasmine

    jasmine.loadConfigFile( `${easy.appRootPath}/jasmine.json` )
    jasmine.execute()
}
