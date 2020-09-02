import { createGenerator } from "ts-json-schema-generator"

import { Config } from "./types"
import { getConfig } from "./config"
import { extractDefinedProperties, overwriteObject } from "./utils"
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

	// Split types into separate anyOf's
	const recurseSplitTypes = ( obj: any ) =>
	{
		if ( !obj?.type && !obj.anyOf && !obj.allOf && !obj.oneOf )
			return;

		const { type } = obj;

		const isMaybeObject = Array.isArray( type )
			? type.includes( "object" ) : type === "object";
		const isMaybeArray = Array.isArray( type )
			? type.includes( "array" ) : type === "array";

		if ( isMaybeObject )
		{
			if ( typeof obj.properties === "object" )
				Object.values( obj.properties )
					.forEach( prop => recurseSplitTypes( prop ) );
			if ( typeof obj.additionalProperties === "object" )
				Object.values( obj.additionalProperties )
					.forEach( prop => recurseSplitTypes( prop ) );
			if ( typeof obj.patternProperties === "object" )
				Object.values( obj.patternProperties )
					.forEach( prop => recurseSplitTypes( prop ) );
		}
		if ( isMaybeArray )
		{
			if ( typeof obj.items === "object" )
			{
				if ( Array.isArray( obj.items ) )
					( obj.items as Array< any > )
						.forEach( item => recurseSplitTypes( obj.items ) );
				else
					recurseSplitTypes( obj.items );
			}
			if ( typeof obj.contains === "object" )
				recurseSplitTypes( obj.contains );
			if ( typeof obj.additionalItems === "object" )
				recurseSplitTypes( obj.additionalItems );
		}

		if ( Array.isArray( obj.anyOf ) )
			obj.anyOf.forEach( ( item: any ) => recurseSplitTypes( item ) );
		if ( Array.isArray( obj.allOf ) )
			obj.allOf.forEach( ( item: any ) => recurseSplitTypes( item ) );
		if ( Array.isArray( obj.oneOf ) )
			obj.oneOf.forEach( ( item: any ) => recurseSplitTypes( item ) );

		if ( !Array.isArray( type ) )
			return;

		if ( type.length === 1 )
		{
			obj.type = type[ 0 ];
		}
		else
		{
			// TODO: Potentially extract all type-specific properties.
			//       Not needed now, since they probably aren't there, if
			//       the schema is generated from TypeScript...
			const objectProperties = extractDefinedProperties( obj, [
				'properties',
				'additionalProperties',
				'patternProperties',
				'required',
			] );
			const arrayProperties = extractDefinedProperties( obj, [
				'items',
				'contains',
				'additionalItems',
			] );

			obj.anyOf = ( type as Array< string > ).map( type => ( {
				type,
				...( type === "object" ? objectProperties : { } ),
				...( type === "array" ? arrayProperties : { } ),
			} ) );
			delete obj.type;
		}
	};
	Object.values( definitions ).forEach( def => recurseSplitTypes( def ) );

	// Expand types recursively
	const recurseExpandTypes = ( obj: any ) =>
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
						recurseExpandTypes( value );
					} );
				else
					recurseExpandTypes( value );
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
	recurseExpandTypes( definitions );

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
