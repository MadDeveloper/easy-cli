const { kernel, application } = require( `${easy.appRootPath}/src/bootstrap` )
const { transform } = require( 'easy/lib/string' )
const { Console } = require( 'easy/core' )
const { positiveAnswers, negativeAnswers } = require( '../../lib/answers' )
const { question } = require( 'readline-sync' )
const Service = require( '../../lib/service' )
const { exitWithSuccess, exitWithError } = require( '../../lib/exit' )

module.exports.command = 'service <name>'
module.exports.describe = 'Generate new service with console support'
module.exports.builder = yargs => {
    return yargs
        .usage( 'Usage: easy generate service <name>' )
        .example( 'easy generate service myService', 'Generate service myService' )
        .demandCommand( 1, 'Please, provide me the name of the service and everything will be ok.' )
}
module.exports.handler = argv => {
    Console.line()

    const name = argv.name
    const serviceName = confirmServiceName( transform.asServiceName( name ) )
    const serviceFileName = confirmServiceFileName( transform.asServiceFileName( name ) )
    const servicePath = confirmServicePath( transform.asServiceFilePath( serviceFileName ) )
    const service = new Service( serviceName, serviceFileName, servicePath )
    const errorInfos = {
        title: 'Impossible to create service',
        consequence: 'Creation aborted'
    }

    service
        .fileExists()
        .then( () => exitWithError( errorInfos.title, 'Service already exists', errorInfos.consequence ) )
        .catch( () => service.createFile() )
        .then( () => exitWithSuccess( 'Service created.\nIf you want use it, think to enable it into services configurations file.' ) )
        .catch( error => exitWithError( errorInfos.title, `Error when creating service file.\n${error}`, errorInfos.consequence ) )
}

/**
 * confirmServiceName - confirm if service name transformed correspond to user attempts
 *
 * @param {string} name
 *
 * @returns {boolean}
 */
function confirmServiceName( name ) {
    const newName = question( `Service name (default: ${name}): ` ).trim()

    if ( newName.length > 0 ) {
        return newName
    }

    return name
}

/**
 * confirmServiceFileName - confirm if service file name transformed correspond to user attempts
 *
 * @param {string} fileName
 *
 * @returns {boolean}
 */
function confirmServiceFileName( fileName ) {
    const newFileName = question( `Service file name (default: ${fileName}): ` ).trim()

    if ( newFileName.length > 0 ) {
        return newFileName
    }

    return fileName
}


/**
 * confirmServicePath - confirm if service file path correspond to user attempts
 *
 * @param {string} filePath
 *
 * @returns {string}
 */
function confirmServicePath( filePath ) {
    const newFilePath = question( `Service path (default: ${filePath}): ` ).trim()

    if ( newFilePath.length > 0 ) {
        return newFilePath
    }

    return filePath
}
