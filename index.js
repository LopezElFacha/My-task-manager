firebase.auth().onAuthStateChanged((user) => {
    if(user == null){
        window.location.replace("/login.html")
    }
})
document.querySelector("#cerrar").addEventListener("click", ()=>{
    firebase.auth().signOut().then(()=>{
        location.replace("/login.html");
    })
})
const temazo = "hybrid rainbow" 
let fecha = new Date();
let options = { year: 'numeric', month: 'long', day: 'numeric' };
document.querySelector("#fecha").innerText = fecha.toLocaleDateString("es-ES", options)

const addZeros = n => {
    if (n.toString().length < 2) return "0".concat(n);
    return n
}
const actualizarhora = () => {
    const time = new Date();
    let hora = addZeros(time.getHours());
    let min = addZeros(time.getMinutes());
    let seg = addZeros(time.getSeconds());
    document.querySelector("#hora").innerText = `${hora}:${min}:${seg}`
}
actualizarhora()
setInterval(actualizarhora, 1000)

const form = document.querySelector("#task-form")
let status = false;
let id = "";
const db = firebase.firestore();
const taskContainer = document.querySelector("#task-container")
const saveTask = (title, description) => {
    db.collection("tasks").doc().set({
        "titulo": title,
        "descripcion": description,
        "fecha": new Date()
    })
}
const deleteTask = id => db.collection("tasks").doc(id).delete()
const getTasks = () => db.collection("tasks").get();
const onGetTasks = (cb) => db.collection("tasks").onSnapshot(cb)
const getTask = (id) => db.collection("tasks").doc(id).get()
const updateTask = (id, task) => db.collection("tasks").doc(id).update(task)
const getCont = () => db.collection("config").doc("contador_visitas").get()
window.addEventListener("DOMContentLoaded", async(e) => {
    getCont().then((doc) => {
        let datos = doc.data()
        datos.cont = datos.cont + 1
        db.collection("config").doc("contador_visitas").update(datos)
        document.querySelector("#cont").innerText = `Contador de visitas: ${datos.cont}`
    })
    onGetTasks((querySnapshot) => {
        taskContainer.innerHTML = ""
        let miArray = [];
        querySnapshot.forEach(doc => {
            const task = doc.data()
            task.id = doc.id
            miArray.push(task)
        });
        miArray.sort(function (a, b) {
            if (a.fecha > b.fecha)return 1;
            if (a.fecha < b.fecha)return -1;
            return 0;
        })
        miArray.forEach(task=>{
            let timestamp = task.fecha
            let date = new Date(timestamp * 1000);
            let options2 = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            let desde = date.toLocaleDateString("es-ES", options2)
            taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                <h5>${task.titulo}</h5>
                <p>${task.descripcion}</p>
                <p> <span class="badge badge-pill bg-info">${desde}</span> </p>
                <div>
                    <button class="btn btn-danger btn-delete" data-id="${task.id}">Borrar</button> 
                    <button class="btn btn-warning btn-edit" data-id="${task.id}">Editar</button>
                </div>
            </div>`
            const btnsDelete = document.querySelectorAll(".btn-delete")
            btnsDelete.forEach(btn => {
                btn.addEventListener("click", async(e) => {
                    await deleteTask(e.target.dataset.id)
                })
            })
            const btnsEdit = document.querySelectorAll(".btn-edit")
            btnsEdit.forEach(btn => {
                btn.addEventListener("click", async(e) => {
                    const doc = await getTask(e.target.dataset.id)
                    const task = doc.data()
                    status = true
                    id = doc.id
                    form["task-title"].value = task.titulo
                    form["task-description"].value = task.descripcion
                    form["btn-task-form"].innerText = "guardar"
                })
            })
        })
    })

})
form.addEventListener("submit", async(e) => {
    e.preventDefault();
    const title = form["task-title"];
    const description = form["task-description"];
    if (!status) await saveTask(title.value, description.value)
    else {
        await updateTask(id, {
            "titulo": title.value,
            "descripcion": description.value
        })
        status = false
        id = ""
        form["btn-task-form"].innerText = "enviar"
    }
    form.reset();
    title.focus();
    await getTasks();
})