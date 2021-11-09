const express = require('express');
const bodyParser = require('body-parser');
const NodeID3 = require('node-id3');
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");


const app = express();
const port = 3000;

//set templating engine
app.set('view engine', 'ejs');

// app.use(express.urlencoded({ extended: false }));
const urlencodedParser = bodyParser.urlencoded({ extended: false });


app.get('/', (req, res) => {

  res.render('index');
});

app.get('/queue', (req, res) => {

  res.render('queue');
});


let globalSongInfo = new Array();

let globalSourcelink = [];


app.post('/queue', urlencodedParser, (req, res) => {
  // console.log(req.body);

  globalSourcelink = [req.body.sourcelink0, req.body.sourcelink1]; //wyciagniecie linka z routa wczesniej, zeby moc uruchomic scraper w /download



  // console.log(req.body.sourcelink1);
  // console.log(req.body.sourcelink2);


  async function getInfo(){
    for(i = 0; i < 2; i++){
      // console.log(globalSourcelink[0]);
      // console.log(globalSourcelink[1]);
  
      client.getSongInfo(globalSourcelink[i])
      .then(async song => {
          // console.log(song);
          globalSongInfo.push(song);  //jakby wyciagniecie danych song wyzej, globalnie do globalSongInfo, zeby moc je uzyc w pozniejszym roucie
          // console.log(globalSongInfo);
          // res.render('queue', {song: globalSongInfo[i]}); //render strony, z przekazaniem danych, zeby moc je podstawic w inputach
      })
      .catch(console.error);
      // res.render('queue', {song: globalSongInfo1, globalSongInfo2}); //render strony, z przekazaniem danych, zeby moc je podstawic w inputach
       //render strony, z przekazaniem danych, zeby moc je podstawic w inputach
    }
    return true;
  }
  // console.log(globalSongInfo[0]);

  // globalSongInfo.forEach()

  getInfo().then(res.json(globalSongInfo[0].title));
  
  // client.getSongInfo(globalSourcelink)
  //   .then(async song => {
  //       // console.log(song);
  //       globalSongInfo = song;  //jakby wyciagniecie danych song wyzej, globalnie do globalSongInfo, zeby moc je uzyc w pozniejszym roucie
  //       res.render('queue', {song: globalSongInfo}); //render strony, z przekazaniem danych, zeby moc je podstawic w inputach
  //   })
  //   .catch(console.error);
});


// app.post('/download', urlencodedParser, (req, res) => {

//   client.getSongInfo(globalSourcelink)  //wywolanie scrapera znowu z linkiem, ale tym razem korzystac z globalnych danych, ktore zostaly zapisane w roucie wczeniej i zedytowane, chuj wie jak to dziala
//     .then(async globalSongInfo => {
//         const stream = await globalSongInfo.downloadProgressive();
//         const fileName = req.body.artist + " - " + req.body.title;
//         const writer = stream.pipe(fs.createWriteStream(`./music/${fileName}.mp3`));

//       //node-id3 section
//       //writing tags
//         const filebuffer = Buffer.from("Some Buffer of a (mp3) file") //chuj wie co to
//         const filepath = `./music/${fileName}.mp3`
//         const tags = {
//             title: req.body.title,
//             artist: req.body.artist,
//             album: req.body.soundcloud,
//             composer: req.body.spotify,
//             genre: req.body.youtube,
//             subtitle: req.body.sourcelink,
//         }

//         writer.on("finish", () => {
//         console.log("Finished writing song!")
//         NodeID3.write(tags, filepath, function(err) { }); //wywolanie funkcji zapisu z node-id3
//         res.json(req.body); //render json po edycji danych na poprzednim roucie
//         });
//     })
//     .catch(console.error);
    
//   // res.json(req.body)
// });

app.listen(port);