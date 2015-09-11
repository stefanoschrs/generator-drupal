var inquirer 	= require("inquirer");
var colors 		= require('colors');
var util 		= require('util');

var execute 	= function(command, args, done){
	var exec = require('child_process').exec;
	exec(command, args, function(error, stdout, stderr) {
		console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }

		done();
	});
};

var downloadDrupal 	= function(project, done){
	execute(util.format(
		'drush dl drupal \
		--drupal-project-rename=%s', 
		project.name.toUpperCase()
	), {}, done);
};
var siteInstall 	= function(project, done){
	var config = require('../config/config.js');
	execute(util.format(
		'echo y | drush si -y\
		--db-url="mysql://%s:%s@localhost/%s_db"\
		--site-name="%s"\
		--site-mail=%s\
		--account-name=admin_%s\
		--account-pass=123\
		--account-mail=%s', 
		config.username, 
		config.password, 
		project.name.toLowerCase(), 
		project.siteName, 
		project.email, 
		project.name.toLowerCase(), 
		project.email
	), {
		cwd: util.format('%s/%s', process.cwd(), project.name.toUpperCase())
	}, done);
};
var enableModules 	= function(project, done){
	execute('\
		drush en -y \
		admin_menu admin_menu_toolbar \
		views views_ui \
		devel devel_generate &&\
		drush dis -y toolbar\
	', {
		cwd: util.format('%s/%s', process.cwd(), project.name.toUpperCase())
	}, done);
};
var enableTheme 	= function(project, done){
	execute(util.format(
		'drush en -y %s && \
		drush vset theme_default %s', 
		project.theme, 
		project.theme
	), {
		cwd: util.format('%s/%s', process.cwd(), project.name.toUpperCase())
	}, done);	
};

module.exports = function(){

	console.log(colors.green('Creating a New Project..'));

	var project = {};
	var questions; 

	questions= [
		{
		    type: "input",
		    name: "name",
		    message: "Enter Project Name"
		}
	];
	inquirer.prompt(questions, function(answers) {

		project.name = answers.name;

		console.log(colors.green('Downloading Drupal..'));
		downloadDrupal(project, function(){

			questions = [
				{
				    type: "input",
				    name: "siteName",
				    message: "Enter Site Name",
				    default: function () { 
				    	return project.name; 
				    }
				},
				{
				    type: "input",
				    name: "email",
				    message: "Enter Site e-mail"
				}
			];
			inquirer.prompt(questions, function(answers) {

				project.siteName 	= answers.siteName;
				project.email 		= answers.email;

				console.log(colors.green('Installing the New Site (This action may take a while)..'));
				siteInstall(project, function(){

					console.log(colors.green('Downloading and Installing a few usefull modules..'));
					enableModules(project, function(){

						questions = [
							{
								type: "confirm",
								name: "theme",
								message: "Any particular theme you want to install"
							},
							{
							    type: "input",
							    name: "themeName",
							    message: "Enter theme name",
							    default: function () { 
							    	return 'zen'; 
							    },
							    when: function (answers){
									return answers.theme;
							    }
							}
						];
						inquirer.prompt(questions, function(answers) {

							if(answers.theme){
								project.theme = answers.themeName;

								console.log(colors.green('Downloading and Installing Theme..'));
								enableTheme(project, function(){

									console.log(colors.red('Done!'));
								});
							}
							else{
								console.log(colors.red('Done!'));
							}
						});
					});
				});
			});	
		});
	});
};