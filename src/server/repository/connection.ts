import * as mysql from 'mysql';
import config from "../config";

/**
 * Here We define the Db Connections that are used across the API
 */

const Connection = mysql.createConnection(config.mysql);
var connectionPromise : Promise<mysql.Connection> = null;
getConnection();

/*
Connection.connect((err : any)=>
{
	if(err)
	{
		console.log(err);
	}
})
*/

export function getConnection() : Promise<mysql.Connection>
{
	if(Connection.state != "disconnected")
	{
		return Promise.resolve(Connection);
	}

	if(connectionPromise != null)
	{
		return connectionPromise;
	}

	connectionPromise = new Promise<mysql.Connection>((resolve, reject)=>
	{
		if(Connection.state == "disconnected") 
		{
			console.log("Connection State = " + Connection.state);
			Connection.connect((err : any)=>
			{
				if(err)
				{
					console.log(err);
					reject(err);
				} else {
					resolve(Connection);
				}
				connectionPromise = null;
			})
		} else {
			resolve(Connection);
			connectionPromise = null;
		}
	});
	return connectionPromise;
}

export function disconnect() : Promise<any>
{
	return new Promise<any>((resolve, reject)=>
	{
		if(Connection.state != "disconnected")
		{
			Connection.end((err : any)=>
			{
				if(err)
				{
					console.log(err);
					reject(err);
				} else {
					resolve(true);
				}
			})
		} else {
			resolve(true);
		}
	});
}

export function runDirectQueryPromise(query : string) : Promise<any>
{
	return new Promise<any>((resolve, reject) =>
	{
		getConnection().then((connection)=>
		{	
			connection.query(query, (err : mysql.MysqlError, results)=>
			{
				if(err)
				{
					return reject(err);
				}
				resolve(results);
			});
		})
		.catch((error)=>
		{
			reject(error);
		});
	})	
}

export function runQueryPromise(query : string, parameters : any) : Promise<any>
{
	return new Promise<any>((resolve, reject) =>
	{
		getConnection().then((connection)=>
		{	
			connection.query(query, [parameters], (err : mysql.MysqlError, results)=>
			{
				if(err)
				{
					return reject(err);
				}
				resolve(results);
			});
		})
		.catch((error)=>
		{
			reject(error);
		});
		
	})	
}

export class Transaction
{
	constructor(private connection : mysql.Connection)
	{

	}

	async beginTransaction() : Promise<any>
	{
		return new Promise<any>((resolve, reject)=>
		{
			this.connection.beginTransaction(null, (err)=>
			{
				if(err)
				{
					reject(err);
				} else {
					resolve(true);
				}
			})
		})
	}

	async commit() : Promise<any>
	{
		return new Promise<any>((resolve, reject)=>
		{
			this.connection.commit(null, (err)=>
			{
				if(err)
				{
					reject(err);
				} else {
					resolve(true);
				}
			})
		})
	}

	async rollback() : Promise<any>
	{
		return new Promise<any>((resolve, reject)=>
		{
			this.connection.rollback(null, (err)=>
			{
				if(err)
				{
					reject(err);
				} else {
					resolve(true);
				}
			})
		})
	}

	

}