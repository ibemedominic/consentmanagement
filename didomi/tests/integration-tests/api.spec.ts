import 'jest';
import * as express from 'express';
import * as request from 'supertest';
import { StatusCodes } from 'http-status-codes';

import TestHelpers from "../helpers/test-helpers";
import testData from "../helpers/test-data";

import { UserData, UserConsentData, ConsentData, UserConsentRequest } from "../../src/server/model/user.data";
import { UserService } from "../../src/server/service/user.service";


describe('API integration tests', () => 
{
    let app: express.Application;
    let userService : UserService;

    beforeEach(async() => {
        jest.setTimeout(30000);
        await TestHelpers.clearDatabase();
        app = await TestHelpers.getApp();
        userService = new UserService();
    });

    afterAll(async ()=>
    {
        TestHelpers.closeConnection();
    })


    it('Testing the Consent API', async () => 
	{

        var userData = null, found : UserData = null, found2 : UserData = null;
        var lastConsents : ConsentData[] = null;
        var consentHistories : UserConsentData[] = null, expectedHistories : ConsentData[] = null;
        var consentRequest : UserConsentRequest = null;

        for (const entry of testData) 
        {
            userData = { email : entry.email };
            expectedHistories  = [];
            found = null;

            // Test for User Creation
            await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .send(userData)
            .expect(StatusCodes.OK)
            .then(async (response) => 
            {
                // Check the response
                found = response.body;
                expect(response.body.id).toBeTruthy()
                expect(response.body.email).toBe(userData.email)
                expect(response.body.consents.length).toBe(0)

                // Check the data in the database
                const post = await userService.findUserByKey(response.body.id);
                expect(post).toBeTruthy()
                expect(post.email).toBe(response.body.email)
                expect(post.consents.length).toBe(response.body.consents.length)

                // check for duplicate
                await request(app)
                .post('/users')
                .set('Accept', 'application/json')
                .send(userData)
                .expect(StatusCodes.UNPROCESSABLE_ENTITY);

                
                // check for invalid email address

                await request(app)
                .post('/users')
                .set('Accept', 'application/json')
                .send({ email : "invalid.email.yahoo.com"})
                .expect(StatusCodes.UNPROCESSABLE_ENTITY);

            });

            for(const consent of entry.consentsFlows) 
            {
                consentRequest = {
                    user : { id : found.id },
                    consents : consent
                };
                consent.forEach((centry)=>
                {
                    expectedHistories.push(centry);
                })

                // Test Events Creation in sequence
                await request(app)
                .post('/events')
                .set('Accept', 'application/json')
                .send(consentRequest)
                .expect(StatusCodes.OK)
                .then(async (response) => 
                {
                    // Check the response
                    found2 = response.body;
                    expect(found2.consents.length).toBe(consent.length)

                    for(var i = 0; i < consent.length; ++i)
                    {
                        expect(found2.consents[i]).toStrictEqual(consent[i]);
                        //expect(found2.consents[i].enabled).toBe(consent[i].enabled)
                    }
        
                    // Check the data in the database
                    const post = await userService.findUserByKey(response.body.id);
                    expect(JSON.stringify(post)).toBe(JSON.stringify(found2))
                    


                    // Test Order of Stored Events
                    await request(app)
                    .get(`/users?id=${found.id }`)
                    .expect(StatusCodes.OK)
                    .then(async (response) => 
                    {
                        // Check the response
                        found2 = response.body;
                        expect(JSON.stringify(post)).toBe(JSON.stringify(found2))
                    })

                });

            }

            // test for consent audits
            await request(app)
            .get(`/eventhistories?id=${found.id }`)
            .expect(StatusCodes.OK)
            .then(async (response) => 
            {
                // Check the response
                consentHistories = response.body;
                expect(consentHistories.length).toBe(expectedHistories.length);

                for(var i = 0; i < expectedHistories.length; ++i)
                {
                    expect(consentHistories[i].id).toBe(expectedHistories[i].id);
                    expect(consentHistories[i].enabled).toBe(expectedHistories[i].enabled)
                }

            })

            
        }

    });




});
