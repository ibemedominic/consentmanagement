import { IModuleUpdate, mapSeries, mapSeriesParameter } from "./moduleupdate";
import { runDirectQueryPromise } from './repository/connection';
import config from './config';
import { MysqlError } from 'mysql';

// Migration scripts may be imported here
import Update_0001 from "./migrations/update_0001";

async function getVersion() : Promise<number>
{
	try
	{
		var sql = "select product, version from db_version where product = 'didomi' ";
		var results = await runDirectQueryPromise(sql);
		if(results.length > 0)
		{
			return results[0].version;
		}
		return -1;
	} catch(e)
	{
		console.log(" Error Occurred, Perhap New Installation");
		console.log(e);
		return -1;
	}
}

/**
 *  The Migration Script is responsible for keeping the Database schema consistent and upto date.
 * It tracks version numbers as well as determines what Database Update Scripts need to be executed
 */
export class Migration
{

	private updates : IModuleUpdate[] = [];
	private dbVersion : number;

	constructor()
	{
		this.addUpdate(new Update_0001());

		this.dbVersion = -1;
	}

	public static async dropDatabase() : Promise<any>
	{
		var database = config.mysql.database;
		var sql : string = null;
		try
		{
			//var sql : string = ` drop database ${database} `;
			//await runDirectQueryPromise(sql);

			sql = ` drop table userconsents_aud `;
			await runDirectQueryPromise(sql);

		} catch(e)
		{
			//ignore
			console.log("Error removing table userconsents_aud ");
			console.log(e);
		}

		try
		{
			sql = ` drop table userconsents `;
			await runDirectQueryPromise(sql);
		} catch(e)
		{
			//ignore
			console.log("Error removing table userconsents ");
			console.log(e);
		}
			
		try
		{
			sql = ` drop table users `;
			await runDirectQueryPromise(sql);
		} catch(e)
		{
			//ignore
			console.log("Error removing table users ");
			console.log(e);
		}

		try
		{
			sql = ` drop table db_version `;
			await runDirectQueryPromise(sql);
		} catch(e)
		{
			//ignore
			console.log("Error removing table db_version ");
			console.log(e);
		}
	}

	//public static async createDatabase() : Promise<any>
	//{
		//var database = config.mysql.database;
		//var sql : string = ` create database ${database} charset utfmb4 `;
		//await runDirectQueryPromise(sql);
	//}

	private async initialize() : Promise<any>
	{
		// here we check the database script version from the db and use that to determine where to run updates from
		this.dbVersion = await getVersion();
	}

	
	private addUpdate(update : IModuleUpdate)
	{
		this.updates.push(update);
	}

	private async installSchema() : Promise<any>
	{
		var schemaCalls : { () : Promise<any>; }[] = [];
		this.updates.forEach((update)=>
		{
			if(update.version > this.dbVersion)
			{
				schemaCalls.push(update.installSchema.bind(update));
			}
		})
		return await mapSeries(schemaCalls, true);
	}

	private async install() : Promise<any>
	{
		var installCalls : { () : Promise<any>; }[] = [];
		this.updates.forEach((update)=>
		{
			if(update.version > this.dbVersion)
			{
				installCalls.push(update.install.bind(update));
			}
		})
		return await mapSeries(installCalls);
	}

	private async deploy() : Promise<any>
	{
		var installCalls : { () : Promise<any>; }[] = [];
		this.updates.forEach((update)=>
		{
			if(update.version > this.dbVersion)
			{
				installCalls.push(update.deploy.bind(update));
			}
		})
		return await mapSeries(installCalls);
	}

	async run() : Promise<any>
	{
		await this.initialize();

		await this.installSchema();
		await this.install();
		return await this.deploy();
	}
	
}

