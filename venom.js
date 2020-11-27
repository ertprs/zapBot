const fs = require('fs')
const mime = require('mime-types')
const venom = require('venom-bot')
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());


app.use('/static', express.static('public'));

app.use("/", (req,res) => {
  venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};
 
      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], 'base64');
 
      var imageBuffer = response;
      fs.writeFile(
      './public/out.png',
        imageBuffer['data'],
        'binary',
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    undefined,
    { logQR: false }
  )
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage(async (message) => {
    if (message.isMedia == true) {
      const buffer = await client.decryptFile(message)
      const fileName = `image.${mime.extension(message.mimetype)}`
      await fs.writeFile(fileName, buffer, async (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log('File written successfully')
          await client.sendImageAsSticker(message.from, `./${fileName}`)
            .catch((err) => { })
        }
      })
    }
    if (message.body === 'Hi') {
      client.sendText(message.from, `Iae ${message.sender.shortName}`)
    }
  })
}
res.send("ok")
})


module.exports = app;