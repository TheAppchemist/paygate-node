const axios = require('axios')
const moment = require('moment')
const md5 = require('md5')
const express = require('express')

const app = express()
const port = 3000

const encryptionKey = 'secret';

app.post('/payment', (req, res) => {
    console.log(req.url)
    console.log(req.params, req.body, req.query)

    res.send('Success')
})

app.get('/', (req, res) => {
    const data = {
        PAYGATE_ID: 10011072130,
        REFERENCE: 'test1',
        AMOUNT: 1000,
        CURRENCY: 'ZAR',
        RETURN_URL: 'https://41c471088788.ngrok.io/payment',
        TRANSACTION_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
        LOCALE: 'en-za',
        COUNTRY: 'ZAF',
        EMAIL: 'melvin@appchemy.co.za',
        NOTIFY_URL: 'http://41c471088788.ngrok.io/payment'
    }
    
    const keys = Object.keys(data)
    const params = new URLSearchParams()
    
    keys.forEach(key => {
        params.append(key, data[key])
    })
    
    const checksum = md5(keys.map(key => data[key]).join('') + encryptionKey)
    
    params.append('CHECKSUM', checksum)
    
    axios.default.post(
        'https://secure.paygate.co.za/payweb3/initiate.trans',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ).then(result => {
        const data = result.data.split('&')
        console.log(data)

        const parsedData = {}
        data.forEach(item => {
            const values = item.split('=')
            parsedData[values[0]] = values[1]
        })

        res.send(`
        <form action="https://secure.paygate.co.za/payweb3/process.trans" method="POST" >
            <input type="hidden" name="PAY_REQUEST_ID" value="${parsedData['PAY_REQUEST_ID']}">
            <input type="hidden" name="CHECKSUM" value="${parsedData['CHECKSUM']}">
            <button type='submit'>Pay</button>
        </form>
        `)
    }).catch(err => {
        console.log(err)
    })

    
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })