import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import {
  buildClientSchema,
  ExecutionResult,
  IntrospectionQuery,
} from 'graphql';

import { VoyagerDisplayOptions } from '../src/components/Voyager';
import { getDot } from '../src/graph/dot';
import { getTypeGraph } from '../src/graph/type-graph';
import { getSchema } from '../src/introspection/introspection';

void main({
  inputFilePath: process.argv[2],
  outputFilePath: process.argv[3],
});

async function main({
  inputFilePath,
  outputFilePath,
}: {
  inputFilePath: string | undefined;
  outputFilePath: string | undefined;
}): Promise<void> {
  if (!inputFilePath) {
    throw new Error('inputFilePath argument required');
  }

  if (!outputFilePath) {
    throw new Error('outputDir argument required');
  }

  console.log(`Reading file: ${inputFilePath}`);
  const inputFile = JSON.parse(
    readFileSync(inputFilePath, { encoding: 'utf-8' }),
  ) as ExecutionResult<IntrospectionQuery>;

  if (!inputFile.data) {
    throw new Error('Unexpected introspection query contents');
  }

  const displayOptions: VoyagerDisplayOptions = {
    skipRelay: true,
    skipDeprecated: true,
    sortByAlphabet: false,
    showLeafFields: false,
    hideRoot: false,
  };

  console.log('Generating type graph');
  const schema = getSchema(buildClientSchema(inputFile.data), displayOptions);
  const typeGraph = getTypeGraph(schema, displayOptions);
  const graph = getDot(typeGraph);

  await spawnGraphviz({
    graph,
    outfile: outputFilePath,
  });
}

function spawnGraphviz({
  graph,
  outfile,
}: {
  graph: string;
  outfile: string;
}): Promise<number | null> {
  console.log(`Rendering digraph: ${outfile}`);
  console.time('graphviz');

  return new Promise(function (resolve, reject) {
    const args = ['-Tsvg', '-o', outfile];

    console.log(`> dot ${args.join(' ')}`);
    const child = spawn('dot', args);

    child.on('close', function (code) {
      console.timeEnd('graphviz');
      resolve(code);
    });

    child.on('error', function (err) {
      console.timeEnd('graphviz');
      reject(err);
    });

    child.stdin.write(graph);
    child.stdin.end();
  });
}
