#!/usr/bin/env node
var inquirer  = require("inquirer");

var ask = function(){
  var questions = [
    {
      type: "list",
      name: "answer",
      message: "What would you like to do?",
      choices: [
        "1. Create a new project",
        "2. Push to development"
      ]
    }
  ];
  inquirer.prompt(questions, function(answers) {
    if(answers.answer.indexOf('1.') === 0){
      return require('../lib/createNewProject.js')();   
    }

    if(answers.answer.indexOf('2.') === 0){
      return require('../lib/pushToDevelopment.js')();    
    }
  });
};

ask();