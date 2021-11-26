
import * as dotenv from "dotenv";
dotenv.config();

import * as express from 'express';
import apiRouter from '../../src/server/routes';
import { Migration } from '../../src/server/migration';
import { disconnect } from '../../src/server/repository/connection';



export default class TestHelpers 
{

    public static appInstance: express.Application;

    public static getApp(): Promise<express.Application> 
	{
        return new Promise<express.Application>((resolve, reject)=>
        {
            if (this.appInstance) 
            {
                resolve(this.appInstance);
                return;
            } else {

                const app = express();

                app.use(express.static('public'));
                app.use(express.json()); // this middlewre must come first
                app.use(apiRouter);

                const port = process.env.PORT || 3100;
                app.listen(port, () => 
                {
                    console.log(`Test Server Started, Currently listening on port: ${port}`)
                    this.appInstance = app;
                    resolve(this.appInstance);
                });
            }
        })
    }

    public static async clearDatabase(): Promise<void> 
	{
        await Migration.dropDatabase();
        //await Migration.createDatabase();
        console.log("Updating Schema tables")
        var mg = new Migration();
        await mg.run();
        console.log("Updated Schema tables")
    }

    public static async closeConnection(): Promise<void> 
	{
        await disconnect();
    }

}