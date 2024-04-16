import type {ActionFunction} from '@shopify/remix-oxygen';

export let action: ActionFunction = async ({request, context}) => {
  let {env} = context;
  const formData = await request.formData();
  let url = `${env.WEAVERSE_HOST}/api/public/mail`;
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.WEAVERSE_API_KEY,
    },
    body: JSON.stringify({
      // to: env.STORE_EMAIL,
      email: formData.get('email'),
      name: formData.get('name'),
      subject: `New message from ${formData.get('name')}`,
      message: formData.get('message'),
    }),
  });
  let resText = await res.text();
  return new Response(resText, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      'Content-Type': 'html/text',
    },
  });
};
