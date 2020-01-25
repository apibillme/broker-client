# Broker Client

The official broker client.

## Use

```typescript
import BrokerClient from 'broker-client';

const es = new BrokerClient('http://url', {
  headers: new Headers({
    'Last-Event-ID': 'some-id',
    Authorization: 'Bearer 123token',
  }),
});

es.onopen = (event: Event) => void;
es.onclose = () => void;
es.onmessage = (messageEvent: MessageEvent) => any;
es.addEventListener('MyEvent', (messageEvent) => any);
es.removeEventListener('MyEvent');
es.close();
```
