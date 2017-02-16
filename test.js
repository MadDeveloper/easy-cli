async function t() {
    console.log( 'started' );
    const a = [ 1, 2, 3 ]
    await Promise.all( a.map( async number => {
        const num = await new Promise( resolve => setTimeout( () => resolve( number ) ) )
        console.log( num )
    }) )
    console.log( 'done' )
}

t()
