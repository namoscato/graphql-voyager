import { ExecutionResult, GraphQLSchema, IntrospectionQuery } from 'graphql';

export interface PrebuiltGraph {
  introspection: ExecutionResult<IntrospectionQuery> | GraphQLSchema;
  svg: string;
}

export function isPrebuiltGraph(object: unknown): object is PrebuiltGraph {
  return (
    'object' === typeof object &&
    'object' === typeof (object as PrebuiltGraph).introspection &&
    'string' === typeof (object as PrebuiltGraph).svg
  );
}
