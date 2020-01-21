import { convertNullToNullable } from "./json-schema"


function copy< T >( t: T ): T
{
	return JSON.parse( JSON.stringify( t ) );
}

describe( "json-schema", ( ) =>
{
	describe( "convertNullToNullable", ( ) =>
	{
		describe( "using 'type'", ( ) =>
		{
			it( "should not remove anything if single type", ( ) =>
			{
				const before = { type: 'string' };
				const after = copy( before );

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );

			it( "should not remove anything unless null", ( ) =>
			{
				const before = { type: [ 'string' ] };
				const after = copy( before );

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );

			it( "should remove null properly and flatten 1-size array", ( ) =>
			{
				const before = { type: [ 'string', 'null' ] };
				const after = { type: 'string', nullable: true };

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );

			it( "should remove null properly for multi-element array", ( ) =>
			{
				const before = { type: [ 'string', 'number', 'null' ] };
				const after = { type: [ 'string', 'number' ], nullable: true };

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );
		} );

		describe( "using 'anyOf'", ( ) =>
		{
			it( "should not remove anything unless null", ( ) =>
			{
				const before = { anyOf: [ { $ref: "#/definitions/Foo" } ] };
				const after = copy( before );

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );

			it( "should remove null properly and flatten 1-size array", ( ) =>
			{
				const before = { anyOf: [
					{ $ref: "#/definitions/Foo" },
					{ type: 'null' },
				] };
				const after = { $ref: "#/definitions/Foo", nullable: true };

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );

			it( "should remove null properly for multi-element array", ( ) =>
			{
				const before = {
					anyOf: [
						{ $ref: "#/definitions/Foo" },
						{ type: 'string' },
						{ type: 'null' },
					]
				};
				const after = {
					anyOf: [
						{ $ref: "#/definitions/Foo" },
						{ type: 'string' },
					],
					nullable: true,
				};

				convertNullToNullable( before );
				expect( before ).toEqual( after );
			} );
		} );
	} );
} );
