const { promises: fs } = require('fs');
const path = require('path')

const core = require('@actions/core');
const xmlPretty = require('xml-but-prettier');
const xmlFormatter = require('xml-formatter');


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
                  xml: xmlFormatter(
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
              ).then(
                () => console.log(xml),
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
