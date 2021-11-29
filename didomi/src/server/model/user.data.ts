

/**
 * This Interface represents the Consents that can be attached to a User
 */
export interface ConsentData
{
	id : string;
	enabled : boolean;
}

/**
 * This interface represents a User as well as the List of Consents applied to him
 */
export interface UserData
{
	id : string;
	email : string;
	consents : ConsentData[];
};


/**
 * This represents the Actual User Consent Model in storage
 */
export interface UserConsentData extends ConsentData
{
	userId : string;
	sortId : number;
	batchId : number;
	txnDate : Date;
}

/**
 * This represents a User Consent Request which can be used to request consents from a User
 */
export interface UserConsentRequest
{
	user : { id : string };
	consents : ConsentData[];
};
