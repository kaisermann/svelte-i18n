import fs from 'fs';
import { dirname, resolve } from 'path';

import sade from 'sade';
import glob from 'tiny-glob';
import { preprocess } from 'svelte/compiler';

import { extractMessages } from './extract';

const { readFile, writeFile, mkdir, access } = fs.promises;

const fileExists = (path: string) =>
  access(path)
    .then(() => true)
    .catch(() => false);

const program = sade('svelte-i18n');

program
  .command('extract <glob> [output]')
  .describe('extract all message definitions from files to a json')
  .option(
    '-s, --shallow',
    'extract to a shallow dictionary (ids with dots interpreted as strings, not paths)',
    false,
  )
  .option(
    '--overwrite',
    'overwrite the content of the output file instead of just appending new properties',
    false,
  )
  .option(
    '-c, --config <dir>',
    'path to the "svelte.config.js" file',
    process.cwd(),
  )
  .action(async (globStr, output, { shallow, overwrite, config }) => {
    const filesToExtract = (await glob(globStr)).filter((file) =>
      file.match(/\.html|svelte$/i),
    );

    const svelteConfig = await import(
      resolve(config, 'svelte.config.js')
    ).catch(() => null);

    let accumulator = {};

    if (output != null && overwrite === false && (await fileExists(output))) {
      accumulator = await readFile(output)
        .then((file) => JSON.parse(file.toString()))
        .catch((e: Error) => {
          console.warn(e);
          accumulator = {};
        });
    }

    for await (const filePath of filesToExtract) {
      const buffer = await readFile(filePath);
      let content = buffer.toString();

      if (svelteConfig?.preprocess) {
        const processed = await preprocess(content, svelteConfig.preprocess, {
          filename: filePath,
        });

        content = processed.code;
      }

      extractMessages(content, { filePath, accumulator, shallow });
    }

    const jsonDictionary = JSON.stringify(accumulator, null, '  ');

    if (output == null) return console.log(jsonDictionary);

    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, jsonDictionary);
  });

program.parse(process.argv);
