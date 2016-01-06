//Gustavo Ocasio
//tumblr_mailer.js

var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js");


//Load contact list
var csvFile = fs.readFileSync("friend_list.csv", "utf8");

function csvParse(file){
	var fileContent = file.split("\n");
	var headerInfo = fileContent.shift().split(",");
	var rowContent;
	var contentArray = [];

	for (var i = 0; i < fileContent.length; i++) {
		var myObj = {};
		rowContent = fileContent[i].split(",");
		for (var j = 0; j < headerInfo.length; j++) {
			myObj[headerInfo[j]] = rowContent[j];
		}
		contentArray.push(myObj);
	}

	return contentArray;
}

var csv_data = csvParse(csvFile);
//console.log(csv_data);

/*
//Templating engine for individual values
//Function iterates over CSV data containing contact info and creates a personalized email for each contact
function personalizeEmail(data){
	console.log("\nSee personalized emails for each contact below:\n")
	//Iterate over the return value from the csvParse function.
	for (var i = 0; i < data.length; i++) {
		//Load email template text
		var emailTemplate = fs.readFileSync("email_template.html", "utf8");
		
		//Replace FIRST_NAME and NUM_MONTHS_SINCE_CONTACT fields in email_template.html file with actual values for each contact. 
		for (var key in data[i]) {
			if(key === "firstName"){
				emailTemplate = emailTemplate.replace("FIRST_NAME", data[i][key]);
			} else if(key === "numMonthsSinceContact"){
				emailTemplate = emailTemplate.replace("NUM_MONTHS_SINCE_CONTACT", data[i][key]);
			}
		}
		console.log(emailTemplate);
	}
}

personalizeEmail(csv_data);
*/

function customTemplate(data, postsArray){
	for (var i = 0; i < data.length; i++) {
		//Create object with only firstName and numMonthsSinceContact properties
		var personalizedObject = Object.assign({},data[i]);
		delete personalizedObject['lastName'];
		delete personalizedObject['emailAddress'];

		//Add latestPosts property to object. It should be array of objects with blog info I want to send to my contacts
		personalizedObject['latestPosts'] = postsArray;

		var emailTemplate = fs.readFileSync("email_template.ejs", "utf8");
		var customizedTemplate = ejs.render(emailTemplate, personalizedObject);
		console.log(customizedTemplate);
	}
}

// Tumblr account access
// Authenticate via OAuth
// API keys not shown here for safety
var client = tumblr.createClient({
  consumer_key: 'XXXXXXXXXXXXX',
  consumer_secret: 'XXXXXXXXXXXXX',
  token: 'XXXXXXXXXXXXX',
  token_secret: 'XXXXXXXXXXXXX'
});

// Make tumblr request
client.posts('coolcaffeinatedengineer.tumblr.com', function(err, blog){
  //console.log(blog);
  var postDate;
  var postDateMs;
  var currentDate;
  var dateDiff;
  var latestPosts = [];

  for (var i = 0; i < blog.posts.length; i++) {
  	postDate = new Date(blog.posts[i].date);
  	postDateinDays = convertMsToDays(postDate.getTime());
  	currentDateinDays = convertMsToDays(Date.now());
  	dateDiff = currentDateinDays - postDateinDays;

 	//Store posts that are less than 7 days old
  	if(dateDiff <= 7){
  		latestPosts.push(blog.posts[i]);
  	}

  }
  
  customTemplate(csv_data, latestPosts);
});



function convertMsToDays(milliseconds){
	return milliseconds/(1000*3600*24);
}




