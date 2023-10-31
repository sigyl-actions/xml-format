const { promises: fs } = require('fs');
const path = require('path')

const core = require('@actions/core');
const xmlPretty = require('xml-but-prettier');


async function run() {
  try {
    const regex = new RegExp(
      core.getInput('regex') || '^.+\.(([xX][mM][lL]))$' || '.',
    )
    const directory = core.getInput('folder') || '.'

    fs.readdir(
      directory,
      { withFileTypes: true },
    )
      .then(
        (dirents) => dirents
          .filter(
            (dirent) => dirent.isFile(),
          )
          .map(
            ({
              name,
            }) => name,
          )
      )
      .then(
        (files) => Promise.all(
          files.filter(
            (file) => file.match(regex)
          ).map(
            (file) => path.join(
              directory,
              file,
            ),
          )
            .map(
              (filePath) => fs.readFile(
                filePath
              ).then(
                (buffer) => ({
                  filePath,
                  xml: xmlPretty(
                    buffer.toString(),
                  ),
                }),
              ),
            )
        )
      )
      .then(
        (xmls) => Promise.all(
          xmls
            .map(
              ({
                filePath,
                xml,
              }) => fs.writeFile(
                filePath,
                xml,
              )
            )
        )
      )
      .catch(
        (ex) => {
          core.setFailed(ex.message)
        },
      );
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
