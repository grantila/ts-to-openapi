export function convertNullToNullable( obj: Record< string, any > )
{
	if ( typeof obj.type === 'object' && Array.isArray( obj.type ) )
	{
		// E.g. { type: [ 'number', 'null' ] }
		const pos = obj.type.indexOf( 'null' );
		if ( pos === -1 )
			return;

		// Remove from anyOf
		obj.type.splice( pos, 1 );
		obj.nullable = true;

		// Flatten if possible
		if ( obj.type.length === 1 )
			obj.type = obj.type[ 0 ];
	}
	else if ( typeof obj.anyOf === 'object' && Array.isArray( obj.anyOf ) )
	{
		/**
		 * E.g
		 * {
		 *   anyOf: [
		 *    { '$ref': '#/definitions/MyType' },
		 *    { type: 'null' }
		 *   ]
		 * },
		*/

		// Remove from anyOf
		const pos = obj.anyOf.findIndex( val => val.type === 'null' );
		if ( pos === -1 )
			return;
		obj.anyOf.splice( pos, 1 );
		obj.nullable = true;

		// Flatten is possible
		if ( obj.anyOf.length === 1 )
		{
			const type = obj.anyOf[ 0 ];
			delete obj.anyOf;
			Object.assign( obj, type );
		}
	}
}
