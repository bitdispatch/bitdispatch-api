#!/usr/bin/env ts-node

import { AddPostData } from '../src/entity';
import { PubSub, Topic } from '@google-cloud/pubsub';

const pubsub = new PubSub();

const topicName = 'post-image-processed';
const topic = pubsub.topic(topicName);

const newPosts: AddPostData[] = [
  {
    id: '185976c940eb141db4cfffb9c0547875',
    title:
      'Former Korean Finance Minister Joins Hashed Open Research to Promote Blockchain',
    tags: ['industry'],
    publishedAt: '2022-08-28T12:02:19.000Z',
    publicationId: 'bitcoinist',
    url: 'https://bitcoinist.com/former-korean-finance-minister-joins-hashed-open-research-to-promote-blockchain/',
    image:
      'https://res.cloudinary.com/dysahequr/image/upload/f_auto,q_auto/v1/posts/781781251e78a42c94a44dd4e86b9807',
    siteTwitter: '@bitcoinist',
    creatorTwitter: '@bitcoinist',
    readTime: 1,
    canonicalUrl:
      'https://bitcoinist.com/former-korean-finance-minister-joins-hashed-open-research-to-promote-blockchain/',
    placeholder:
      'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAFAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHhAAAgIDAQADAAAAAAAAAAAAAQIDBQAEEQYSMkH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAEiQv/aAAwDAQACEQMRAD8Ayny89XYelqdSWoT4SbUayA7Dsrr3hHD+HI1rGkdpuJECkazOqqD9QGPBjGOlQeT/2Q==',
    ratio: 1.75,
  },
];

const sendPostsToPubSub = async (): Promise<void> => {
  console.log('here');
  await Promise.all(
    newPosts.map(async (post) => {
      try {
        await topic.publishMessage({
          json: post,
        });
      } catch (err) {
        console.error(
          { err, topic: topic.name, post },
          'failed to publish message',
        );
      }
    }),
  );
};

sendPostsToPubSub()
  .then(() => {
    console.log('Finished sending posts to PubSub topic: ');
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
