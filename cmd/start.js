/*
* This file is part of the easy framework.
*
* (c) Julien Sergent <sergent.julien@icloud.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

module.exports.command = 'start'
module.exports.describe = 'Start application'
module.exports.handler = argv => {
    require(`${easy.easyPath}/server`)
}
