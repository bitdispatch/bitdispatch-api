import { Connection, getConnection } from 'typeorm';

import { expectSuccessfulBackground } from '../helpers';
import worker from '../../src/workers/newPost';
import { Post, Source } from '../../src/entity';

let con: Connection;

beforeAll(async () => {
  con = await getConnection();
});

it('should save a new post', async () => {
  await con.getRepository(Source).save([
    {
      id: 'bitcoinist',
      twitter: 'bitcoinist',
      website: 'https://bitcoinist.com',
      active: true,
      rankBoost: 22,
      name: 'Bitcoinist',
      image:
        'https://bitcoinist.com/wp-content/uploads/2021/04/cropped-cropped-cropped-Icon-192x192.png',
      private: false,
    },
  ]);

  await expectSuccessfulBackground(worker, {
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
  });
  const posts = await con.getRepository(Post).find();
  expect(posts.length).toEqual(1);
  expect(posts[0]).toMatchSnapshot();
});
