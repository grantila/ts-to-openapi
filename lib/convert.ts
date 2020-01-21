import { createGenerator } from "ts-json-schema-generator"

import { Config } from "./types"
import { getConfig } from "./config"
import { overwriteObject } from "./utils"
import { toYAML } from "./yaml"
import { convertNullToNullable } from "./json-schema"


type SchemaType = ReturnType<
	ReturnType<typeof createGenerator>[ "createSchema" ]
>;

type Definitions = SchemaType[ "definitions" ];

function isExpandable( key: string, expandableTypes: ReadonlyArray< string > )
{
	return expandableTypes.some( type => key.startsWith( `${type}<` ) );
}

function modifySchema( schema: SchemaType, config: Config )
{
	const { expandTypes, removeProps, detectGraphQL, graphQLExpandedTypes } =
		config;

	if ( !schema.definitions )
		return;

	const { definitions } = schema;

	const expandableTypes = Object.keys( definitions )
		.filter( name => isExpandable( name, expandTypes ) );

	const expandName = ( name: string ) =>
		`#/definitions/${encodeURIComponent( name )}`;

	const renamedRef = ( ref: string ) =>
		ref.replace( "#/definitions/", "#/components/schemas/" );

	const expandableTypeMap: { [ type: string ]: any } = expandableTypes
		.reduce(
			( prev, cur ) =>
				Object.assign(
					prev,
					{ [ expandName( cur ) ]: definitions[ cur ] }
				)
			,
			{ }
		);

	// Fix 'null' values for GraphQL Maybe<> types
	if ( detectGraphQL )
	{
		Object.keys( definitions )
			.filter( key => isExpandable( key, graphQLExpandedTypes ) )
			.forEach( key =>
			{
				const type = definitions[ key ] as Record< string, any >;
				convertNullToNullable( type );
			} );
	}

	// Expand types recursively
	const recurse = ( obj: any ) =>
	{
		if ( typeof obj !== "object" )
			return;

		const toRemove: Array< string > = [ ];

		for ( const [ key, value ] of Object.entries( obj ) )
		{
			if ( value && typeof value === "object" )
			{
				if ( Array.isArray( value ) )
					value.forEach( ( value: any ) =>
					{
						recurse( value );
					} );
				else
					recurse( value );
			}

			if ( key === "$ref" && typeof value === "string" )
			{
				if ( expandableTypeMap[ value ] )
				{
					// Replace the object inline with the expanded type
					overwriteObject( obj, expandableTypeMap[ value ] );
					return;
				}
				else
					obj[ key ] = renamedRef( value );
			}

			if ( removeProps.includes( key ) )
				toRemove.push( key );
		}

		toRemove.forEach( key =>
		{
			delete obj[ key ];
		} );
	};
	recurse( definitions );

	expandableTypes.forEach( type =>
	{
		delete definitions[ type ];
	} );
}

export function convert( opts: Partial< Config > )
{
	const { config, schemaGeneratorConfig } = getConfig( opts );

	const generator = createGenerator( schemaGeneratorConfig );

	const definitions: Array<Definitions> = [ ];

	config.types.forEach( type =>
	{
		const schema = generator.createSchema( type );
		modifySchema( schema, config );
		definitions.push( schema.definitions );
	});

	const full = {
		components: {
			schemas: Object.assign( { }, ...definitions )
		}
	};

	return toYAML( full, config );
}
