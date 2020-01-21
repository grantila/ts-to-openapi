import { safeDump } from 'js-yaml'

import { Config } from './types'


export function toYAML( obj: any, config: Config ): string
{
	const yml = safeDump(
		obj,
		{
			indent: 2,
			noArrayIndent: false,
			skipInvalid: false,
			flowLevel: -1,
			sortKeys: config.sortProperties,
			lineWidth: 80,
			noRefs: true,
			noCompatMode: false,
			condenseFlow: false,
		}
	);

	if ( config.asComment )
	{
		return [
			'/**',
			' * @swagger',
			...yml
				.split( "\n" )
				.filter( ( line, index, arr ) =>
					index < arr.length - 1 || line
				)
				.map( line => ` * ${line}` ),
			' */',
			''
		].join( "\n" );
	}
	else
		return yml;
}
