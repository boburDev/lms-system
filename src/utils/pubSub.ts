import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

// Type assertion to access the protected member ee
(pubsub as any).ee.setMaxListeners(30);

export { pubsub };
