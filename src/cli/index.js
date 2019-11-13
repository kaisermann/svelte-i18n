const {
  promises: { readFile },
} = require('fs')

const glob = require('tiny-glob')

const { collectMessages } = require('./extract.js')

async function init() {
  const [command, ...args] = process.argv.slice(2)

  if (command === 'extract') {
    const [globString, outputPath] = args
    const files = (await glob(globString)).filter(file =>
      file.match(/\.html|svelte$/i),
    )

    const dictionary = {}
    for await (const filePath of files) {
      const buffer = await readFile(filePath)
      collectMessages(buffer.toString(), dictionary)
    }

    if (outputPath == null) {
      return console.log(JSON.stringify(dictionary, null, '  '))
    }
  }
}

init()
