import { Config as SchemaGeneratorConfig } from 'ts-json-schema-generator'

import { Config } from './types'
import { readConfigFromFile } from './config-file'
import { addUnique, findFile } from './utils'


export const defaultConfig: Required< Config > = {
	path: "",
	tsConfigPath: findFile( process.cwd( ), "tsconfig.json" ) || "",
	configFile: "",
	sortProperties: true,
	asComment: true,
	skipTypeCheck: false,
	detectGraphQL: true,
	graphQLExpandedTypes: [ 'Maybe', 'Scalar' ],
	graphQLRemoveProps: [ '__typename' ],
	expandTypes: [ ],
	removeProps: [ ],
	types: [ ],
	jsonFormat: false,
	modelVersion: "1.0.0",
};

export interface GetConfigResult
{
	/**
	 * ts-to-openapi options
	 */
	config: Config;

	/**
	 * ts-json-schema-generator Config
	 */
	schemaGeneratorConfig: SchemaGeneratorConfig;
}

export function getConfig( opts: Partial< Config > = { } ): GetConfigResult
{
	const configFromFile = readConfigFromFile( opts );

	const config: Config = Object.assign(
		defaultConfig,
		configFromFile.config,
		opts
	);

	if ( config.detectGraphQL )
	{
		// Add known types to expand
		config.expandTypes = addUnique(
			config.expandTypes,
			...config.graphQLExpandedTypes
		);

		// Add known properties to remove
		config.removeProps = addUnique(
			config.removeProps,
			...config.graphQLRemoveProps
		);
	}

	const schemaGeneratorConfig: SchemaGeneratorConfig = {
		path: config.path,
		tsconfig: config.tsConfigPath,
		expose: "export",
		topRef: true,
		jsDoc: "extended",
		sortProps: config.sortProperties,
		strictTuples: false,
		skipTypeCheck: config.skipTypeCheck,
		extraTags: [ ],
	};

	return { config, schemaGeneratorConfig };
}
