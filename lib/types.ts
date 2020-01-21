export interface Config
{
	path: string;
	tsConfigPath: string;
	configFile: string;
	sortProperties: boolean;
	asComment: boolean;
	skipTypeCheck: boolean;
	detectGraphQL: boolean;
	graphQLExpandedTypes: Array< string >;
	graphQLRemoveProps: Array< string >;
	expandTypes: Array< string >;
	removeProps: Array< string >;
	types: Array< string >;
}
