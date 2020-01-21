import * as path from 'path'
import * as fs from 'fs'
import parseJsonNicely = require( 'parse-json' )


export function parseJson( text: string, filename?: string ): any
{
	try
	{
		return JSON.parse( text );
	}
	catch ( err )
	{
		return parseJsonNicely( text, filename );
	}
}

export function addUnique< T >( arr: ReadonlyArray< T >, ...args: Array< T > )
: Array< T >
{
	return [ ...new Set( [
		...arr,
		...args
	] ) ];
}

export function overwriteObject(
	dest: Record< string | number | symbol, any >,
	src: Record< string | number | symbol, any >
)
: Record< string | number | symbol, any >
{
	Object.keys( dest ).forEach( key =>
	{
		delete dest[ key ];
	} );

	return Object.assign( dest, src );
}

export function findFile( leafDir: string, basename: string )
{
	let dir = leafDir;
	do
	{
		const filename = path.join( dir, basename );
		if ( fs.existsSync( filename ) )
			return filename;
		dir = path.dirname( dir );
	}
	while ( dir !== "/" );

	return null;
}

export function findConfigFile( leafDir: string )
{
	return findFile( leafDir, ".ts-to-openapirc" );
}

export function findPackageJsonFile( leafDir: string )
{
	return findFile( leafDir, "package.json" );
}

export function readJson( filename: string )
{
	return parseJson( fs.readFileSync( filename, 'utf8' ) );
}

export function stripUndefined< T extends { } >( t: T ): T
{
	const ret = { } as T;

	for ( const [ key, value ] of Object.entries( t ) )
	{
		if ( value !== undefined )
			ret[ key as keyof typeof ret ] = value as any;
	}

	return ret;
}
