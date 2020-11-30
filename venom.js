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
    client.sendText(chatEvent.id,'🤖 Olá sou o Corona Bot e vim te atulalizar sobre os números da COVID-19. \n Digite *.comandos* para saber meus comandos. \n Desenvolvido por: Rafael Dantas. \n Contato: (83) 9 9694-5519');
  });
  
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
    if(message.body === '.comandos') {
      client.sendText(message.from, 'Comandos \n 🔹 .brcovid \n 🔹 .uf + covid (Exemplo: .pbcovid) \n 🔹 Manda tua imagem que eu faço figurinha. \n 🔹 .comandos');
    }
    if (message.body.startsWith('.') && estados.includes(message.body.substring(1,3).toLowerCase()) && message.body.endsWith('covid')) {
      console.log("entrei no if")
      const state_lower = message.body.substring(1,3).toLowerCase();
      
      const state_covid = await axios.get(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/uf/${state_lower}`);
      console.log(state_lower);

      moment.locale('pt-BR');

      const {state, cases, deaths, datetime} = state_covid.data;
      const total_mortes = deaths;

      const hoje = moment(datetime).format('DD/MM/YYYY');

      const ano = hoje.substring(6,10);
      const mes = hoje.substring(3,5);
      const ontem_day_number = parseInt(hoje.substring(0,2)) - 1;
      const ontem_day = ontem_day_number.toString();
      const query = ano.concat(`${mes}`,`${ontem_day}`);
      console.log(query);

      const state_covid_ontem = await axios.get(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/${query}`);


      const recupera_mesmo_estado = state_covid_ontem.data.data.filter((s) => {
        return s.uf === state_covid.data.uf;
        })
        console.log(recupera_mesmo_estado);
        const mortes_ontem = recupera_mesmo_estado[0].deaths;
        
        const morte_diaria = total_mortes - mortes_ontem;
        console.log(morte_diaria);

      const hour = moment(datetime).format('HH:mm'); 

      const cases_f = cases.toLocaleString('pt-BR').replace(',','.');
      
      client.sendText(message.from, `⚠️ Status da COVID-19 -> ${state} ⚠️ \n Total de casos confirmados: *${cases_f.toLocaleString('pt-BR').replace(',','.')}* \n Total de mortes: *${total_mortes.toLocaleString('pt-BR').replace(',','.')}* \n Mortes diária: *${morte_diaria}* \n Última atualização feita em ${hoje} às ${hour}.`);

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

      const ano = date.substring(6,10);
      const mes = date.substring(3,5);
      const ontem_day_number = parseInt(date.substring(0,2)) - 2;
      const ontem_day = ontem_day_number.toString();
      const query = ano.concat(`${mes}`,`${ontem_day}`);
      

      const states_covid_ontem = await axios.get(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/${query}`);
      const mortes_ontem = states_covid_ontem.data.data.reduce((total, state) => total + state.deaths, 0);
        
      const mortes_diaria = deaths - mortes_ontem;
      const hour = moment(updated_at).format('HH:mm'); 
      
      client.sendText(message.from, `⚠️ Status da COVID-19 no Brasil ⚠️ \n Total de casos confirmados: *${confirmed_f.replace(',','.')}* \n Total de Mortes: *${deaths.toLocaleString('pt-BR').replace(',','.')}* \n Mortes diária: *${mortes_diaria}* \n Última atualização feita em ${date} às ${hour}.`);

      client.sendText(message.from, 'Fique em casa, se for sair use máscara! 😷');

    }
  })
}
