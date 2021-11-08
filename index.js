
const express = require('express');
const path = require('path');
const ejsLayout = require('express-ejs-layouts');
const app = express();
const NodeID3 = require('node-id3');

// veiw engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// layout
app.use(ejsLayout);
app.set('layout', 'layouts/main');
// folder publiczny:
app.use(express.static('public'));



app.get('/home', (req, res) => {
  res.render('pages/home', {
    title: 'Home',
  });
});

//---------------------------------------------------

// parser do formularzy
app.use(express.urlencoded({ extended: true }));

const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");

app.get('/create', (req, res) => {
  res.render('pages/create', {
    title: 'Edytor',
    getInfoTitle,
    getInfoArtist,
    getInfoscArtist,
    getInfoLink,
  });
});

app.post('/create', (req, res) => {

  client.getSongInfo(getInfoLink)
    .then(async song => {
        const stream = await song.downloadProgressive();
        const writer = stream.pipe(fs.createWriteStream(`./music/${req.body.title}.mp3`));
        writer.on("finish", () => {
          console.log("Pobrano!")

          const filebuffer = Buffer.from("Some Buffer of a (mp3) file");
          const filepath = `./music/${req.body.title}.mp3`

          const tags = {
              title: req.body.title,
              artist: req.body.artist,
              album: req.body.scArtist,
              composer: req.body.spotify,
              genre: req.body.youtube,
              subtitle: req.body.scDownload,
          }
          const success = NodeID3.write(tags, filepath);
          
          console.log(success);

          const tagsEdited = NodeID3.read(filepath);
          NodeID3.read(filepath, function(err, tags) {});
          console.log(tagsEdited);

          res.redirect('/');


        });
    })
    .catch(console.error);

    

    
    

});


let getInfoLink;
let getInfoTitle;
let getInfoArtist;
let getInfoscArtist;
let errorAlert = "";


app.get('/', (req, res) => {
  res.render('pages/getinfo', {
    title: 'Get Info',
    errorAlert,
  });
});

app.post('/', (req, res) => {

        
        getInfoLink = req.body.link;


        console.log('Przeslano link: ' + getInfoLink);

        client.getSongInfo(getInfoLink)
        .then(async song => {
            getInfoTitle = song.title;
            getInfoArtist = song.author.name;
            getInfoscArtist = song.author.url;

            res.redirect('/create');
        })
        .catch(error => {
          errorAlert = error;
          res.redirect('/');

          setTimeout(resetAlert, 1000);
          
        }
          );

});


function resetAlert() {
  errorAlert = "";
}


//---------------------------------------------------

app.get('*', (req, res) => {
  res.render('errors/404', {
    title: 'Error 404',
  });
});

app.listen(3000);