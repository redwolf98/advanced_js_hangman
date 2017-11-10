
var inquirer = require("inquirer");
var fs = require("fs");
var lettersAlreadyGuessed = [];
var wins = 0;
var losses = 0;
var guesses = 10;
var listOfWords = [];
var DEBUG = false;
var currentWord;

var messageToChooseLetter = {
    type:"input",
    message:"Choose a Letter:",
    name:"userInput"
};

var messageToPlayAgain = {
    type: "confirm",
    message:"Play Again? (y/n)",
    name: "userInput"
};

function log(value){
    if(DEBUG) console.log(value);
}

var Letter = function(letter){
    this.actualLetter = letter;
    this.isALetter = isALetter(letter);
    this.hasBeenGuessed = false;
}

Letter.prototype.view = function(){
    if(this.isALetter){
        if(this.hasBeenGuessed){
            return this.actualLetter;
        }else{
            return '_';
        }
    }else{
        return this.actualLetter;
    }
} 

var Word = function(word){
    this.answer = toTitleCase(word);
    this.hiddenWord = [];
};

Word.prototype.stillHasMissingLetters = function(){
   return  this.hiddenWord.some(item => item.isALetter && !item.hasBeenGuessed);
}

Word.prototype.printHiddenWord = function(){
    var printVersion = "";
    for(var z=0;z<this.hiddenWord.length;z++){
        printVersion += this.hiddenWord[z].view();
        if(z != this.hiddenWord.length - 1) printVersion += " ";
    }
    return printVersion;
}

Word.prototype.updateHiddenWord = function(inputLetter){
    for(var c = 0; c<this.hiddenWord.length;c++){
        log("Letter: " + this.hiddenWord[c].actualLetter + ", isALetter: " + this.hiddenWord[c].isALetter);
        if(this.hiddenWord[c].isALetter && this.hiddenWord[c].actualLetter.toLowerCase() == inputLetter){
            log("Letter Updated.");
            this.hiddenWord[c].hasBeenGuessed = true;
        }
    }
}


function isALetter(input){
    return input.length === 1 && input.match(/[a-z]/i);
}


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}



/////
//Begin game process
/////////

StartGame();






function buildWords(){
    
    fs.readFile('words.txt', 'UTF8', function(err, data){
        if(err){
            return console.log(err);
        }else{
            
            var listOfRawWords = (data.split(","));     
            
            for(var x=0;x<listOfRawWords.length;x++){
                
                var word = new Word(listOfRawWords[x]);
                
                listOfWords.push(word);
                
            }

            for(var y = 0;y<listOfWords.length;y++){
                for(var z=0; z < listOfWords[y].answer.length; z++){
                    listOfWords[y].hiddenWord.push(new Letter( listOfWords[y].answer.charAt(z)));
                }
                // console.log("Word: " + listOfWords[y].answer + ", Hidden: " + listOfWords[y].printHiddenWord());
            }
    
            RestartGame();

        }
    });

}


function StartGame(){

    console.log("Welcome to Hangman! Ready to hang?");

    buildWords();
}

function RestartGame(){
    guesses = 10;
    lettersAlreadyGuessed = [];
    // log(chooseRandomWord());
    currentWord = chooseRandomWord();
    // log(currentWord.printHiddenWord());
    
    promptUserForLetter();
}


function chooseRandomWord(){
   
    var random = Math.floor(Math.random() * (listOfWords.length - 1));
    // log(random);
    // log(listOfWords[random]);
    return listOfWords[random];
}

function promptUserForLetter(){
    
    console.log();
    console.log("Guesses Left: " + guesses);
    console.log("Current Word: " +  currentWord.printHiddenWord());
    log(currentWord.answer);
    console.log();

    inquirer.prompt(messageToChooseLetter).then(function(response)
    {
        if(response.userInput.length != 1){
            console.log();
            console.log("Enter a single character please.");
            promptUserForLetter();
        }
        else{
            
            var userInput = response.userInput.toLowerCase();
            if(!isALetter(userInput)){
                console.log();
                console.log(response.userInput + " is not a letter.");
                promptUserForLetter();
            }else {
                if(lettersAlreadyGuessed.indexOf(userInput) > -1){
                    console.log();
                    console.log("You have already guessed '" + response.userInput + "'.");
                    promptUserForLetter();
                }else{
                    lettersAlreadyGuessed.push(userInput);
                    if(currentWord.hiddenWord.some(x => x.actualLetter.toLowerCase() == userInput)){
                        console.log("Correct!");
                        currentWord.updateHiddenWord(userInput);                        

                        if(currentWord.stillHasMissingLetters()){
                            promptUserForLetter();
                        }else{
                            wins++;
                            console.log("Congrats! You've found all letters.")
                            console.log("The word was " + currentWord.printHiddenWord());
                            console.log("Current Score - Wins: " + wins + ", Losses: " + losses);
                            promptUserToPlayAgain();
                        }

                    }else{
                        console.log("Sorry! '" + response.userInput + "' is NOT in the word!");                        
                        guesses--;
                        if(guesses > 0){
                            promptUserForLetter();
                        }else{
                            losses++;
                            console.log();
                            console.log("Oops - you're out of guesses...");
                            currentWord.hiddenWord.map(z => z.hasBeenGuessed = true);
                            console.log("The word was: " + currentWord.printHiddenWord());
                            console.log("Current Score - Wins: " + wins + ", Losses: " + losses);
                            console.log();
                            promptUserToPlayAgain();
                        }
                    }
                }
            }
        }
       
    });

}



function promptUserToPlayAgain(){
    var prompt = {
        type:"confirm",
        message:"Play Again?",
        name: "output"
    };

    inquirer.prompt([prompt]).then(function(userReponse){
        if(userReponse.output){
            RestartGame();
        }else{
            console.log("Thanks for playing!");
        }
    });
}