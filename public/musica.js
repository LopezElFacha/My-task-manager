var song = new Audio;
var isStopped = true;
var currentSong = 0;
var playlist = [];
var ramdomizedPlaylist= []
var isRandomed = false;
function cambiaNombres(){
  document.getElementById("songName").textContent = playlist[currentSong].nombre;
  document.title = playlist[currentSong].nombre;
}
function normal() {
  song.pause();
  song.currentTime = 0;
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  document.getElementById('seek').value = 0;
  if ((currentSong + 1) >= playlist.length) currentSong = 0;  
  else currentSong++;
  document.getElementById(`cancion${currentSong}`).classList.add("current")
  stop();
  song.src = playlist[currentSong].url;
  playpause();
}
function randomed() {
  song.pause()
  song.currentTime = 0;
  var nbList = playlist.length -1 ;
  var y = Math.floor((Math.random() * (nbList)));
  stop();
  song.src = playlist[y].url;
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  document.getElementById(`cancion${y}`).classList.add("current")
  currentSong = y;
  ramdomizedPlaylist.push(currentSong)
  song.play();
  cambiaNombres()
}
function skip(to) {
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  if(!isRandomed){
    if (to == 'prev') {
      stop();
      currentSong = (--currentSong)%playlist.length;
      if (currentSong < 0)currentSong += playlist.length;
      playpause();
    }
    else if (to == 'next') {
      stop();
      currentSong = (++currentSong)%playlist.length;
      playpause();
    }
  }else{
    if (to == 'prev') {
      stop();
      currentSong = ramdomizedPlaylist[ramdomizedPlaylist.indexOf(currentSong)-1]
      if (currentSong == undefined)currentSong = ramdomizedPlaylist[ramdomizedPlaylist.length - 1];
      console.log(currentSong, ramdomizedPlaylist)
      playpause();
    }
    else if (to == 'next') {
      if(ramdomizedPlaylist.indexOf(currentSong)+1 >= ramdomizedPlaylist.length){
        randomed()
      }else{
        stop();
        currentSong = ramdomizedPlaylist[ramdomizedPlaylist.indexOf(currentSong)+1]
        playpause();
      }
    }
  }
  document.getElementById(`cancion${currentSong}`).classList.add("current")
}

function playpause() {
  if (!song.paused) song.pause();
  else {
    if (isStopped) song.src = playlist[currentSong].url;
    song.play();
    songName = document.getElementById("songName");
    cambiaNombres()
    isStopped = false;
  }
}

function stop() {
  song.pause();
  song.currentTime = 0;
  document.getElementById("seek").value = 0;
  isStopped = true;
  document.getElementById("songName").innerHTML = "Los PROHIBIDOS";
}

function setPos(pos) {
  song.currentTime = pos;
}

function mute() {
  if (song.muted) {
    song.muted = false;
    document.getElementById('mute').className = "fa fa-volume-up btn-reproductor";
  }
  else {
    song.muted = true;
    document.getElementById('mute').className = "fa fa-volume-off btn-reproductor";
  }
}
function setVolume(volume) {
  song.volume = volume;
}
function play (id) {
  stop();
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  ramdomizedPlaylist = []
  currentSong = id
  ramdomizedPlaylist.push(currentSong)
  playpause();
  document.getElementById(`cancion${currentSong}`).classList.add("current")
}
function random() {
  if(!isRandomed){
    isRandomed = true
    song.removeEventListener('ended', normal)
    song.addEventListener('ended', randomed ,false);
    document.querySelector("#random").setAttribute('style', 'color: limegreen')
  }else{
    isRandomed = false
    song.removeEventListener('ended', randomed)
    song.addEventListener('ended', normal ,false);
    document.querySelector("#random").setAttribute('style', 'color: white')
  }
}
function creador(nombre, i) {
  listItem = document.createElement('div');
  listItem.setAttribute('class','list-item text-center c');
  listItem.setAttribute('id',`cancion${i}`);
  listItem.innerText = nombre;
  listItem.setAttribute('onclick', `play(${i})`);
  listItem.setAttribute('data-dismiss',"modal")
  document.getElementById('list').appendChild(listItem);
}
async function addList() {
  let i = 0;
  await firebase.storage().ref('Musica/').listAll().then((res)=>{
    res.items.forEach(async(item) => {
      let nombre = item.name
      nombre = item.name
      await item.getDownloadURL().then(url=>{
        let obj = {url,nombre, i}
        playlist.push(obj)
        creador(nombre, i)
      })
      i++;
    });
  })
}

song.addEventListener('error', function(){
  stop();
  if(confirm("Hubo un error. ¿Recargar?")) window.location.href = window.location;
});
song.addEventListener('timeupdate', function() {
  curtime = parseInt(song.currentTime,10);
  document.getElementById('seek').max = song.duration;
  document.getElementById('seek').value = curtime;
});
$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#list div").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});
song.addEventListener("ended", normal);
mute()
mute()
addList()
