import 'jest';
import { UserData, UserConsentData, ConsentData } from "../../src/server/model/user.data";
import { UserService } from "../../src/server/service/user.service";
import TestHelpers from "../helpers/test-helpers";
import testData from "../helpers/test-data";


describe('Testing the Consent User Service Layer', () => 
{
    let instance: UserService;

    beforeEach( async () => 
    {
        await TestHelpers.clearDatabase();
        instance = new UserService();
    });

    afterAll(async ()=>
    {
        TestHelpers.closeConnection();
    });

    it('Should Create Users Successfully without errors as well as consents', async () => 
	{
        var userData = null, found : UserData = null, found2 : UserData = null;
        var lastConsents : ConsentData[] = null;
        var consentHistories : UserConsentData[] = null, expectedHistories : ConsentData[] = null;

        for (const entry of testData) 
        {
            userData = { email : entry.email };
            found = await instance.addUser(userData, null);
            expect(found.consents).toStrictEqual([]);
            expectedHistories  = [];

            for (const consent of entry.consentsFlows) 
            {
                found2 = await instance.updateConsent(found.id, consent);
                expect(found2.consents).toStrictEqual(consent);
                expect(found2.id).toBe(found.id);
                lastConsents = consent;
                consent.forEach((centry)=>
                {
                    expectedHistories.push(centry);
                })
            }
            
            found2 = await instance.findUserByKey(found.id);
            expect(found2.consents).toStrictEqual(lastConsents);
            expect(found2.id).toBe(found.id);
            expect(found2.email).toBe(found.email);

            // test for histories
            consentHistories = await instance.findUserConsentHistories(found.id);
            expect(consentHistories.length).toBe(expectedHistories.length);
            for(let i = 0; i < expectedHistories.length; ++i)
            {
                expect(consentHistories[i].id).toBe(expectedHistories[i].id);
                expect(consentHistories[i].enabled).toBe(expectedHistories[i].enabled);
            }
        }
        
    });


});

