import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import {
  APPLICATION_KEY,
  NOTION_API_KEY,
  CHANNELS,
  NOTION_DATABASE_ID,
} from './secret.js';

const jsonHeader = { headers: { 'content-type': 'application/json' } };

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const signature = request.headers.get('X-Signature-Ed25519') || '';
  const timestamp = request.headers.get('X-Signature-Timestamp') || '';
  const rawBody = (await request.text()) || '';

  try {
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(APPLICATION_KEY, 'hex'),
    );

    if (!isVerified) {
      throw new Error();
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid request signature' }),
      {
        status: 401,
        ...jsonHeader,
      },
    );
  }

  const body = JSON.parse(rawBody);

  if (body.type === 1) {
    //PINGPONG
    return new Response(JSON.stringify({ type: 1 }), jsonHeader);
  }

  if (!CHANNELS.includes(body.channel_id))
    return new Response(
      JSON.stringify({
        type: 4,
        data: {
          content: `du kannst hier keine zitate erstellen`,
          flags: 1 << 6,
        },
      }),
      jsonHeader,
    );

  await saveToNotion(body);

  return new Response(
    JSON.stringify({
      type: 4,
      data: {
        embeds: [
          {
            author: { name: body.data.options[0].value }, //typ
            title: body.data.options[1].value, //person
            description: `"${body.data.options[2].value}"`, //zitat
          },
        ],
      },
    }),
    jsonHeader,
  );
}

async function saveToNotion(body) {
  await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      'notion-version': '2021-08-16',
      authorization: `Bearer ${NOTION_API_KEY}`,
    }),
    body: JSON.stringify({
      parent: {
        database_id: NOTION_DATABASE_ID,
      },
      properties: {
        Typ: {
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: body.data.options[0].value,
              },
            },
          ],
        },
        Person: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: body.data.options[1].value,
              },
            },
          ],
        },
        Zitat: {
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: `"${body.data.options[2].value}"`,
              },
            },
          ],
        },
      },
    }),
  });
}
