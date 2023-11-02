const { promises: fs } = require('fs');
const path = require('path')

const core = require('@actions/core');
// const xmlFormatter = require('xml-formatter');
var convert = require('xml-js');


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
                filePath,
                'utf8',
              ).then(
                (buffer) => ({
                  filePath,
                  xml: convert.json2xml(
                    convert.xml2json(
                      buffer,
                    ),
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
