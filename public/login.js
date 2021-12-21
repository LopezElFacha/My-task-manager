const login = document.querySelector("#login")
login.addEventListener("submit", async e =>{
    e.preventDefault()
    let email = document.querySelector("#email").value;
    let contra = document.querySelector("#password").value;
    firebase.auth().signInWithEmailAndPassword(email, contra)
        .then((userCredential) => {
            var user = userCredential.user;
            window.location.replace("/index.html");
        })
        .catch((e) => {
            console.log(e)
            alert(e.code)
        });
})
const temazo = "hybrid rainbow" 