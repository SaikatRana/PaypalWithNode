const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUupZ3dXIhBgFcK5TUoKxQVMySKmyELYHrCW8FhoTEfTl1RwF34g7wIrrARHPv3MBiMF7EZYKb7ZfFg8',
  'client_secret': 'EGSzn2kXkiAxwz_w5ePmyTZFq6N2ZrlSfiTUBnWRu_PCXsldA8P8MAqoHT7B2snWtmNS5BQ4t9xtFnxD'
});

const app  = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index');
});

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
	                "name": "Jhon Miller shirt",
	                "sku": "004",
	                "price": "3500.00",
	                "currency": "INR",
	                "quantity": 1
	            }]
	        },
	        "amount": {
	            "currency": "INR",
	            "total": "3500.00"
	        },
	        "description": "It the best shurt."
	    }]
	};

	paypal.payment.create(create_payment_json, function (error, payment) {
	    if (error) {
	        throw error;
	    } else {

	    	for(let i=0 ; i<payment.links.length; i++){
	    		if(payment.links[i].rel === 'approval_url'){
	    			res.redirect(payment.links[i].href);
	    		}
	    	}
	        /*console.log("Create Payment Response");
	        console.log(payment);
	        res.send('Test');*/
	    }
	});

});

app.get('/success', (req,res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		"payer_id":payerId,
		"transactions":[{
			"amount":{
				"currency":"INR",
				"total":"3500.00"
			}
		}]
	};

	paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
		if(error){
			console.log(error.response);
			throw error;
		} else {
			console.log("Get payment response");
			// console.log(JSON.stringify(payment));
			var newPayment = JSON.stringify(payment);
			console.log(newPayment);
			// shippingAddress = newPayment.transactions[0].item_list.shipping_address;
			// console.log("shippingAddress ====> ",shippingAddress)
			res.send("payment successfully done");
		}
	})

});

app.get('/cancel', (req,res) => {
	res.send('Cancelled');
})

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
