import { messageToJson, Worker } from './worker';
import { AddPostData, addNewPost } from '../entity';

const test: AddPostData = {
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
};

const worker: Worker = {
  subscription: 'new-processed-post',
  handler: async (message, con, logger): Promise<void> => {
    const data: AddPostData = messageToJson(message);

    try {
      await addNewPost(con, data, logger);

      logger.info(
        {
          postId: data.id,
          messageId: message.messageId,
        },
        'added new post',
      );
    } catch (err) {
      logger.error(
        {
          postId: data.id,
          messageId: message.messageId,
          err,
        },
        'failed to add new post',
      );
      if (err.name === 'QueryFailedError') {
        return;
      }
      throw err;
    }
  },
};

export default worker;
