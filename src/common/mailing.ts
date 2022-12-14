import sgMail from '@sendgrid/mail';
import client from '@sendgrid/client';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { Comment, Post } from '../entity';
import { getDiscussionLink } from './links';
import { pickImageUrl } from './post';
import { User } from './users';

if (process.env.SENDGRID_API_KEY) {
  client.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const templateId = {
  postBanned: 'd-dc6edf61c52442689e8870a434d8811d',
  commentedAuthor: 'd-aba78d1947b14307892713ad6c2cafc5',
  commentCommented: 'd-90c229bde4af427c8708a7615bfd85b4',
  commentCommentedThread: 'd-62cb8a27d08a4951a49aade3b292c1ed',
  commentMentionedUser: 'd-6949e2e50def4c6698900032973d469b',
  commentFeatured: 'd-5888ea6c1baf482b9373fba25f0363ea',
  commentUpvoted: 'd-92bca6102e3a4b41b6fc3f532f050429',
  postAuthorMatched: 'd-3d3402ec873640e788f549a0680c40bb',
  postScoutMatched: 'd-ee7d7cfc461a43b4be776f70940fa867',
  communityLinkRejected: 'd-43cf7ff439ff4391839e946940499b30',
  communityLinkSubmissionAccess: 'd-6d17b936f1f245e486f1a85323240332',
  analyticsReport: 'd-97c75b0e2cf847399d20233455736ba0',
  sourceRequestApproved: 'd-d79367f86f1e4ca5afdf4c1d39ff7214',
  sourceRequestDeclined: 'd-48de63612ff944cb8156fec17f47f066',
  sourceRequestSubmitted: 'd-9254665878014627b4fd71593f09d975',
};

export const truncatePost = (post: Post): string =>
  post.title.length <= 80 ? post.title : `${post.title.substr(0, 77)}...`;

export const formatMailDate = (date: Date): string =>
  date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

export const truncateComment = (comment: Comment): string =>
  comment.content.length <= 85
    ? comment.content
    : `${comment.content.substr(0, 82)}...`;

export const baseNotificationEmailData: Pick<
  MailDataRequired,
  'from' | 'replyTo' | 'trackingSettings' | 'asm' | 'category'
> = {
  from: {
    email: 'informer@daily.dev',
    name: 'daily.dev',
  },
  replyTo: {
    email: 'hi@daily.dev',
    name: 'daily.dev',
  },
  trackingSettings: {
    openTracking: { enable: true },
  },
  asm: {
    groupId: 12850,
  },
  category: 'Notification',
};

export const sendEmail: typeof sgMail.send = (data) => {
  if (process.env.SENDGRID_API_KEY) {
    return sgMail.send(data);
  }
};

export const getCommentedAuthorMailParams = (
  post: Post,
  comment: Comment,
  author: User,
  commenter: User,
): MailDataRequired => {
  const link = getDiscussionLink(post.id);
  return {
    ...baseNotificationEmailData,
    to: author.email,
    templateId: templateId.commentedAuthor,
    dynamicTemplateData: {
      profile_image: commenter.image,
      full_name: commenter.name,
      post_title: post.title,
      post_image: post.image || pickImageUrl(post),
      new_comment: truncateComment(comment),
      discussion_link: link,
      user_reputation: commenter.reputation,
    },
  };
};

// taken from sendgrid library itself
type HttpMethod =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'delete'
  | 'DELETE';

interface EmailContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  custom_fields: Record<string, string>;
}

const profileToContact = (profile: User, contactId: string) => {
  const contact: EmailContact = {
    id: contactId,
    email: profile.email,
    custom_fields: { e1_T: profile.id },
  };

  const name = profile.name && profile.name.trim();
  if (name && name.length && name.length < 50) {
    const [firstName, ...lastName] = name.trim().split(' ');
    contact.first_name = firstName;
    if (lastName.length) {
      contact.last_name = lastName.join(' ');
    }
  }

  return contact;
};

export const addUserToContacts = (
  profile: User,
  lists: string[],
  contactId: string,
) => {
  const request = {
    method: 'PUT' as HttpMethod,
    url: '/v3/marketing/contacts',
    body: {
      list_ids: lists || undefined,
      contacts: [profileToContact(profile, contactId)],
    },
  };
  return client.request(request);
};

export const removeUserFromList = (list: string, contactId: string) => {
  const request = {
    method: 'DELETE' as HttpMethod,
    url: `/v3/marketing/lists/${list}/contacts?contact_ids=${contactId}`,
  };
  return client.request(request);
};

export const removeUserContact = (contactId: string[]) => {
  const request = {
    method: 'DELETE' as HttpMethod,
    url: `/v3/marketing/contacts?ids=${contactId}`,
  };
  return client.request(request);
};

export const updateUserContact = async (
  newProfile: User,
  oldEmail: string,
  lists: string[],
) => {
  const contactId = await getContactIdByEmail(oldEmail);
  return addUserToContacts(newProfile, lists, contactId);
};

export const getContactIdByEmail = async (email: string) => {
  if (!email || !email.trim()) {
    return null;
  }
  const request = {
    method: 'POST' as HttpMethod,
    url: '/v3/marketing/contacts/search',
    body: { query: `email = '${email}'` },
  };
  const [, body] = await client.request(request);

  return body && body.result && body.result.length ? body.result[0].id : null;
};
