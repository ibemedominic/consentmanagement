
import {userDao, consentDao } from "../repository/user.dao";
import {UserData, UserConsentData, ConsentData } from "../model/user.data";
import {UserValidator } from "../validators/user.validator";
import { Guid } from "guid-typescript";
import { FilterCriteria, ValidationResult } from "../model/core.data";
import { verify } from "crypto";
import { getConnection, Transaction } from '../repository/connection';


/**
 * Following Good design methodologies, we define a Service layer that is responsible for managing the business logic and 
 * data interactions within the application
 */
export class UserService
{
	constructor()
	{
	
	}
	
	async findUsers(filter : any) : Promise<UserData[]>
	{
		return userDao.findUsers(filter);
	}
	
	async findUserByKey(key : string) : Promise<UserData>
	{
		var user = await userDao.findUserByKey(key);
		if(user != null)
		{
			var filter = new FilterCriteria();
			filter.addCondition("userId", key, "=");
			var consents = await consentDao.findUserConsents(filter);
			user.consents = consents.map((a)=>
			{
				return {
					id : a.id,
					enabled : a.enabled
				}
			});
		}
		return user;
	}
	
	async addUser(user : UserData, consents : ConsentData[]) : Promise<UserData>
	{
		await UserValidator.validateUserData(user);
		await UserValidator.validateUserConsentData(consents);
		
		console.log(" Completed Validations ");
		user.id = Guid.create().toString();

		var connection = await getConnection();
		var txn : Transaction = new Transaction(connection);
		await txn.beginTransaction();
		var rollback = false;
		try
		{
			var batchId = await consentDao.findNextBatchID(user.id);
			console.log(" Batch Id = " + batchId);
			await userDao.addUser(user);
			var txnDate = new Date();
			if((consents != null) && (consents.length > 0))
			{
				var validConsents : UserConsentData[] = consents.map((a, index)=>
				{
					return { 
						id : a.id,
						enabled : a.enabled,
						userId : user.id,
						sortId : index,
						batchId : batchId,
						txnDate : txnDate
					};
				})
				await consentDao.addUserConsents(validConsents);
				await consentDao.addUserConsentAudits(validConsents);
			}
			user = await this.findUserByKey(user.id);
		} catch(e)
		{
			console.log("Exception Occurred");
			console.log(e);
			rollback = true;
			throw e;
		} finally {
			if(rollback)
			{
				console.log(" Rolling back Transaction ");
				await txn.rollback();
			} else {
				console.log(" Completed Transaction ");
				await txn.commit();
			}
		}
		return user;
	}
	
	async updateConsent(userId : string, consents : ConsentData[]) : Promise<UserData>
	{
		if((consents == null) || (consents.length == 0))
		{
			consents = [{
				id : "email_notifications",
				enabled : false
			}, {
				id : "sms_notifications",
				enabled : false
			}];
		}

		await UserValidator.validateUserConsentData(consents);
		
		var filter = new FilterCriteria();
		filter.addCondition("userId", userId, "=");
		
		var connection = await getConnection();
		var txn : Transaction = new Transaction(connection);
		await txn.beginTransaction();
		var rollback = false;
		try
		{
			var batchId = await consentDao.findNextBatchID(userId);
			console.log(" Batch Id = " + batchId);
			await consentDao.deleteUserConsentByFilter(filter);
			
			var txnDate = new Date();

			var validConsents : UserConsentData[] = consents.map((a, index)=>
			{
				return { 
					id : a.id,
					enabled : a.enabled,
					userId : userId,
					sortId : index,
					batchId : batchId,
					txnDate : txnDate
				};
			})
			await consentDao.addUserConsents(validConsents);
			await consentDao.addUserConsentAudits(validConsents);
			
		} catch(e)
		{
			console.log("Exception Occurred");
			console.log(e);
			rollback = true;
			throw e;
		} finally {
			if(rollback)
			{
				txn.rollback();
			} else {
				txn.commit();
			}
		}
		return await this.findUserByKey(userId);
	}
	
	async findUserConsentHistories(userId : string) : Promise<UserConsentData[]>
	{
		var filter = new FilterCriteria();
		filter.addCondition("userId", userId, "=");
		var existing = await consentDao.findUserConsentAudits(filter);
		return existing;
	}
	
	async removeUser(userId : string) : Promise<any>
	{
		var filter = new FilterCriteria();
		filter.addCondition("userId", userId, "=");
		
		var connection = await getConnection();
		var txn : Transaction = new Transaction(connection);
		await txn.beginTransaction();
		var rollback = false;
		try
		{
			await consentDao.deleteUserConsentAuditByFilter(filter);
			await consentDao.deleteUserConsentByFilter(filter);
			await userDao.deleteUser(userId);
			
		} catch(e)
		{
			console.log("Exception Occurred");
			console.log(e);
			rollback = true;
			throw e;
		} finally {
			if(rollback)
			{
				txn.rollback();
			} else {
				txn.commit();
			}
		}
	}
	
	
}

