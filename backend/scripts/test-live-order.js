const https = require('https');

async function testLiveOrder() {
  console.log('Sending live test order request to Render backend...');
  
  // Login first to get JWT token
  const authData = JSON.stringify({ email: 'admin@shop.com', password: 'adminpassword123' });
  
  const loginReq = https.request('https://jaldikharido-1.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': authData.length
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        const token = json.token;
        console.log('Login successful! JWT Token acquired.');
        
        // Now post order
        const orderData = JSON.stringify({
          items: [{ product: '6a4ea24759b2c45bf814ca99', quantity: 1 }],
          shippingAddress: {
            fullName: 'Deepak Test',
            phone: '9844834494',
            address: '123 MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pinCode: '560001'
          },
          paymentMethod: 'COD'
        });

        const orderReq = https.request('https://jaldikharido-1.onrender.com/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': orderData.length
          }
        }, (res2) => {
          let body2 = '';
          res2.on('data', chunk => body2 += chunk);
          res2.on('end', () => {
            console.log('Live Order Response:', body2);
          });
        });

        orderReq.write(orderData);
        orderReq.end();
      } catch (e) {
        console.error('Error parsing login response:', body);
      }
    });
  });

  loginReq.write(authData);
  loginReq.end();
}

testLiveOrder();
