import { getConnection } from './connection';
import { FilterCriteria } from '../model/core.data';
import { UserData, UserConsentData } from '../model/user.data';
import { MysqlError } from 'mysql';

/**
 * The User DAO class encapsulates all our DB Querries, it provides functionalities for Basic CRUD operations
 * In a real project, you would probably seperate this into files per DB model.
 */
class UserDAO
{

	constructor()
	{
	
	}
	
	async findUsers(filter : FilterCriteria) : Promise<UserData[]>
	{
		return new Promise<UserData[]>((resolve, reject) =>
		{
			var sql = " select a.id as id, a.email as email from users a ";
			var filterQuery = filter.getSqlCriteria("a").trim();
			if(filterQuery.length > 0)
			{
				sql += " where " + filterQuery;
			}
			getConnection().then((connection)=>
			{	
				connection.query(sql, (err : MysqlError, results)=>
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
	
	async findUserByKey(key : string) : Promise<UserData>
	{
		return new Promise<UserData>((resolve, reject) =>
		{
			getConnection().then((connection)=>
			{		
				connection.query(" select a.id as id, a.email as email from users a where a.id = ?", [key], (err : MysqlError, results)=>
				{
					if(err)
					{
						return reject(err);
					}
					if(results.length > 0)
					{
						resolve(results[0]);
					}
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}
	
	async addUser(user : UserData) : Promise<UserData>
	{
		return new Promise<UserData>((resolve, reject) =>
		{
			var sql = "INSERT INTO users (id, email) VALUES (?, ?) ";
			getConnection().then((connection)=>
			{		
				connection.query(sql, [user.id, user.email], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					console.log("Number of records inserted: " + result.affectedRows);
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}
	
	async deleteUser(key : string)
	{
		return new Promise((resolve, reject) =>
		{
			var sql = "DELETE FROM users WHERE id = ? ";
			getConnection().then((connection)=>
			{		
				connection.query(sql, [key], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}
	
}


/**
 * The User Consent DAO class encapsulates all our DB Querries, it provides functionalities for Basic CRUD operations
 * In a real project, you would probably seperate this into files per DB model.
 */
class UserConsentDAO
{
	constructor()
	{
	
	}
	
	async findUserConsents(filter : FilterCriteria) : Promise<UserConsentData[]>
	{
		return new Promise<UserConsentData[]>((resolve, reject) =>
		{
			var sql = ` select a.id as id, a.enabled as enabled, a.userId as userId, a.sortId as sortId, 
						a.batchId as batchId, a.txnDate as txnDate from userconsents a `;
			var filterQuery = filter.getSqlCriteria("a").trim();
			if(filterQuery.length > 0)
			{
				sql += " where " + filterQuery;
			}
			sql += " order by a.userId asc, a.batchId asc, a.sortId asc ";

			getConnection().then((connection)=>
			{	
				connection.query(sql, (err : MysqlError, results)=>
				{
					if(err)
					{
						return reject(err);
					}
					var mappedConsents : UserConsentData[] = results.map((a : any)=>
					{
						return {
							id : a.id,
							enabled : (a.enabled == "Y") ? true : false,
							userId : a.userId,
							sortId : a.sortId,
							batchId : a.batchId,
							txnDate : a.txnDate
						}
					}) || [];
					resolve(mappedConsents);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}
	
	async findNextBatchID(user : string) : Promise<number>
	{
		return new Promise<number>((resolve, reject) =>
		{
			var sql = ` select coalesce(max(a.batchId), 0) + 1 as batchId from userconsents_aud a where a.userId = ? `;
			getConnection().then((connection)=>
			{	
				connection.query(sql, [user], (err : MysqlError, results)=>
				{
					if(err)
					{
						return reject(err);
					}
					if(results.length > 0)
					{
						resolve(results[0].batchId);
					} else {
						resolve(1);
					}
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}
	
	async findUserConsentAudits(filter : FilterCriteria) : Promise<UserConsentData[]>
	{
		return new Promise<UserConsentData[]>((resolve, reject) =>
		{
			var sql = ` select a.id as id, a.enabled as enabled, a.userId as userId, a.sortId as sortId, 
						a.batchId as batchId, a.txnDate as txnDate from userconsents_aud a `;
			var filterQuery = filter.getSqlCriteria("a").trim();
			if(filterQuery.length > 0)
			{
				sql += " where " + filterQuery;
			}
			sql += " order by a.userId asc, a.batchId asc, a.sortId asc ";

			getConnection().then((connection)=>
			{	
				connection.query(sql, (err : MysqlError, results)=>
				{
					if(err)
					{
						return reject(err);
					}
					var mappedConsents : UserConsentData[] = results.map((a : any)=>
					{
						return {
							id : a.id,
							enabled : (a.enabled == "Y") ? true : false,
							userId : a.userId,
							sortId : a.sortId,
							batchId : a.batchId,
							txnDate : a.txnDate
						}
					});
					resolve(mappedConsents);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}
	
	async findUserConsentByKey(userId : string, consentId : string) : Promise<UserConsentData>
	{
		return new Promise<UserConsentData>((resolve, reject) =>
		{
			var sql = ` select a.id as id, a.enabled as enabled, a.userId as userId, a.sortId as sortId, 
						a.batchId as batchId, a.txnDate as txnDate from userconsents a where a.id = ? and a.userId = ? `;

			getConnection().then((connection)=>
			{	
				connection.query(sql, [consentId, userId], (err : MysqlError, results)=>
				{
					if(err)
					{
						return reject(err);
					}
					if(results.length > 0)
					{
						var option = results[0];
						var actual : UserConsentData = {
							id : option.id,
							enabled : (option.enabled == "Y") ? true : false,
							userId : option.userId,
							sortId : option.sortId,
							batchId : option.batchId,
							txnDate : option.txnDate
						}

						resolve(actual);
					}
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}
	
	async addUserConsent(consent : UserConsentData) : Promise<any>
	{
		return new Promise<any>((resolve, reject) =>
		{
			var sql = "INSERT INTO userconsents (id, enabled, userId, sortId, batchId, txnDate) VALUES (?, ?, ?, ?, ?, ?) ";
			getConnection().then((connection)=>
			{	
				connection.query(sql, [consent.id, (consent.enabled == true) ? "Y" : "N", consent.userId, consent.sortId, consent.batchId, consent.txnDate], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					//console.log("Number of records inserted: " + result.affectedRows);
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}
	
	async addUserConsents(consents : UserConsentData[]) : Promise<any>
	{
		return new Promise<any>((resolve, reject) =>
		{
			if((consents == null) || (consents.length == 0))
			{
				return resolve({});
			}

			var sql = "INSERT INTO userconsents (id, enabled, userId, sortId, batchId, txnDate) VALUES ?";
			var mappedConsents = consents.map((a)=>
			{
				return [
					a.id,
					(a.enabled == true) ? "Y" : "N",
					a.userId,
					a.sortId,
					a.batchId,
					a.txnDate
				]
			});
			getConnection().then((connection)=>
			{	
				connection.query(sql, [mappedConsents], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					//console.log("Number of records inserted: " + result.affectedRows);
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}
	
	async addUserConsentAudit(consent : UserConsentData) : Promise<any>
	{
		return new Promise<any>((resolve, reject) =>
		{
			var sql = "INSERT INTO userconsents_aud (id, enabled, userId, sortId, batchId, txnDate) VALUES (?, ?, ?, ?, ?, ?) ";
			
			getConnection().then((connection)=>
			{	
				connection.query(sql, [consent.id, (consent.enabled == true) ? "Y" : "N", consent.userId, consent.sortId, consent.batchId, consent.txnDate], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					//console.log("Number of records inserted: " + result.affectedRows);
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}
	
	async addUserConsentAudits(consents : UserConsentData[]) : Promise<any>
	{
		return new Promise<any>((resolve, reject) =>
		{
			if((consents == null) || (consents.length == 0))
			{
				return resolve({});
			}
			
			var sql = "INSERT INTO userconsents_aud (id, enabled, userId, sortId, batchId, txnDate) VALUES ? ";
			var mappedConsents = consents.map((a)=>
			{
				return [
					a.id,
					(a.enabled == true) ? "Y" : "N",
					a.userId,
					a.sortId,
					a.batchId,
					a.txnDate
				]
			});
			
			getConnection().then((connection)=>
			{	
				connection.query(sql, [mappedConsents], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					//console.log("Number of records inserted: " + result.affectedRows);
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}
	
	async deleteUserConsent(userId : string, consentId : string)
	{
		return new Promise((resolve, reject) =>
		{
			var sql = "DELETE FROM userconsents WHERE id = ? and userId = ? ";
			
			getConnection().then((connection)=>
			{	
				connection.query(sql, [consentId, userId], function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}

	async deleteUserConsentByFilter(filter : FilterCriteria)
	{
		return new Promise((resolve, reject) =>
		{
			var filterQuery = filter.getSqlCriteria("").trim();
			if(filterQuery.length > 0)
			{
				var sql = " DELETE FROM userconsents WHERE " + filterQuery;
			}
			getConnection().then((connection)=>
			{	
				connection.query(sql, function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
		})
	}

	
	async deleteUserConsentAuditByFilter(filter : FilterCriteria)
	{
		return new Promise((resolve, reject) =>
		{
			var filterQuery = filter.getSqlCriteria("").trim();
			if(filterQuery.length > 0)
			{
				var sql = " DELETE FROM userconsents_aud WHERE " + filterQuery;
			}
			getConnection().then((connection)=>
			{	
				connection.query(sql, function (err, result) 
				{
					if(err)
					{
						return reject(err);
					}
					resolve(result);
				});
			})
			.catch((error)=>
			{
				reject(error);
			});
			
		})
	}

	
}

export const userDao : UserDAO = new UserDAO();
export const consentDao : UserConsentDAO = new UserConsentDAO();


