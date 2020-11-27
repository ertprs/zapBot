const fs = require('fs')
const mime = require('mime-types')
const moment = require('moment');
const venom = require('venom-bot')
const axios = require('axios');
var sleep = require('sleep');

let array = ['😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵'];

let estados = ['ro','ac','am','rr','pa','ap','to','ma','pi','ce','rn','pb','pe','al','se','ba','mg','es','rj','sp','pr','sc','rs','ms','mt','go','df'];

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
  client.onAddedToGroup(chatEvent => {
    client.sendText(chatEvent.id,'🤖 Olá sou o Corona Bot e vim te atulalizar sobre os números da COVID-19. \n Digite *.comandos* para saber meus comandos.');
  });
  
  client.onMessage(async (message) => {
    /*if (message.isMedia == true) {
      const buffer = await client.decryptFile(message)
      const fileName = `image.gif`
      await fs.writeFile(fileName, buffer, async (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log('File written successfully')
          await client.sendImageAsStickerGif(message.from, `./${fileName}`)
            .catch((err) => { })
        }
      })
    }*/
    if(message.body === '.comandos') {
      client.sendText(message.from, 'Comandos \n 🔹 .brcovid \n 🔹 .uf + covid ( \n *Exemplo:* .pbcovid \n) \n 🔹 .comandos');
    }
    if (message.body.startsWith('.') && estados.includes(message.body.substring(1,3).toLowerCase()) && message.body.endsWith('covid')) {

      const state_lower = message.body.substring(1,3).toLowerCase();
      console.log(state_lower);
      const state_covid = await axios.get(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/uf/${state_lower}`);
      

      moment.locale('pt-BR');

      const {state, cases, deaths, datetime} = state_covid.data;

      const date = moment(datetime).format('DD/MM/YYYY');
      const hour = moment(datetime).format('HH:mm'); 

      const cases_f = cases.toLocaleString('pt-BR').replace(',','.');
      
      client.sendText(message.from, `⚠️ Status da COVID-19 na ${state} ⚠️ \n Casos confirmados: *${cases_f.toLocaleString('pt-BR').replace(',','.')}* \n Mortes: *${deaths.toLocaleString('pt-BR').replace(',','.')}* \n Última atualização feita em ${date} às ${hour}.`);

      client.sendText(message.from, 'Fique em casa, se for sair use máscara! 😷');

    }
    if(message.body === '.brcovid') {
      
      const countries = await axios.get('https://covid19-brazil-api.now.sh/api/report/v1/countries/');


      const br = countries.data.data.filter((c) => {
        return c.country === 'Brazil';
        })

      moment.locale('pt-BR');

      const {confirmed, deaths, updated_at} = br[0];

      const confirmed_f = confirmed.toLocaleString('pt-BR').replace(',','.');
      
      const date = moment(updated_at).format('DD/MM/YYYY');
      const hour = moment(updated_at).format('HH:mm'); 
      
      client.sendText(message.from, `⚠️ Status da COVID-19 no Brasil ⚠️ \n Casos confirmados: *${confirmed_f.replace(',','.')}* \n Mortes: *${deaths.toLocaleString('pt-BR').replace(',','.')}* \n Última atualização feita em ${date} às ${hour}.`);

      client.sendText(message.from, 'Fique em casa, se for sair use máscara! 😷');

    }
  })
}
