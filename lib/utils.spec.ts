import { findFile } from "./utils";

describe( "utils", ( ) =>
{
    describe( "findFile", ( ) =>
    {
        // Verifies the fix for https://github.com/grantila/ts-to-openapi/issues/3
        it( "gracefully fails to find a file", async ( ) =>
        {
            const cwd = process.cwd();
            const result = findFile(cwd, 'this-filename-probably-doesnt-exist.probably');
            expect(result).toBeNull();            
        } );
    } );
} );
