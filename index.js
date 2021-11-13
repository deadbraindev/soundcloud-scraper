const express = require('express');
const bodyParser = require('body-parser');
const NodeID3 = require('node-id3');
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");
const path = require('path');

const request = require('request'); //pobieranie jpg


const app = express();
const port = 3000;

//set templating engine
app.set('view engine', 'ejs');

//dodanie folderu publicznego z js, css itd.
app.use("/public", express.static('public'));

// app.use(express.urlencoded({ extended: false }));
const urlencodedParser = bodyParser.urlencoded({ extended: false });


// function getMusicInfo(songUrl, arr) {
//   client.getSongInfo(songUrl)
//   .then(songInfo => {
//     arr.push(
//       {
//       title: songInfo.title,
//       artist: songInfo.author.name,
//       album: songInfo.author.url,
//       composer: "",
//       genre: "",
//       subtitle: songInfo.url,
//       image: songInfo.thumbnail,
//     })
//     console.log("arr push")
//   })
//   .catch(console.error);
// };

// async function getSongs1(arrSongs, arrSourcelinks) {
//   const promises = await arrSourcelinks.map(async item => {
//     const numItem = new Promise((resolve, reject) => {
//       getMusicInfo(item, arrSongs);
//       resolve(item);
//     });
//     return numItem;
//     })
//     const numItems = await Promise.all(promises);
//     console.log(numItems + "aaa");
    
//     console.log("end map");
// }


async function getSongs(arrSongs, arrSourcelinks) {  
  for await (const [i, sourcelink] of arrSourcelinks.entries()) {
    await client.getSongInfo(sourcelink)
    .then(async songInfo => {
    await arrSongs.push(
      {
      artist: songInfo.author.name,
      title: songInfo.title,
      album: songInfo.author.url,
      composer: "",
      genre: "",
      subtitle: songInfo.url,
      image: songInfo.thumbnail,
    })

    console.log(i+1 + "/" + arrSourcelinks.length)


    })
    .catch(console.error);
  }
}

async function updateSongsTags(arrSongs, arrEdited) {
  if (typeof arrEdited.artist === "array") {
    for await (const [i, song] of arrSongs.entries()) {
      song.artist = arrEdited.artist[i];
      song.title = arrEdited.title[i];
      song.album = arrEdited.soundcloud[i];
      song.composer = arrEdited.spotify[i];
      song.genre = arrEdited.youtube[i];
      song.subtitle = arrEdited.sourcelink[i];
    }
  }
  else {
    arrSongs.artist = arrEdited.artist;
    arrSongs.title = arrEdited.title;
    arrSongs.album = arrEdited.soundcloud;
    arrSongs.composer = arrEdited.spotify;
    arrSongs.genre = arrEdited.youtube;
    arrSongs.subtitle = arrEdited.sourcelink;
  }
  
}


let songsTags = new Array();


//get
app.get('/', (req, res) => {

  res.render('index');
});

app.get('/queue', (req, res) => {

  res.render('queue');
});




let sourcelinks;



//post
app.post('/queue', urlencodedParser, (req, res) => {

    if(typeof req.body.sourcelink === "string") {
      sourcelinks = new Array(req.body.sourcelink);

    }
    else {
      sourcelinks = req.body.sourcelink;

    }
 
  async function rend() {
    await getSongs(songsTags, sourcelinks);
    res.render('queue', {songs: songsTags});
  }
  // const tags = NodeID3.read(`./music/muzykolega - Always i recognize You.mp3`)
  // console.log(tags);

  rend();
});





async function downloadSong(arrSourcelinks) {
  for await (const [i, sourcelink] of arrSourcelinks.entries()) {
    client.getSongInfo(sourcelink)
    .then(async songInfo => {

      const filepath = `${songsTags[i].artist} - ${songsTags[i].title}`

      const stream = await songInfo.downloadProgressive();
      const writer = stream.pipe(fs.createWriteStream("./music/" + filepath + ".mp3"));

      writer.on("finish", () => {
        console.log("save song number: " + (i+1))

        download(songsTags[i].image, "./music/temp/" + filepath + ".jpg", () => {
          songsTags[i].image = "./music/temp/" + filepath + ".jpg";
          NodeID3.write(songsTags[i], "./music/" + filepath + ".mp3", function(err) { }); //wywolanie funkcji zapisu z node-id3
          console.log("tags song: " + (i+1))
          
        })
      

      });
    })
    .catch(console.error);
  }
}

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on("close", callback)
    
  })
}








app.post('/download', urlencodedParser, (req, res) => {

  async function rend() {
    await updateSongsTags(songsTags, req.body)
    await downloadSong(sourcelinks);
    // console.log("ready")
    
    res.json(req.body)
    console.log("complete!");
  }

  rend();    
});

app.listen(port);