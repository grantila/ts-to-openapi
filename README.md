# ts-to-openapi

This package converts TypeScript interfaces and types to OpenAPI/Swagger YAML.

It can detect what looks like GraphQL-to-TypeScript converted files, and clean them up (e.g. auto-expanding `Scalar` and `Maybe`).

The result is a set of schema components which can be referred to in OpenAPI/Swagger routes (or from other components).


# Example

The following converts types `MyTypeA` and `MyTypeB` in `my-file.ts` into OpenAPI YAML and writes to stdout:
```
$> ts-to-openapi -f my-file.ts -t MyTypeA,MyTypeB
```

# Usage

```
   Usage: ts-to-openapi [options]

   Convert TypeScript types and interfaces to OpenAPI YAML

   Options:

      -h, --help                                          Print (this) help screen
      -v, --version                                       Print the program version
      -f, --file <file>                                   .ts file to read
      -c, --config <config>                               Config file to use. Defaults to .ts-to-openapirc in the root of the project.
      --tsconfig <tsconfig>                               tsconfig.json file to use. Defaults to the first found in parent directories of PWD.
      --(no-)sort-props                                   Sort the properties in the types (default: true)
      --(no-)as-comment                                   Output OpenAPI YAML inside a source code comment /* ... */ (default: true)
      --(no-)type-check                                   Type-check the input file and fail on type errors (default: true)
      --(no-)detect-graphql                               Auto-expand GraphQL types (e.g. Maybe, Scalar) and remove __typename (default: true)
      --graphql-expanded-types <graphql-expanded-types>   Define which GraphQL types to expand (replaces the built-in list)
      --graphql-remove-props <graphql-remove-props>       Define which GraphQL properties to remove (replaces the built-in list)
      --expand-types <expand-types>                       Additional types to expand rather than include as their own types
      --remove-props <remove-props>                       Additional properties to remove from types
      -t, --types <types>                                 The types to convert to OpenAPI
```