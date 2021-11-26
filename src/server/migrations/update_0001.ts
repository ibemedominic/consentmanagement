import { runDirectQueryPromise } from '../repository/connection';
import { MysqlError } from 'mysql';
import { IModuleUpdate, mapSeries, mapSeriesParameter } from '../moduleupdate';

/**
 *  The MOdule Update Script is used to keep track of DB Schema and Data changes so they can be versioned and applied.
 * The Migration Script manages this process
 */
export default class Update_0001 implements IModuleUpdate
{

	constructor()
	{
	
	}

	get version(): number 
	{
		return 1;
	}

	installSchema(): Promise<any> 
	{
		var schemaQuerries : string[] = [];
		schemaQuerries.push(`create table db_version ( product varchar(40) not null, version bigint not null, primary key (product) )`);

		schemaQuerries.push(`create table users ( id varchar(40) not null, email varchar(200) not null, primary key (id), 
			constraint email_uk unique (email) )`);

		schemaQuerries.push(`create table userconsents ( id varchar(30) not null, userId varchar(40) not null, enabled char(1) not null,
			 sortId int(10) not null, batchId bigint not null, txnDate datetime not null, primary key (userId, id),
			 constraint fk_userconsents_userid foreign key(userId) references users(id) )`);		

		schemaQuerries.push(`create table userconsents_aud ( id varchar(30) not null, userId varchar(40) not null, enabled char(1) not null,
			sortId int(10) not null, batchId bigint not null, txnDate datetime not null, primary key (userId, id, batchId),
			constraint fk_userconsents_aud_userid foreign key(userId) references users(id)  )`);
			

		return mapSeriesParameter(runDirectQueryPromise, schemaQuerries);
	}

	install(): Promise<any> 
	{
		var installQuerries : string[] = [];
		installQuerries.push(`insert into db_version (product, version) values ('didomi', 1) `);
		
		return mapSeriesParameter(runDirectQueryPromise, installQuerries);
	}

	deploy(): Promise<any> 
	{
		var installQuerries : string[] = [];
		return mapSeriesParameter(runDirectQueryPromise, installQuerries);
	}
	
}

