async function t() {
    return new Promise( resolve => setTimeout( () => resolve( 'Hello World!' ), 2000 ) )
}

async function p() {
    console.log( await t() ) // Hello World!
}

p()
