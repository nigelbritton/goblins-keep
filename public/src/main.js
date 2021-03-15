let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    const loginEl = document.querySelector('[data-cmd="login"]');
    if (loginEl) {
        loginEl.addEventListener('click', (e) => {
            e.preventDefault();

            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().useDeviceLanguage();
            firebase.auth()
                .signInWithPopup(provider)
                .then((result) => {
                    /** @type {firebase.auth.OAuthCredential} */
                    var credential = result.credential;
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    var token = credential.accessToken;
                    // The signed-in user info.
                    var user = result.user;
                    currentUser = user;
                    // ...
                }).catch((error) => {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
                });
        }, false);
    }

    firebase.auth().onAuthStateChanged(user => {
        const loginEl = document.querySelector('a.cta[data-cmd="login"]');
        if (user) {
            console.log(user._lat);
        }
    });
});
