
import {userDao, consentDao } from "../repository/user.dao";
import { ValidationResult, FilterCriteria, FilterCondition } from '../model/core.data';
import { UserData, ConsentData } from '../model/user.data';


const EMAIL_VALIDATOR : RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const CONSENT_TYPES : string[] = ["email_notifications", "sms_notifications"];


/**
 * This class holds a list of Validation methods for the Data models used to validate the input requirements
 */
export class UserValidator
{
	
	/**
	 * This is called to Validate the User Data record
	 * @param data The user data to be validated
	 */
	static async validateUserData(data : UserData) : Promise<void>
	{
		var errors : string[] = [];
		if((data.email == null) || (data.email.trim().length == 0))
		{
			errors.push('Email field is required');
		} else 
		{
			var vresult = EMAIL_VALIDATOR.test(data.email);
			if (vresult != true) 
			{
				errors.push(`The Email Address ${data.email} is not valid `);
			} else {
				var filter = new FilterCriteria();
				filter.addCondition("email", data.email, "=");
				var found = await userDao.findUsers(filter);
				if(found.length > 0)
				{
					errors.push(`Duplicate Email Address ${data.email} found`);
				}
			}
		}
		if(errors.length > 0)
		{
			console.log(" Validation Errors = " + errors.join(","));
			var result = new ValidationResult(errors);
			throw result;
		}
	}

	/**
	 * This is called to Validate the User Consent Data record
	 * @param records The user Consent data to be validated
	 */
	static async validateUserConsentData(records : ConsentData[]) : Promise<void>
	{
		var errors : string[] = [];
		if(records == null)
		{
			return;
		}
		
		records.map((data)=>
		{	
			if((data.id == null) || (data.id.trim().length == 0))
			{
				errors.push('User Consent Type is required');
			} else 
			{
				var vresult = CONSENT_TYPES.indexOf(data.id);
				if (vresult == -1) 
				{
					errors.push(`The Consent Type ${data.id} is not valid `);
				}
			}
		})
		if(errors.length > 0)
		{
			console.log(" Validation Errors = " + errors.join(","));
			var result = new ValidationResult(errors);
			throw result;
		}
	}
	
}
