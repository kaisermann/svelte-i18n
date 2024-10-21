import fs from 'fs';
import { dirname, resolve } from 'path';

import color from 'cli-color';
import sade from 'sade';
import glob from 'tiny-glob';
import { preprocess } from 'svelte/compiler';

import { extractMessages } from './extract';

const { readFile, writeFile, mkdir, access, stat } = fs.promises;

const fileExists = (path: string) =>
  access(path)
    .then(() => true)
    .catch(() => false);

const isDirectory = (path: string) =>
  stat(path).then((stats) => stats.isDirectory());

function isSvelteError(
  error: any,
  code?: string,
): error is Error & { code: string; filename: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    'code' in error &&
    (code == null || error.code === code)
  );
}

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
    `${process.cwd()}/svelte.config.js`,
  )
  .option('--unsave', 'disable the import-lib validation', false)
  .action(async (globStr, output, { shallow, overwrite, config, unsave }) => {
    const filesToExtract = (await glob(globStr)).filter((file) =>
      file.match(/\.html|svelte$/i),
    );

    const ignoreImport = unsave;
    const isConfigDir = await isDirectory(config);
    const resolvedConfigPath = resolve(
      config,
      isConfigDir ? 'svelte.config.js' : '',
    );

    if (isConfigDir) {
      console.warn(
        color.yellow(
          `Warning: -c/--config should point to the svelte.config file, not to a directory.\nUsing "${resolvedConfigPath}".`,
        ),
      );
    }

    const svelteConfig = await import(resolvedConfigPath)
      .then((mod) => mod.default || mod)
      .catch(() => null);

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
      try {
        const buffer = await readFile(filePath);
        let content = buffer.toString();

        if (svelteConfig?.preprocess) {
          const processed = await preprocess(content, svelteConfig.preprocess, {
            filename: filePath,
          });

          content = processed.code;
        }

        extractMessages(content, { accumulator, shallow, ignoreImport });
      } catch (e: unknown) {
        if (
          isSvelteError(e, 'parse-error') &&
          e.message.includes('Unexpected token')
        ) {
          const msg = [
            `Error: unexpected token detected in "${filePath}"`,
            svelteConfig == null &&
              `A svelte config is needed if the Svelte files use preprocessors. Tried to load "${resolvedConfigPath}".`,
            svelteConfig != null &&
              `A svelte config was detected at "${resolvedConfigPath}". Make sure the preprocess step is correctly configured."`,
          ]
            .filter(Boolean)
            .join('\n');

          console.error(color.red(msg));

          process.exit(1);
        }

        throw e;
      }
    }

    const jsonDictionary = JSON.stringify(accumulator, null, '  ');

    if (output == null) return console.log(jsonDictionary);

    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, jsonDictionary);
  });

program.parse(process.argv);
