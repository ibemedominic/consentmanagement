
/**
 * The Module Update interface represent an Update that can be applied to the Database
 */
export interface IModuleUpdate
{
	get version() : number;

	installSchema() : Promise<any>;

	install() : Promise<any>;

	deploy() : Promise<any>;

}


export const mapSeries = async (iterable : { () : Promise<any>; }[], ignoreErrors? : boolean ) => 
{
	for (const promise of iterable) 
	{
		try {
	  		await promise();
		} catch(e)
		{
			if(ignoreErrors != true)
			{
				throw e;
			} else {
				console.log("Ignoring error in promise");
			}
		}
	}
}


export const mapSeriesParameter = async (action : (parameter : any) => Promise<any>, iterable : any[], ignoreErrors? : boolean ) => 
{
	for (const entry of iterable) 
	{
		try {
	  		await action(entry)
		} catch(e)
		{
			if(ignoreErrors != true)
			{
				throw e;
			} else {
				console.log("Ignoring error in promise parameter" + entry);
			}
		}
	}
}


