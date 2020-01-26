# Broker Client

The official broker client.

## Use

```javascript
import BrokerClient from 'broker-client';

const sse = new BrokerClient('http://url', {
  headers: new Headers({
    'Last-Event-ID': 'some-id',
    Authorization: 'Bearer 123token',
  }),
});

sse.addEventListener('MyEvent', (messageEvent) => {});
```
