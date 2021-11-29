
import * as express from 'express';
import { UserService } from "./service/user.service";
import {UserData, UserConsentRequest, ConsentData } from "./model/user.data";
import {Migration } from "./migration";

const router = express.Router();

var userService : UserService = new UserService();


/**
 * 
 * Firstly we setup the mandatory routes
 */

router.get('/users', async (req, res, next) => 
{
    try
    {
        var userId = "" + req.query["id"];
        var user = {};
        if(userId.trim().length > 0)
        {
            user = await userService.findUserByKey(userId.trim());
        }
        res.json(user);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(422);
    }
});

router.post('/users', async (req, res, next) => 
{
    try
    {
        var content = <UserData>req.body;
        let users = await userService.addUser(content, content.consents || []);
        res.status(200).json(users);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(422);
    }

});

router.delete('/users', async (req, res, next) => 
{
    try
    {
        var userId = "" + req.query["id"];
        if(userId.trim().length > 0)
        {
            await userService.removeUser(userId.trim());
        }
        res.json({  id : userId });
    } catch(e)
    {
        console.log(e);
        res.sendStatus(422);
    }

});

router.post('/events', async (req, res, next) => 
{
    try
    {
        var consentData = <UserConsentRequest>req.body;
        if((consentData.user != null) && (consentData.user.id != null))
        {
            let users = await userService.updateConsent(consentData.user.id, consentData.consents);
            res.status(200).json(users);
        } else {
            console.log(" No User Id specified");
            res.sendStatus(422);
        }
    } catch(e)
    {
        console.log(e);
        res.sendStatus(422);
    }

});


router.post('/install', async (req, res, next) => 
{
    try
    {
        var migration : Migration = new Migration();
        await migration.run();
        var response = { success : true, message : " Database Installed Successfully "};
        res.status(200).json(response);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(422);
    }

});


router.get('/eventhistories', async (req, res, next) => 
{
    try
    {
        var userId = "" + req.query["id"];
        var consentHistories : any[] = [];
        if(userId.trim().length > 0)
        {
            consentHistories = await userService.findUserConsentHistories(userId.trim());
        }
        res.json(consentHistories);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(422);
    }
});


export default router;