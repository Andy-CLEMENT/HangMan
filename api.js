//On implente les requires
const { verify } = require("crypto");
const url=require("url");
const path=require("path");
const fs=require("fs");
const jsonwebtoken= require("jsonwebtoken");

//Création des variables générales

let wordsList= []; //Liste contenant tout les mots à deviner ( issue du livre Les misérables )
let currentGame={}; // Dictionnaires des parties en cours
let userDict={}; // Dictionnaires des utilisateurs inscrit
let secretKey="acier"; //Clef secrète du token

function newGame(mot){
    this.word=mot; // Mot à deviner
    this.nbrError=0;
    this.goodLetter=[]; //Liste des bonnes lettres devinées
    this.badLetter=[]; //Liste des mauvaises lettres 
}

//Selectionne un mot aléatoirement dans la liste des mots
function getWord(){
    let index= Math.floor(Math.random()*wordsList.length);
    console.log(wordsList[index]);
    return wordsList[index];
}

function manageRequest(request, response) {
    response.statusCode = 200;

    let urlList= request.url.split('?')[0].split('/');//Découpe de l'url 
    let valApi= urlList[urlList.indexOf("api")+1]; // Valeur de l'élement se situant après api dans l'url
    
    // On a différente réaction suivant les valeurs de valApi

    //----------------------------BONUS------------------Incsription/Connexion
    //Pour la connexion
    if( valApi=="login"){ 
        request.POST;
        let body="";
        request.on('data', (chunk) => {body += chunk});
        request.on('end', () => { 
            const { username, password}= JSON.parse(body);

            //On vérifie si l'utilisateur existe et si le mot de passe envoyé est correcte.
            if((username in userDict) && password==userDict[username]){
                let token= jsonwebtoken.sign({username},secretKey, {expiresIn: "1d"});
                console.log("token "+token);
                response.end(token);
            }else{
                response.statusCode=400;
                response.end("Le nom d'utilisateur ou le mot de passe est incorrecte");
            }
        });
    }

    //Pour l'inscription
    if(valApi=="signin"){
        request.POST
        let body="";
        request.on('data', (chunk) => {body += chunk});
        request.on('end', () => { 
            const { username, password}= JSON.parse(body);
            console.log("Body user "+ username);
            //On vérifie si l'utilisateur n'existe pas déjà, s'il n'existe pas, on lui associe le mot de passe reçu.
            if(!(username in userDict)){
                console.log("Body signin: "+ body);
                console.log("Body mdp "+ password);
                userDict[username]=password;
                response.end("inscription bien reçu");
            }
            else{response.statusCode=400;
                response.end("Le nom d'utilisateur est déjà pris");
            }
            console.log("dico: "+ JSON.stringify(userDict));
        });

    }
    //----------------------------FIN BONUS ------------------Incsription/Connexion

    //Pour recevoir un nouveau mot via la fonction getWord()
    if( valApi=="getWord"){
        response.end(""+getWord());
    }

    //Pour générer une nouvelle partie
    if( valApi=="newGame"){
        try{    
                let tok= jsonwebtoken.verify(request.headers["token"],secretKey); //On vérifie si on bien reçu le token contenant l'identifiant
                let myGame=new newGame(getWord()); 
                currentGame[tok.username]=myGame; //On associe ajoute la partie créée dans le dictionnaire currentGame au nom d'utilisateur associé

                console.log("Token reçu :"+tok);
                console.log(currentGame);

                //On ajoute autant de "" dans goodLetter qu'il y a de caractère dans le mot à deviner, cela servira dans la vérification de l'état de découverte du mot
                for ( let i=0; i<myGame.word.length; i++){
                    myGame.goodLetter.push("_");}
                response.end(JSON.stringify({"wordLength":myGame.word.length}));
            } catch(error){
                response.statusCode=400;
                response.end("lancement de la partie impossible");
            }
     }

     //Pour tester si la lettre reçu est dans le mot à deviner ou non
    if(valApi=="testLetter"){
                let letter2Test = request.url.split('?')[1].split("=")[1]; //Stocke le caractère à évaluer
                let positionLetter=[]; // Tableau contenant les positions des occurences de la lettre dans le mot à deviner 
                let info={}; // Dictionnaire envoyant au client les informations concernant la lettre testée
                let gameOver=false; //Variable boolean jugeant de la fin de la partie ou non 
                try{
                    let tok= jsonwebtoken.verify(request.headers["token"],secretKey); //On vérifie si on bien reçu le token contenant l'identifiant
                    currentG= currentGame[tok.username];
                    let tabLetter=currentG.word.toUpperCase().split('');// 

                    console.log("TabLetter :"+tabLetter);
                    console.log("currentG :"+JSON.stringify(currentG));
                
                // On vérifie si la lettre est dans le mot recherché
                if( tabLetter.includes(letter2Test)){ 

                    //On rempli le tableau d'occurence de la lettre
                    for( let i=0; i<tabLetter.length; i++){
                        if( letter2Test===tabLetter[i]){
                            positionLetter.push(i);
                        }
                    }
                    // On remplace les "" du tableau goodLetter par les occurences de la lettre pour surveiller l'avancement du jeu
                    for( let i=0; i<positionLetter.length; i++){
                        currentG.goodLetter[positionLetter[i]]=letter2Test;
                    }

                    //Si le tableau goodLetter ne contient plus de "" cela signifie que toute les lettres ont été trouvées
                    if( !currentG.goodLetter.includes("_")) {
                        info= { "letter": letter2Test, "isCorrect": true, "position":positionLetter, "isGameOver": true};
                        gameOver=true;// La partie est terminée

                        console.log("1: " +currentG.goodLetter);

                    } else {
                        info= { "letter": letter2Test, "isCorrect": true, "position":positionLetter, "isGameOver": false};
                        console.log("2: " +currentG.goodLetter);
                        console.log("info 2: "+JSON.stringify(info));
                    }
                }else{
                    //Si la lettre n'est pas dans le mot recherché, on incrémente le compteur d'erreur
                    currentG.nbrError++;
                    //On ajoute la lettre incorrectes dans le tableau badLetter
                    if( !currentG.badLetter.includes(letter2Test)){
                        currentG.badLetter.push(letter2Test);
                    }
                    

                    //Si le nombre d'erreur est supérieur à 7, la partie est terminé
                    if( currentG.nbrError >=7) { info= { "letter": letter2Test, "isCorrect": false, "errors":currentG.nbrError, "isGameOver": true, "word": currentG.word};
                        gameOver=true;// La partie est terminée

                        console.log("3: " +currentG.goodLetter);
                        console.log("info 3: "+JSON.stringify(info));
                    
                    }else{
                        info= { "letter": letter2Test, "isCorrect": false, "errors":currentG.nbrError, "isGameOver": false};

                        console.log("4: " +currentG.goodLetter);
                        console.log("info 4: "+JSON.stringify(info));
                    }
                }
                //On vérifie si la partie est terminée
                if(gameOver){
                    console.log("GAME OVER ");
                    delete currentGame[tok.username]; // Supprimer la partie terminée
                }

                response.statusCode=200;
                response.end(JSON.stringify(info));
            }catch(error){
                console.log(error);
                response.statusCode==401;
                response.end("Utilisateur non identifié");
        }
    }

    // Pour reprende la partie en cours selon l'identifiant associé
    //-------------------------BONUS-------------gameState
    if(valApi=="gameState"){

        try{
            let tok= jsonwebtoken.verify(request.headers["token"],secretKey); //On vérifie si on bien reçu le token contenant l'identifiant
            currentG= currentGame[tok.username];

            let info={ "wordLength": currentG.word.length, "nbErrors": currentG.nbrError, "correctLetters":currentG.goodLetter, "incorrectLetters": currentG.badLetter}// On créer le dictinnaire a envoyé
            response.end(JSON.stringify(info));

        }catch(error){
            response.statusCode==401;
            response.end("Utilisateur non identifié");
        }
    }
     //-------------------------FIN BONUS-------------gameState
}

//Lecture des misérables pour nourrir notre répertoire de mot
fs.readFile('lesmiserables.txt',"utf-8",function(error,data){
        if(error){
            console.log(error);
        }else{
          let book =  data.split(/[(\r?\n),. ]/); //découpe des mots du livre 
           for(let i=0; i<book.length; i++){

                //Si la taille du mot est compris entre 6 et 8 caractères ET qu'il n'est pas déjà dans le repertoire entre dans la condition
                if( (book[i].length>=6 && book[i].length<=8) && !wordsList.includes(book[i]) ){
                        let verif= true;
                        for( let j=0; j<book[i].length; j++){
                            //On vérifie si le caractère contient une des seulement des minuscules
                            if( book[i].charCodeAt(j)<97 || book[i].charCodeAt(j)>122){
                                verif= false;
                            }
                        }
                        if(verif) wordsList.push(book[i]); //Si le mot est validé, on l'ajoute à la liste
                }
            }
        }
    });
exports.manage = manageRequest; 