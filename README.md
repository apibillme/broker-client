# Broker Client

The official broker client.

Check out broker - your Real-time Zero-Code API Server - [https://crates.io/crates/broker](https://crates.io/crates/broker)

## Use

```javascript
import BrokerClient from 'broker-client';

const sse = new BrokerClient('http://url', {
  headers: {
    authorization: 'Bearer 123token',
  },
});

sse.addEventListener('MyEvent', (messageEvent) => {});
```
