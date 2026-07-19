const LIVE_API = 'https://jaldikharido-1.onrender.com/api';

async function testLiveOrder() {
  try {
    console.log('1. Logging in to live API...');
    const loginRes = await fetch(`${LIVE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deepakbhee2006@gmail.com', password: 'user123' })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);

    if (!loginData.success) {
      console.log('Attempting login with user@shop.com...');
      const fallbackRes = await fetch(`${LIVE_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@shop.com', password: 'user123' })
      });
      const fallbackData = await fallbackRes.json();
      console.log('Fallback Login Response:', fallbackData);
      if (!fallbackData.success) return;
      loginData.token = fallbackData.token;
    }

    console.log('\n2. Fetching products from live API...');
    const prodRes = await fetch(`${LIVE_API}/products?limit=1`);
    const prodData = await prodRes.json();
    const productId = prodData.products[0]._id;
    console.log(`Using product ID: ${productId}`);

    console.log('\n3. Placing test order on live API...');
    const orderRes = await fetch(`${LIVE_API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          fullName: 'Live Tester',
          phone: '9844834494',
          address: '456 Live Street',
          city: 'Delhi',
          state: 'Delhi',
          pinCode: '110001'
        },
        paymentMethod: 'COD'
      })
    });

    console.log('Order Response Status:', orderRes.status);
    const orderData = await orderRes.json();
    console.log('Order Response Body:', orderData);

  } catch (err) {
    console.error('❌ Error during live order test:', err);
  }
}

testLiveOrder();
