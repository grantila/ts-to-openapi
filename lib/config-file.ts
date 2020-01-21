import { Config } from './types'
import { findConfigFile, findPackageJsonFile, readJson } from './utils'


export interface ConfigFromFileResult
{
	usedConfigFile: boolean;
	usedPackageJson: boolean;
	config: Partial< Config >;
}

export function readConfigFromFile( opts: Partial< Config > )
: ConfigFromFileResult
{
	// Custom config file, or find closest .ts-to-openapirc
	const configFile = opts.configFile || findConfigFile( process.cwd( ) );

	// Find closest package.json
	const packageJsonFile = findPackageJsonFile( process.cwd( ) );

	const configByConfigFile = !configFile ? { } : readJson( configFile );

	const configByPackageJson = !packageJsonFile ? { } :
		readJson( packageJsonFile ).tsToOpenAPI;

	const config: Partial< Config > =
		Object.assign( { }, configByConfigFile, configByPackageJson );

	return {
		usedConfigFile: !!configFile,
		usedPackageJson: !!packageJsonFile,
		config,
	};
}
