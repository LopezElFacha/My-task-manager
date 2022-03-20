firebase.auth().onAuthStateChanged(user => {
    //config
    if(user == null) window.location.replace("/login.html")
    firebase.storage().ref(`Fondos/`).child(user.uid).getDownloadURL().then(url=>document.body.style.backgroundImage = `url("${url}")`)
    document.querySelector("#saludo").innerHTML = `Hola ${user.displayName}!`
    //crud
    const form = document.querySelector("#task-form")
    const prioridadOptions = document.querySelectorAll("#Prioridad option")
    const btnEnviar = document.querySelector("#btn-task-form")
    const btnConfigEnviar = document.querySelector("#btn-config-form")
    const cancelar = document.querySelector("#Cancelar")
    const error = document.querySelector("#error")
    let status = false;
    let id = "";
    const db = firebase.firestore();
    const taskContainer = document.querySelector("#task-container")
    const saveTask = (title, description, prioridad) => {
        db.collection(user.uid).doc().set({
            "titulo": title,
            "descripcion": description,
            "prioridad":prioridad,
            "fecha": new Date()
        })
    }
    const deleteTask = id => db.collection(user.uid).doc(id).delete()
    const getTasks = () => db.collection(user.uid).orderBy("fecha").get();
    const onGetTasks = (cb) => db.collection(user.uid).onSnapshot(cb)
    const getTask = (id) => db.collection(user.uid).doc(id).get()
    const updateTask = (id, task) => db.collection(user.uid).doc(id).update(task)
    const getCont = () => db.collection("config").doc("contador_visitas").get()
    getCont().then((doc) => {
        let datos = doc.data()
        datos.cont = datos.cont + 1
        db.collection("config").doc("contador_visitas").update(datos)
        document.querySelector("#cont").innerText = `Contador de visitas: ${datos.cont}`
    })
    onGetTasks((querySnapshot) => {
        taskContainer.innerHTML = ""
        let listaTareas = []
        querySnapshot.forEach(doc => {
            const task = doc.data()
            task.id = doc.id
            listaTareas.push(task) 
        });
        listaTareas.sort(function(a, b) {
            return a.fecha - b.fecha;
        });
        listaTareas.forEach(task => {
            let timestamp = task.fecha
            let date = new Date(timestamp * 1000);
            let options2 = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            let desde = date.toLocaleDateString("es-ES", options2)
            let badge
            switch (task.prioridad) {
                case "Baja":
                    badge = "bg-success"
                    break;
                case "Media":
                    badge = "bg-warning"
                    break;
                case "Alta":
                    badge = "bg-danger"
                    break;
                case "Mortal":
                    badge = "bg-dark"
                    break;
                default:
                    badge = "d-none"
                    break;
            }
            // <div class="btnAyuda">
            //         <i class="fas fa-sort btnAyuda btnOrden" data-id="${task.id}" data-orden="${task.orden}" aria-hidden="true"></i>
            //     </div>
            taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary d-flex justify-content-center tarea" data-id="${task.id}" data-orden="${task.orden}">
                <h3  class="text-center">${task.titulo}</h3>
                <p  class="wrapper">${task.descripcion}</p>
                <p  class="text-center"> <span class="badge badge-pill ${badge}">Prioridad: ${task.prioridad}</span> </p>
                <p  class="text-center"> <span class="badge badge-pill bg-info">${desde}</span> </p>
                <div class="botonera mt-3">
                    <div  class="btn-delete">
                        <i data-id="${task.id}" style="--col:#C70039" class="fa-solid fa-trash "></i>
                    </div>
                    <div  class="btn-edit">
                        <i data-id="${task.id}" style="--col:#FFC300" class="fa-solid fa-pen-to-square "></i>
                    <div>
                </div>
                
            </div>`
        })
        const btnsDelete = document.querySelectorAll(".btn-delete")
        btnsDelete.forEach(btn => {
            btn.addEventListener("click", async(e) => {
                await deleteTask(e.target.dataset.id)
                status = false
                id = ""
                form.reset();
                cancelar.classList.add("d-none")
                prioridadOptions.forEach(i => i.removeAttribute("selected"))
                document.querySelector(`#opcion${task.prioridad}`).setAttribute("selected","true")
            })
        })
        const btnsEdit = document.querySelectorAll(".btn-edit")
        btnsEdit.forEach(btn => {
            btn.addEventListener("click", async(e) => {
                const doc = await getTask(e.target.dataset.id)
                const task = doc.data()
                status = true
                id = doc.id
                cancelar.classList.remove("d-none")
                form["task-title"].value = task.titulo
                form["task-description"].value = task.descripcion
                prioridadOptions.forEach(i => i.removeAttribute("selected"))
                document.querySelector(`#opcion${task.prioridad}`).setAttribute("selected","true")
                form["task-title"].focus()
            })
        })
        // const btnsOrden = document.querySelectorAll(".btnOrden")
        // console.log(btnsOrden)
        // btnsOrden.forEach(btn =>{
        //     btn.addEventListener("click", e=>e.preventDefault())
        //     btn.addEventListener("dragstart", e=> {
        //         e.preventDefault()
        //         e.dataTransfer.setData("id", e.target.dataset.id)
        //         e.dataTransfer.setData("orden", e.target.dataset.orden)
        //         e.target.style.color = "green"
        //         console.log("empezo "+ e.target.dataset.id + " "+ e.target.dataset.orden)
        //     })
        //     btn.addEventListener("dragend", e=> {
        //         e.preventDefault()
        //         e.target.style.color = "#000"
        //         console.log("end")
        //     })
        // })
        // const tareas = document.querySelectorAll(".tarea")
        // tareas.forEach(t=>{
        //     t.addEventListener("dragenter", e=>{
        //         e.target.classList.add("dragged")
        //         console.log("entro")
        //     })
        //     t.addEventListener("dragleave", e=>{
        //         e.target.classList.remove("dragged")
        //         console.log("salio")
        //     })
        //     t.addEventListener("dragover", e=>e.preventDefault())
        //     t.addEventListener("drop", async(e)=>{
        //         let tarea1ID = e.target.dataset.id
        //         let tarea1 = {"orden": e.dataTransfer.getData("orden")}
        //         let tarea2ID = e.dataTransfer.getData("id")
        //         let tarea2 = {"orden": e.target.dataset.id}
        //         await updateTask(tarea1ID, tarea1)
        //         await updateTask(tarea2ID, tarea2)
        //         await getTasks()
        //     })
        // })
    })
    const enviador = async(e) => {
        e.preventDefault()
        const title = form["task-title"];
        const description = form["task-description"];
        const Prioridad = form["Prioridad"];
        const Botonera = document.querySelector("#Botonera"); 
        const Spinner = document.querySelector("#Spinner");
        if(title.value.trim() != "" || description.value.trim() != ""){
            Botonera.classList.toggle("d-none")
            Spinner.classList.toggle("d-none")
            if (!status) await saveTask(title.value, description.value, Prioridad.value)
            else {
                await updateTask(id, {
                    "titulo": title.value,
                    "descripcion": description.value,
                    "prioridad": Prioridad.value
                })
                status = false
                id = ""
                cancelar.classList.add("d-none")
            }
            form.reset();
            prioridadOptions.forEach(i => i.removeAttribute("selected"))
            document.querySelector(`#opcionBaja`).setAttribute("selected","true")
            title.focus();
            await getTasks();
            Botonera.classList.toggle("d-none")
            Spinner.classList.toggle("d-none")
        }else alert("Estas mandando una tarea vacia salamin")
    }
    btnEnviar.addEventListener("click", enviador)
    form.addEventListener("submit", enviador)
    cancelar.addEventListener("click", e=>{
        status = false
        id = ""
        form.reset();
        prioridadOptions.forEach(i => i.removeAttribute("selected"))
        document.querySelector(`#opcionBaja`).setAttribute("selected","true")
        cancelar.classList.add("d-none")
    })
    btnConfigEnviar.addEventListener("click",()=>{
        const Botonera = document.querySelector("#BotoneraC"); 
        const Spinner = document.querySelector("#SpinnerC");
        let img = document.querySelector("#img").files[0];
        if(img == null || img == undefined || img.size > 5 * 1024 * 1024 || (img.type != 'image/gif' && img.type != 'image/png' && img.type != 'image/jpg' && img.type != 'image/jpeg')) error.innerHTML = "El tamaño o formato de la imagen es incorrecto"
        else{
            Botonera.classList.toggle("d-none")
            Spinner.classList.toggle("d-none")
            error.innerHTML = ""
            img.name = user.uid
            firebase.storage().ref(`Fondos/${user.uid}`).put(img).then((snapshot)=>{
                window.location.replace("/"); 
            }).catch(function(err) {
                error.innerHTML = err.code 
            })
            Botonera.classList.toggle("d-none")
            Spinner.classList.toggle("d-none")
        }
    })
})
//fecha
document.querySelector("#cerrar").addEventListener("click", ()=>firebase.auth().signOut().then(()=>location.replace("/login.html")))
let fecha = new Date();
let options = { year: 'numeric', month: 'long', day: 'numeric' };
const addZeros = n => {
    if (n.toString().length < 2) return "0".concat(n);
    return n
}
const saludo = (hora)=>{
    if(hora > 7 && hora <= 12) return "Buenos Dias!"
    else if(hora > 13 && hora < 19) return  "Buenas Tardes!"
    else if(hora >= 19 && hora < 24) return  "Buenas Noches!"
    else return "Vaya a Dormir!"
}
const actualizarhora = () => {
    const time = new Date();
    let hora = addZeros(time.getHours());
    let min = addZeros(time.getMinutes());
    let seg = addZeros(time.getSeconds());
    document.querySelector("#hora").innerText = `${hora}:${min}:${seg}`
    document.querySelector("#fecha").innerText = fecha.toLocaleDateString("es-ES", options)
    document.querySelector("#ap").innerHTML = saludo(hora)
}
actualizarhora()
setInterval(actualizarhora, 1000)
function modalShower(n) {
    $(n).modal('show')
}