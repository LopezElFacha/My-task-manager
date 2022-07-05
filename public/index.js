const addZeros = (n) => {
  if (n.toString().length < 2) return '0'.concat(n)
  return n
}
firebase.auth().onAuthStateChanged((user) => {
  //config
  if (user == null) window.location.replace('/login.html')
  firebase
    .storage()
    .ref(`Fondos/`)
    .child(user.uid)
    .getDownloadURL()
    .then((url) => (document.body.style.backgroundImage = `url("${url}")`))
  document.querySelector('#saludo').innerHTML = `Hola ${user.displayName}!`
  //crud
  const form = document.querySelector('#task-form')
  const prioridadOptions = document.querySelectorAll('#Prioridad option')
  const tipoOptions = document.querySelectorAll('#Tipo option')
  const btnEnviar = document.querySelector('#btn-task-form')
  const btnConfigEnviar = document.querySelector('#btn-config-form')
  const cancelar = document.querySelector('#Cancelar')
  const error = document.querySelector('#error')
  let status = false
  let id = ''
  const db = firebase.firestore()
  document.querySelector('#cerrar').addEventListener('click', () =>
    firebase
      .auth()
      .signOut()
      .then(() => location.replace('/login.html'))
  )
  const saveTask = (title, description, prioridad, fecha, tipo) => {
    db.collection(user.uid).doc().set({
      titulo: title,
      descripcion: description,
      prioridad: prioridad,
      fechaEntrega: fecha,
      tipo: tipo,
      fecha: new Date(),
    })
  }
  const deleteTask = (id) => db.collection(user.uid).doc(id).delete()
  const getTasks = () => db.collection(user.uid).orderBy('fecha').get()
  const onGetTasks = (cb) => db.collection(user.uid).onSnapshot(cb)
  const getTask = (id) => db.collection(user.uid).doc(id).get()
  const updateTask = (id, task) => db.collection(user.uid).doc(id).update(task)
  onGetTasks((querySnapshot) => {
    document
      .querySelectorAll('.columna .tasks')
      .forEach((c) => (c.innerHTML = ''))
    let listaTareas = []
    querySnapshot.forEach((doc) => {
      const task = doc.data()
      task.id = doc.id
      listaTareas.push(task)
    })
    listaTareas.sort(function (a, b) {
      return a.fecha - b.fecha
    })
    listaTareas.forEach((task) => {
      let timestamp = task.fecha
      let timestamp2 = task.fechaEntrega
      let date = new Date(timestamp.seconds * 1000)
      let date2 = new Date(timestamp2.seconds * 1000)
      let options2 = {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }
      let desde = date.toLocaleDateString('es-ES', options2)
      let hasta = date2.toLocaleDateString('es-ES', options2)
      let badge
      let badge2
      switch (task.prioridad) {
        case 'Baja':
          badge = 'bg-success'
          break
        case 'Media':
          badge = 'bg-warning'
          break
        case 'Alta':
          badge = 'bg-danger'
          break
        case 'Mortal':
          badge = 'bg-dark'
          break
        default:
          badge = 'd-none'
          break
      }
      if (Date.now() - date2 < 0) badge2 = 'bg-success'
      else badge2 = 'bg-danger'
      //recordatorio
      document.querySelector(
        `#${task.tipo} .tasks`
      ).innerHTML += `<div class="card card-body mt-2 border-primary d-flex" data-id="${task.id}" data-orden="${task.orden}">
                <h3  class="text-center">${task.titulo}</h3>
                <p  class="wrapper">${task.descripcion}</p>
                <p  class="text-center"> <span class="badge badge-pill ${badge}">Prioridad: ${task.prioridad}</span> </p>
                <p  class="text-center"> <span class="badge badge-pill bg-info">Creado en ${desde}</span> </p>
                <p  class="text-center"> <span class="badge badge-pill ${badge2}">Para el ${hasta}</span> </p>
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
    const btnsDelete = document.querySelectorAll('.btn-delete')
    btnsDelete.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        if (confirm('¿Queres borrar esta tarea definitivamente?')) {
          await deleteTask(e.target.dataset.id)
          status = false
          id = ''
          form.reset()
        }
      })
    })
    const btnsEdit = document.querySelectorAll('.btn-edit')
    btnsEdit.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const doc = await getTask(e.target.dataset.id)
        const task = doc.data()
        status = true
        id = doc.id
        let date = new Date(task.fechaEntrega.seconds * 1000)
        form['task-title'].value = task.titulo
        form['task-description'].value = task.descripcion
        form['task-date'].value =
          date.getFullYear() +
          '-' +
          addZeros(date.getMonth() + 1) +
          '-' +
          addZeros(date.getDate()) +
          'T' +
          addZeros(date.getHours()) +
          ':' +
          addZeros(date.getMinutes())
        prioridadOptions.forEach((i) => i.removeAttribute('selected'))
        document
          .querySelector(`#opcion${task.prioridad}`)
          .setAttribute('selected', 'true')
        tipoOptions.forEach((i) => i.removeAttribute('selected'))
        document
          .querySelector(`#opcion${task.tipo}`)
          .setAttribute('selected', 'true')
        modalShower('#taskForm')
        form['task-title'].focus()
      })
    })
  })
  const enviador = async (e) => {
    e.preventDefault()
    const title = form['task-title']
    const description = form['task-description']
    const Prioridad = form['Prioridad']
    const Tipo = form['Tipo']
    const FechaEntrega = form['task-date']
    const Botonera = document.querySelector('#Botonera')
    const Spinner = document.querySelector('#Spinner')
    if (title.value.trim() != '' || description.value.trim() != '') {
      let nuevaFecha
      if (FechaEntrega.value.trim() == '') nuevaFecha = new Date()
      else nuevaFecha = new Date(FechaEntrega.value)
      Botonera.classList.toggle('d-none')
      Spinner.classList.toggle('d-none')
      if (!status)
        await saveTask(
          title.value,
          description.value,
          Prioridad.value,
          nuevaFecha,
          Tipo.value
        )
      else {
        await updateTask(id, {
          titulo: title.value,
          descripcion: description.value,
          prioridad: Prioridad.value,
          tipo: Tipo.value,
          fechaEntrega: nuevaFecha,
        })
        status = false
        id = ''
      }
      form.reset()
      prioridadOptions.forEach((i) => i.removeAttribute('selected'))
      document.querySelector(`#opcionBaja`).setAttribute('selected', 'true')
      tipoOptions.forEach((i) => i.removeAttribute('selected'))
      document
        .querySelector(`#opcionRecurrente`)
        .setAttribute('selected', 'true')
      title.focus()
      await getTasks()
      Botonera.classList.toggle('d-none')
      Spinner.classList.toggle('d-none')
      modalHider('#taskForm')
    } else alert('Estas mandando una tarea vacia salamin')
  }
  btnEnviar.addEventListener('click', enviador)
  form.addEventListener('submit', enviador)
  cancelar.addEventListener('click', (e) => {
    status = false
    id = ''
    form.reset()
    prioridadOptions.forEach((i) => i.removeAttribute('selected'))
    document.querySelector(`#opcionBaja`).setAttribute('selected', 'true')
    tipoOptions.forEach((i) => i.removeAttribute('selected'))
    document.querySelector(`#opcionRecurrente`).setAttribute('selected', 'true')
    modalHider('#taskForm')
  })
  btnConfigEnviar.addEventListener('click', () => {
    const Botonera = document.querySelector('#BotoneraC')
    const Spinner = document.querySelector('#SpinnerC')
    let img = document.querySelector('#img').files[0]
    if (
      img == null ||
      img == undefined ||
      img.size > 5 * 1024 * 1024 ||
      (img.type != 'image/gif' &&
        img.type != 'image/png' &&
        img.type != 'image/jpg' &&
        img.type != 'image/jpeg')
    )
      error.innerHTML = 'El tamaño o formato de la imagen es incorrecto'
    else {
      Botonera.classList.toggle('d-none')
      Spinner.classList.toggle('d-none')
      error.innerHTML = ''
      img.name = user.uid
      firebase
        .storage()
        .ref(`Fondos/${user.uid}`)
        .put(img)
        .then((snapshot) => {
          window.location.replace('/')
        })
        .catch(function (err) {
          error.innerHTML = err.code
        })
      Botonera.classList.toggle('d-none')
      Spinner.classList.toggle('d-none')
    }
  })
})

function modalShower(n) {
  $(n).modal('show')
}
function modalHider(n) {
  $(n).modal('hide')
}
