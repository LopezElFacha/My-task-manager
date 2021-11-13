var song = new Audio;
var isStopped = true;
var currentSong = 0;
var playlist = [];
var isRandomed = false;
function normal() {
  song.pause();
  song.currentTime = 0;
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  document.getElementById('seek').value = 0;
  if ((currentSong + 1) >= playlist.length) {
    currentSong = 0;  
  }
  else {
    currentSong++;
  }
  document.getElementById(`cancion${currentSong}`).classList.add("current")
  stop();
  song.src = playlist[currentSong].url;
  playpause();
}
function randomed(e) {
  song.pause()
  song.currentTime = 0;
  var nbList = playlist.length -1 ;
  var y = Math.floor((Math.random() * (nbList)));
  stop();
  song.src = playlist[y].url;
  console.log(y)
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  document.getElementById(`cancion${y}`).classList.add("current")
  currentSong = y;
  song.play();
  document.getElementById("songName").textContent = playlist[currentSong].nombre;
  document.title = playlist[currentSong].nombre;
}
function skip(to) {
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  if (to == 'prev') {
    stop();
    currentSong = (--currentSong)%playlist.length;
    if (currentSong < 0) {
      currentSong += playlist.length;
    }
    playpause();
  }
  else if (to == 'next') {
    stop();
    currentSong = (++currentSong)%playlist.length;
    playpause();
  }
  document.getElementById(`cancion${currentSong}`).classList.add("current")
}

function playpause() {
  if (!song.paused) {
    song.pause();
  }
  else {
    if (isStopped) {
      song.src = playlist[currentSong].url;
    }
    song.play();
    songName = document.getElementById("songName");
    songName.innerHTML = playlist[currentSong].nombre;
    document.title = playlist[currentSong].nombre;
    isStopped = false;
  }
}

function stop() {
  song.pause();
  song.currentTime = 0;
  document.getElementById("seek").value = 0;
  isStopped = true;
  document.getElementById("songName").innerHTML = "Coding and Stuff";
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
function togglePlaylist() {
  $("#myModal").modal('show');
}
function play (id) {
  stop();
  document.getElementById(`cancion${currentSong}`).classList.remove("current")
  currentSong = id
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
  song.play();
  document.getElementById("songName").textContent = playlist[currentSong].nombre;
  document.title = playlist[currentSong].nombre;
  console.log(isRandomed)
}
function creador(nombre, i) {
  listItem = document.createElement('div');
  listItem.setAttribute('class','list-item');
  listItem.setAttribute('id',`cancion${i}`);

  wrapper = document.createElement('div');
  wrapper.setAttribute('class','wrap-text');

  span = document.createElement('span');
  span.innerHTML = nombre;
  span.setAttribute('onclick', `play(${i})`);
  span.setAttribute('style', 'cursor:pointer');
  span.setAttribute('data-dismiss',"modal")

  wrapper.appendChild(span);
  listItem.appendChild(wrapper);

  document.getElementById('list').appendChild(listItem);
}
async function addList() {
  let i = 0;
  await firebase.storage().ref().listAll().then((res)=>{
    res.items.forEach(async(item) => {
      let nombre = item.name
      if(nombre.length > 25) {
        nombre = nombre.substr(0, 20)
        nombre = nombre.concat("...")
      }
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
  if(confirm("hubo un error. recargar?")) window.location.href = window.location;
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
