

var host : string = process.env.DB_HOST;
var port : number = parseInt(process.env.DB_PORT);
var user : string = process.env.DB_USER;
var password : string = process.env.DB_PASSWORD;
var database : string = process.env.DB_NAME;

export default {
	
	mysql : {
		host,
		port,
		user,
		password,
		database
	}	
}