import { write } from "tempy"

import { convert } from "./convert"

async function convertBlob( tsInterface: string, tsName: string )
{
	const path = await write( tsInterface, { extension: 'ts' } );
	return convert( { path, asComment: false, types: [ tsName ] } );
}

describe( "convert", ( ) =>
{
	it( "simple string type", async ( ) =>
	{
		const yaml = await convertBlob(
			"export type Foo = string;",
			"Foo"
		);
		expect( yaml ).toMatchSnapshot( );
	} );

	// Fixes #2
	describe( "split multiple types into anyOf", ( ) =>
	{
		it( "single top-level", async ( ) =>
		{
			const yaml = await convertBlob(
				"export type Foo = string | number;",
				"Foo"
			);
			expect( yaml ).toMatchSnapshot( );
		} );
		it( "recursively", async ( ) =>
		{
			const yaml = await convertBlob(`
				export type Foo = number | {
					foo: string | boolean;
					bar: string[] | { baz?: number } | { baz: boolean };
				}
				`,
				"Foo"
			);
			expect( yaml ).toMatchSnapshot( );
		} );
	} );
} );
