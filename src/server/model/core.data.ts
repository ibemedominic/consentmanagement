import { stringify } from "querystring";


/**
 * This holds the Filter Conditions for our DAO querries
 */
export class FilterCondition
{
	name : string;
	type : string;
	negate : boolean;
	value : any;
	secondValue : any;
}

/**
 * The Filter Criteria Class provides us Bare Bone filter Criterias that we can build for our DAO layer
 */
export class FilterCriteria
{

	private _parameters : FilterCondition[];

	constructor() 
	{
		this._parameters = [];
	}

	addCondition(name : string, value : any, type? : string) : FilterCondition
	{
		var condition : FilterCondition = new FilterCondition();
		condition.name = name;
		condition.value = value;
		condition.type = type || "EQ";
		return this.addParameter(condition);
	}

	get parameters() : FilterCondition[]
	{
		return this._parameters;
	}

	addParameter(param : FilterCondition) : FilterCondition
	{
		if (param != null) 
		{
			this._parameters.push(param);
		}
		return param;
	}

	/**
	 * Here we build out the Sql where Criteria for the entire filter
	 * @param prefix an optional prefix to be added to the query
	 * @returns the full sql where criteria
	 */
	getSqlCriteria(prefix : string) : string
	{
		var result = "";
		this._parameters.forEach((obj : FilterCondition) => 
		{
			var strValue = FilterCriteria.makeHSqlCriterion(obj, prefix);
			result += " and " + strValue;
		})
		if (result.length > 4) {
			result = result.substr(4);
		}
		return result;
	}

	static makeString(target : any) : string
	{
		if (target == null) 
		{
			return "";
		}
		else if (typeof (target) == "string") 
		{
			return `'${target}'`;
		}
		else if (target instanceof Date) 
		{
			var td = <Date>target;
			var year = td.getFullYear();
			var month = td.getMonth();
			var day = td.getDate();
			var hour = td.getHours();
			var min = td.getMinutes();
			var secs = td.getSeconds();
			return `${year}-${month}-${day} ${hour}:${min}:${secs}`;
		}
		else {
			return "" + target;
		}
	}
	
	/**
	 * Here we build out the Sql where Criteria for a specified filter condition
	 * @param param the Sql Filter Condition
	 * @param prefix an optional prefix to be added to the query
	 * @returns the partial sql where criteria
	 */
	static makeHSqlCriterion(param : FilterCondition, prefix? : string) 
	{
		var result = null;
		var paramName = param.name;
		prefix = prefix || "";
		prefix = prefix.trim();
		if (prefix.length > 0)
		{
			paramName = prefix + "." + param.name;
		}
		else {
			paramName = param.name;
		}
		var type = param.type.toUpperCase();

		if (type == "LIKE") 
		{
			var paramValue = "" + param.value;
			if (!String(paramValue).startsWith("%")) 
			{
				paramValue = "%" + paramValue;
			}
			if (!String(paramValue).endsWith("%")) 
			{
				paramValue = paramValue + "%";
			}
			paramValue = FilterCriteria.makeString(paramValue);
			if (param.negate) 
			{
				result = paramName + " not like " + paramValue;
			}
			else {
				result = paramName + " like " + paramValue;
			}
		}
		else if (type == "ENDSWITH") 
		{
			var paramValue = "" + param.value;
			if (!String(paramValue).startsWith("%")) 
			{
				paramValue = "%" + paramValue;
			}
			paramValue = FilterCriteria.makeString(paramValue);
			if (param.negate) {
				result = paramName + " not like " + paramValue;
			}
			else {
				result = paramName + " like " + paramValue;
			}
		}
		else if (type == "STARTSWITH") 
		{
			var paramValue = "" + param.value;
			if (!String(paramValue).endsWith("%")) 
			{
				paramValue = paramValue + "%";
			}
			paramValue = FilterCriteria.makeString(paramValue);
			if (param.negate) {
				result = paramName + " not like " + paramValue;
			}
			else {
				result = paramName + " like " + paramValue;
			}
		}
		else if (type == "=") 
		{
			var paramValue = FilterCriteria.makeString(param.value);
			if (param.negate) {
				result = paramName + " <> " + paramValue;
			}
			else {
				result = paramName + " = " + paramValue;
			}
		}
		else if (type == "IN") 
		{
			var collection = param.value;
			if (collection != null) 
			{
				var inclause = "";
				collection.forEach((obj : any) => 
				{
					var strValue = FilterCriteria.makeString(obj);
					inclause = inclause + ", " + strValue;
				})
				if (inclause.length > 2) {
					inclause = inclause.substr(2);
				}
				if (param.negate) {
					result = paramName + ` not in ( ${inclause} )`;
				}
				else {
					result = paramName + ` in ( ${inclause} )`;
				}
			}
		}
		else if (type == "BETWEEN") 
		{
			var paramValue1 = FilterCriteria.makeString(param.value);
			var paramValue2 = FilterCriteria.makeString(param.secondValue);
			if (param.negate) {
				result = ` ${paramName} not between ${paramValue1} and ${paramValue2} `;
			}
			else {
				result = ` ${paramName} between ${paramValue1} and ${paramValue2} `;
			}
		}
		else if (type == ">") 
		{
			var paramValue = FilterCriteria.makeString(param.value);
			if (param.negate) {
				result = paramName + " <= " + paramValue;
			}
			else {
				result = paramName + " > " + paramValue;
			}
		}
		else if (type == ">=") {
			var paramValue = FilterCriteria.makeString(param.value);
			if (param.negate) {
				result = paramName + " < " + paramValue;
			}
			else {
				result = paramName + " >= " + paramValue;
			}
		}
		else if (type == "<") 
		{
			var paramValue = FilterCriteria.makeString(param.value);
			if (param.negate) {
				result = paramName + " >= " + paramValue;
			}
			else {
				result = paramName + " < " + paramValue;
			}
		}
		else if (type == "<=") {
			var paramValue = FilterCriteria.makeString(param.value);
			if (param.negate) {
				result = paramName + " > " + paramValue;
			}
			else {
				result = paramName + " <= " + paramValue;
			}
		}
		else if (type == "ISNULL") 
		{
			if (param.negate) {
				if (prefix != null) {
					result = paramName + " is not Null";
				}
				else {
					result = param.name + " is not Null";
				}
			}
			else {
				if (prefix != null) {
					result = paramName + " is Null";
				}
				else {
					result = param.name + " is Null";
				}
			}
			return result;
		}
		return result;
	}

}


/**
 * This stores the Results of a Validation Process
 */
 export class ValidationResult extends Error 
 {
 
	 constructor(public errors : string[]) 
	 {
		 super("");

		 if (Error.captureStackTrace) 
		 {
			 Error.captureStackTrace(this, ValidationResult)
		 }

		 if(errors == null)
		 {
			 errors = [];
		 }
	 }

	 addError(error : string)
	 {
		this.errors.push(error);	 
	 }

	 get success()
	 {
		 return (this.errors.length == 0);
	 }

	 get message()
	 {
		 return this.errors.join("\n");
	 }

	 toString()
	 {
		 return ` Failed Validations : ${this.message}`;
	 }

 }
 