import { oppa } from "oppa"
import { BaseError, formatError } from "ts-json-schema-generator"

import { convert } from "../"
import { Config } from "../types"
import { findPackageJsonFile, readJson, stripUndefined } from "../utils"


const pkgJson = readJson( findPackageJsonFile( __dirname ) ?? '' );

const parsed = oppa( {
	name: "ts-to-openapi",
	description:
		"Convert TypeScript types and interfaces to OpenAPI YAML",
	version: pkgJson.version,
} )
.add( {
	name: "file",
	alias: "f",
	type: "string",
	description: ".ts file to read",
} )
.add( {
	name: "config",
	alias: "c",
	type: "string",
	description:
		"Config file to use. Defaults to .ts-to-openapirc in the root of " +
		"the project.",
} )
.add( {
	name: "tsconfig",
	type: "string",
	description:
		"tsconfig.json file to use. Defaults to the first found in parent " +
		"directories of PWD.",
} )
.add( {
	name: "sort-props",
	type: "boolean",
	description: "Sort the properties in the types",
	default: true,
	realDefault: undefined,
} )
.add( {
	name: "as-comment",
	type: "boolean",
	description: "Output OpenAPI YAML inside a source code comment /* ... */",
	default: true,
	realDefault: undefined,
} )
.add( {
	name: "type-check",
	type: "boolean",
	description: "Type-check the input file and fail on type errors",
	default: true,
	realDefault: undefined,
} )
.add( {
	name: "detect-graphql",
	type: "boolean",
	description:
		"Auto-expand GraphQL types (e.g. Maybe, Scalar) and remove __typename",
	default: true,
	realDefault: undefined,
} )
.add( {
	name: "graphql-expanded-types",
	type: "string",
	description:
		"Define which GraphQL types to expand (replaces the built-in list)",
} )
.add( {
	name: "graphql-remove-props",
	type: "string",
	description:
		"Define which GraphQL properties to remove (replaces the built-in " +
		"list)",
} )
.add( {
	name: "expand-types",
	type: "string",
	description:
		"Additional types to expand rather than include as their own types",
} )
.add( {
	name: "remove-props",
	type: "string",
	description: "Additional properties to remove from types",
} )
.add( {
	name: "types",
	alias: "t",
	type: "string",
	description: "The types to convert to OpenAPI",
} )
.parse( );

const split = ( value: string ) =>
	value.split( "," ).map( value => value.trim( ) );

const { args } = parsed;
const {
	file,
	config: configFile,
	tsconfig: tsConfigPath,
	"sort-props": sortProperties,
	"as-comment": asComment,
	"type-check": typeCheck,
	"detect-graphql": detectGraphQL,
	"graphql-expanded-types": graphQLExpandedTypesCommas,
	"graphql-remove-props": graphQLRemovePropsCommas,
	"expand-types": expandTypesCommas,
	"remove-props": removePropsCommas,
	types: typesCommas,
} = args;

const skipTypeCheck = typeCheck == null ? undefined : !typeCheck;

const graphQLExpandedTypes = graphQLExpandedTypesCommas == null
	? undefined
	: split( graphQLExpandedTypesCommas );
const graphQLRemoveProps = graphQLRemovePropsCommas == null
	? undefined
	: split( graphQLRemovePropsCommas );
const expandTypes = expandTypesCommas == null
	? undefined
	: split( expandTypesCommas );
const removeProps = removePropsCommas == null
	? undefined
	: split( removePropsCommas );
const types = typesCommas == null
	? undefined
	: split( typesCommas );

const config: Partial< Config > = stripUndefined( {
	path: file,
	configFile,
	tsConfigPath,
	sortProperties,
	asComment,
	skipTypeCheck,
	detectGraphQL,
	graphQLExpandedTypes,
	graphQLRemoveProps,
	expandTypes,
	removeProps,
	types,
} );

try
{
	console.log( convert( config ) );
}
catch ( error )
{
	if ( error instanceof BaseError )
	{
		process.stderr.write( formatError( error ) );
		process.exit( 1 );
	}
	else
	{
		throw error;
	}
}
