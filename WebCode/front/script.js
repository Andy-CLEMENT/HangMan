const buttonNewgame=document.getElementById("JOUER");
const buttonContinue=document.getElementById("Continuer");
const restardB= document.getElementById("restartb");
const letterBox= document.querySelectorAll("#letterPlayed >p span");
const errorCompt= document.getElementById("errorCompt");
const w2g= document.getElementById("word2guess");
const identity=document.getElementById("identity");
const startButton=document.getElementById("startButton")
const disconnectButton=document.getElementById("disconnect");
const validateC=document.getElementById("validateC");
const validateI=document.getElementById("validateI");
const nameC= document.querySelector("#nameC");
const nameI= document.querySelector("#nameI");
const mdpC= document.querySelector("#mdpC");
const mdpI= document.querySelector("#mdpI");
const loading=document.getElementById("loading");
const error_message=document.getElementById('error-message');


let w2guess="";
let nbrError=0;
let w2gempty = "";
let wList="";
let wordLength;
let gameId;
let userInfo ={ username:"", password:""};
let myToken;


//-----------Mise en route des parties

// Mets à jours l'affichage au début de chaque parties 
function setUpGame(){
    errorCompt.innerText=nbrError;
    let tabId=["images","dispGame","letterPlayed","gameInfo"];
    for( let i=0; i<tabId.length; i++){
        document.getElementById(tabId[i]).classList.remove("notDisplayed");
    }
    buttonNewgame.classList.add("notDisplayed");
    restardB.classList.add("notDisplayed");
    buttonContinue.classList.add("notDisplayed");
    hideBody();
}

//Enlève la mise en place du jeu, utile pour la deconnexion
function unSetUpGame(){
    let tabId=["images","dispGame","letterPlayed","gameInfo"];
    for( let i=0; i<tabId.length; i++){
        document.getElementById(tabId[i]).classList.add("notDisplayed");
    }
    buttonNewgame.classList.remove("notDisplayed");
    restardB.classList.remove("notDisplayed");
    buttonContinue.classList.remove("notDisplayed");
    hideBody();
}

// lancement de la première partie
function firstGame(){
    setUpGame();
    getNewWord();
    resetGame();
    errorCompt.innerText=nbrError;
}

// Demande au serveur d'envoyer un mot à deviner
async function getNewWord(){
    const token= {"Content-Type": "application/json", "token": myToken};
    //On affiche un écran de chargement avant d'appeler le serveur.
    addLoad();
    try{
        removeMessageError();
        let mydata = await fetch('http://localhost:8000/api/newGame',{
            headers: token,
        });
        if (!mydata.ok){
            console.error("Mauvaise réponse du serveur");
            addMessageError("Mauvaise réponse du serveur.");
            endLoad();
            return;}
            
        w2gempty = "";
        let jsondata= await mydata.json();// On récupère le dictionnaire en json
        console.log(jsondata);
        wordLength= jsondata["wordLength"];
        // On créer autant de ""  qu'il y a de lettre dans le "mot"
        for (let i = 0; i < wordLength; i++){w2gempty += "_";}
        w2gempty = w2gempty.split("");
        w2g.innerText = w2gempty.join(" ");
        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
    }
    catch(error){
    console.error("Erreur lors de la connection à www.quoridorarena.ps8.academy:", error);
    // On enléve l'écran de chargement une fois la requête terminée
    endLoad();
    addMessageError("Erreur lors de la connection à www.quoridorarena.ps8.academy: "+ error);
    }
}


// Réinitilise les lettres et l'affichage CSS pour lancer une nouvelle partie
function resetGame(){
    w2guess="";
    nbrError=0;
    w2gempty = "";
    wList="";
    errorCompt.innerText=nbrError;

    for(let i = 0; i < letterBox.length; i++){
        letterBox[i].classList.remove("ok");
        letterBox[i].classList.remove("ko");
        }
    for(let j = 1; j < 8; j++) {
        let bodypart=document.getElementById(String("i"+j));
        bodypart.classList.add("hide");
        }
    restardB.classList.add("notDisplayed");
}

// Permet de reprendre une partie déjà commencée
async function sameGame(){
    const token= {"Content-Type": "application/json", "token": myToken};
     //On affiche un écran de chargement avant d'appeler le serveur.
     addLoad();
    // On test la réponse du serveur
    try{
        removeMessageError();
        let mydata= await fetch("http://localhost:8000/api/gameState", {
            method: "GET",
            headers: token, 
        });
        if( !mydata.ok){
            console.error("Mauvaise réponse du serveur");
            endLoad();
            addMessageError("Mauvaise réponse du serveur");
            return;
        }
        let jsonData= await mydata.json(); // jsData est le tableau reçu par le serveur
        console.log(jsonData);
        // On place les caractères juste dans le mot à deviner
        w2gempty = "";
        for (let i = 0; i < jsonData["wordLength"]; i++){w2gempty += jsonData["correctLetters"][i];}
        w2gempty = w2gempty.split("");
        w2g.innerText = w2gempty.join(" ");

        // On actualise le nombre d'erreur.
        nbrError= jsonData["nbErrors"];
        setUpGame();

        // On actualise l'affichage du pendu
        for( let j=1; j<nbrError+1; j++){
            document.getElementById(String("i"+j)).classList.remove("notDisplayed");
        }

        // On adapte l'affichage des lettres incorrectes
        for(let i=0; i< jsonData["incorrectLetters"].length; i++){
            for(let j = 0; j < letterBox.length; j++){
                if(jsonData["incorrectLetters"][i]==letterBox[j].innerHTML)
                letterBox[j].classList.add("ko");
                }
        }

        // On adapte l'affichage des lettres correctes
        for(let i=0; i< jsonData["correctLetters"].length; i++){
            for(let j = 0; j < letterBox.length; j++){
                if(jsonData["correctLetters"][i]==letterBox[j].innerHTML)
                letterBox[j].classList.add("ok");
                }
        }

        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
    } 
    catch(error) {
        console.error("Erreur lors de la connection à localhost:8000", error);
        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
        addMessageError("Erreur lors de la connection à localhost:8000 "+error);
    }
}

//---------------Interraction jeu

// On demande au serveur si la lettre mis en argument est correct ou non
async function getLetter(letter){
    const token= {"Content-Type": "application/json", "token": myToken};
    let lettreATester=letter.innerText;
    //On affiche un écran de chargement avant d'appeler le serveur.
    addLoad();
    try{
        removeMessageError();
        let mydata= await fetch(`http://localhost:8000/api/testLetter?letter=`+lettreATester, {
            headers: token,
        });
        if( !mydata.ok){
            console.error("Données non réceptionné");
            endLoad()
            addMessageError("Données non réceptionné");
            return;}
        let jsonLetter= await mydata.json();
        console.log(jsonLetter);
        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
        return jsonLetter;
    } catch(error){
        console.error("Erreur lors de la connection à localhost:8000:", error);
        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
        addMessageError("Erreur lors de la connection à localhost:8000: "+ error);
        }

}
// Elle teste si la lettre selectionnée est une lettre correcte ou non 
async function testLetter(letter){
    let jsonLetter= await getLetter(letter); //jsonLetter et le json associé à la lettre
    // On verifie si la lettre est correct
    if(jsonLetter["isCorrect"]){
        console.log(letter);
        letter.classList.add("ok");
        for(let i=0; i<jsonLetter["position"].length; i++){
            w2gempty.splice(jsonLetter["position"][i],1,jsonLetter["letter"]);
            w2g.innerText = w2gempty.join(" ");
        }
    }
    else { // On incrémente le compteur d'erreur et affiche les parties du pendu correspondants
        nbrError=jsonLetter["errors"];
        errorCompt.innerText=nbrError;
        let bodypart=document.getElementById(String("i"+nbrError));
        bodypart.classList.remove("notDisplayed");
        letter.classList.add("ko");
        console.log(letter);
    }
    // On vérifie si la partie est terminée
    if(jsonLetter["isGameOver"]){
        if(jsonLetter["errors"]<=7){
            w2g.innerText=`Perdu! le mot était: "${jsonLetter["word"]}"`;
        }
        else{
        let result= w2g.innerText;
        w2g.innerText=`Tu as gagné! Le mot était: `+ result;}
        restardB.classList.remove("notDisplayed");
    }
}

//---------------------Inscription/ Connexion

// Permet d'acquérir les informations de l'utilisateur pour la connexion
async function getInfoC(){
    // On ajoute les valeurs acquéries dans le dictionnaire userInfo
    userInfo.username=nameC.value;
    userInfo.password=mdpC.value;
    console.log(userInfo);
    //On affiche un écran de chargement avant d'appeler le serveur.
    addLoad();
    try{
        removeMessageError();
        const mydata= await fetch('http://localhost:8000/api/login',{
        method:"POST",
        body: JSON.stringify(userInfo),});
        if( !mydata.ok){
            console.error("Mauvaise réponse du serveur");
            loading.classList.add("notDisplayed");
            loading.classList.remove("loadScreen");
            addMessageError("Identifiant ou mot de passe incorrecte");
            return;}
        myToken= await mydata.text(); // On enregistre le token
        localStorage.setItem("token",myToken);
        console.log("Success:", myToken);
        hideId(); // On cache la fenêtre de connexion et d'inscription
        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
        disconnectButton.classList.remove("notDisplayed");// On affiche le boutton de deconnexion.
    }
    
    catch (error) {
        console.error("Erreur lors de la connection à localhost:8000:", error);
        // On enléve l'écran de chargement une fois la requête terminée
        endLoad();
        addMessageError("Erreur lors de la connection à localhost:8000: "+ error);
      }
}

// Permet d'acquérir les infirmations de l'utilisateur pour l'inscription
async function getInfoI(){
    // On ajoute les valeurs acquéries dans le dictionnaire userInfo
    userInfo.username=nameI.value;
    userInfo.password=mdpI.value;
    // On vérifie la validité du mot de passe avant d'effectuer les intéraction 
    if(verifPassword(mdpI.value)){
        addLoad();
        console.log(userInfo);
        try{
            removeMessageError();
            const mydata= await fetch('http://localhost:8000/api/signin',{
            method:"POST",
            body: JSON.stringify(userInfo),});
            if( !mydata.ok){
                addMessageError("Identifiant déjà existant");
                endLoad();
                return;}
            console.log("Success:", await mydata.text());
            endLoad();
            window.alert("Inscription prise en compte, veuillez vous connecter ");
            document.getElementById("inscription").classList.add("notDisplayed");

        }
        catch (error) {
            console.error("Erreur lors de la connection à localhost:8000:", error);
             // On enléve l'écran de chargement une fois la requête terminée
            endLoad();
            addMessageError("Erreur lors de la connection à localhost:8000: "+ error);
        }
    }
}

// Vérifie la validité du mot de passe
function verifPassword(mdp){
    // On vérifie si la longueur du mot de passe est bonne
    if( mdp.length<8){
        addMessageError("Le mot de passe doit comporter au moins 8 caractères.")
        return false;
    }

    // On vérifie s'il y a au moins une lettre et un chiffre
    const letterTab = /[a-zA-Z]/;
    const nbrTab = /[0-9]/;
    if (!letterTab.test(mdp) || !nbrTab.test(mdp)) {
        addMessageError("Le mot de passe doit contenir au moins une lettre et un chiffre.")
        return false;
    }

    // Si toutes les contraintes sont respectées
    removeMessageError()
    return true;
}

//Déconnecte l'utilisateur
function deconnexion(){
    console.log("push")
    console.log(localStorage);
    localStorage.removeItem("token");
    unSetUpGame();
    showId();
    disconnectButton.classList.add("notDisplayed");
}

//---------Element d'affichage

// Cache le cadre de connexion et inscription
function hideId(){
    identity.classList.add("notDisplayed");
    startButton.classList.remove("notDisplayed");
    startButton.classList.add("startButton");
    removeMessageError();
}

// Affiche les cadres de connexion et inscription et les réinitialise
function showId(){
    identity.classList.remove("notDisplayed");
    startButton.classList.add("notDisplayed")
    startButton.classList.remove("startButton");
    mdpC.value="";
    nameC.value="";
    mdpI.value="";
    nameI.value="";
    removeMessageError();
}

//Cache le corp du pendu
function hideBody(){
    for( let i=1; i<8; i++){
    let bodypart=document.getElementById(String("i"+i));
    bodypart.classList.add("notDisplayed");
    }
}

//Affiche l'écran de chargement
function addLoad(){
    loading.classList.remove("notDisplayed");
    loading.classList.add("loadScreen");
}

//Enléve l'écran de chargement
function endLoad(){
    loading.classList.add("notDisplayed");
    loading.classList.remove("loadScreen");
}

//Efface tout les messages d'erreur précedent 
function removeMessageError(){
    error_message.textContent = ''; 
    error_message.classList.remove("error-message");
    error_message.classList.add("notDisplayed");
}

//Ajoute un message d'erreur dans l'interface.
function addMessageError(message){
    error_message.classList.remove("notDisplayed");
    error_message.classList.add("error-message");
    error_message.textContent=message;
}

//-----------Ajout des listeners sur les bouttons

// On ajoute un listener sur toute les lettres pour l'intéraction
for(let i = 0; i < letterBox.length; i++){
    letterBox[i].addEventListener("click", (event) => {
        if(nbrError<7)testLetter(event.currentTarget);  
            })
    }

buttonNewgame.addEventListener("click",firstGame);
buttonContinue.addEventListener("click",sameGame);
restardB.addEventListener("click",() => {
    resetGame();
    getNewWord();
    hideBody();
});
disconnectButton.addEventListener("click",deconnexion);

validateC.addEventListener("click",getInfoC);
validateI.addEventListener("click",getInfoI);
console.log(localStorage);

if( localStorage.getItem("token")!=undefined){
    console.log(localStorage.getItem("token"));
    myToken=  localStorage.getItem("token");
    hideId();
    disconnectButton.classList.remove("notDisplayed");
}