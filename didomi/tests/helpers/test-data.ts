var testData = 
[
    {
        email : "detroydom@yahoo.com",
        consentsFlows : [
            [{
                "id": "email_notifications",
                "enabled": true
            }],
            [{
                "id": "email_notifications",
                "enabled": false
            }, {
                "id": "sms_notifications",
                "enabled": true
            }],
            [{
                "id": "email_notifications",
                "enabled": false
            }, {
                "id": "sms_notifications",
                "enabled": true
            }],
            [{
                "id": "email_notifications",
                "enabled": false
            }, {
                "id": "sms_notifications",
                "enabled": true
            }]
        ],
        expectedConsents : 
        [{
            "id": "email_notifications",
            "enabled": false
        }, {
            "id": "sms_notifications",
            "enabled": true
        }]
    }

]

export default testData;