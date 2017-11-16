const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

//1.Create config options, with parameters (mode, client_id, secret).
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AT1bTi2JclkF4cE2hyHAm5v3xvKput78OHTSyv7xxnDd2LkcdTFTfyUZaBnrLk9zZQxn5Z9u7N4H7Zg-',
  'client_secret': 'EBFQ4ywAMfnmNVtce0x90N7bhOOE9Yj90jJY2BTyX0FtjeUkuYytko80LS6IqPMhfsh6gnNSw4i_FW4J'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

//2.Create /pay route
app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "GTR",
          "sku": "001",
          "price": "10000.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "10000.00"
      },
      "description": "This is the payment description."
    }]
  };

//3. Add excute payment function
paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
//4. Loop throw links array for equals to approval_url
      for(let i = 0;i< payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
//5. http://localhost:3000/success?paymentId=PAY-9W1351535U877434WLHYCXKY&token=EC-235859537Y903500K&PayerID=VFTXCC6D2XXN8
        }
      }
  }
});

});

//6. Success route to execute payment
app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "10000"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          // console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));
