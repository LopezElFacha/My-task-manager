let isLogin = true
const login = document.querySelector('#login')
const error = document.querySelector('#errorCode')
const btnCambiador = document.querySelector('#btnC')
const formNombre = document.querySelector('#formNombre')
const formImg = document.querySelector('#formImg')
btnCambiador.addEventListener('click', () => {
  isLogin = !isLogin
  if (!isLogin) {
    formImg.classList.remove('d-none')
    formNombre.classList.remove('d-none')
    btnCambiador.innerHTML = 'Logearse'
  } else {
    formImg.classList.add('d-none')
    formNombre.classList.add('d-none')
    btnCambiador.innerHTML = 'Registrarse'
  }
})
login.addEventListener('submit', async (e) => {
  error.classList.add('d-none')
  e.preventDefault()
  let email = document.querySelector('#email').value
  let nombre = document.querySelector('#nombre').value
  let contra = document.querySelector('#password').value
  let img = document.querySelector('#img').files[0]
  let Spinner = document.querySelector('#Spinner')
  let btnS = document.querySelector('#btnS')
  btnCambiador.classList.toggle('d-none')
  btnS.classList.toggle('d-none')
  Spinner.classList.toggle('d-none')
  if (isLogin) {
    if (email.trim() != '' && contra.trim() != '') {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, contra)
        .then((userCredential) => {
          var user = userCredential.user
          window.location.replace('/index.html')
        })
        .catch((e) => {
          error.classList.remove('d-none')
          error.innerHTML = 'Contraseña o Mail incorrectos'
        })
    } else {
      error.classList.remove('d-none')
      error.innerHTML = 'Escribe un Mail y Contraseña'
    }
  } else {
    if (
      email.trim() == '' ||
      contra.trim() == '' ||
      nombre.trim() == '' ||
      img == null ||
      img == undefined ||
      img.size > 5 * 1024 * 1024 ||
      (img.type != 'image/gif' &&
        img.type != 'image/png' &&
        img.type != 'image/jpg' &&
        img.type != 'image/jpeg')
    ) {
      error.classList.remove('d-none')
      error.innerHTML = 'Complete todos los campos correctamente'
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, contra)
        .then((userCredential) => {
          var user = userCredential.user
          user
            .updateProfile({
              displayName: nombre,
            })
            .then(() => {
              error.classList.add('d-none')
              img.name = user.uid
              firebase
                .storage()
                .ref(`Fondos/${user.uid}`)
                .put(img)
                .then((snapshot) => {
                  window.location.replace('/index.html')
                })
                .catch(function (err) {
                  error.classList.remove('d-none')
                  error.innerHTML =
                    'Error subiendo tu imagen pero su cuenta ha sido creada exitosamente. Intenta subir una imagen de nuevo desde el menu de configuracion'
                  setTimeout(() => window.location.replace('/index.html'), 5000)
                })
            })
            .catch(function (err) {
              error.classList.remove('d-none')
              error.innerHTML =
                'Error en su nombre de usuario pero su cuenta ha sido creada exitosamente.'
              setTimeout(() => window.location.replace('/index.html'), 5000)
            })
        })
        .catch(function (err) {
          error.classList.remove('d-none')
          error.innerHTML = 'Error reando su cuenta. Intenta de nuevo'
        })
    }
  }
  btnCambiador.classList.toggle('d-none')
  btnS.classList.toggle('d-none')
  Spinner.classList.toggle('d-none')
})
