// src/lib/whatsapp/client.ts
export type WhatsappButton = {
  id: string;
  title: string;
};

type WhatsappMediaInfo = {
  url: string;
  mime_type?: string;
};

function getWhatsappConfig() {
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID atau WHATSAPP_ACCESS_TOKEN belum diset');
  }

  return {
    endpoint: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    accessToken,
  };
}

async function postWhatsapp(payload: Record<string, unknown>) {
  const { endpoint, accessToken } = getWhatsappConfig();

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      ...payload,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gagal mengirim pesan WhatsApp: ${res.status} ${detail}`);
  }

  return res.json().catch(() => null);
}

export async function sendWhatsappText(to: string, body: string) {
  return postWhatsapp({
    to,
    type: 'text',
    text: {
      preview_url: false,
      body,
    },
  });
}

export async function sendWhatsappButtons({
  to,
  body,
  buttons,
}: {
  to: string;
  body: string;
  buttons: WhatsappButton[];
}) {
  const usableButtons = buttons.slice(0, 3);

  return postWhatsapp({
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: usableButtons.map((button) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title.slice(0, 20),
          },
        })),
      },
    },
  });
}

export async function getWhatsappMediaUrl(mediaId: string): Promise<WhatsappMediaInfo> {
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN belum diset');
  }

  const res = await fetch(`https://graph.facebook.com/${version}/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gagal mengambil URL media WhatsApp: ${res.status} ${detail}`);
  }

  const data = (await res.json()) as Partial<WhatsappMediaInfo>;
  if (!data.url) {
    throw new Error('URL media WhatsApp tidak tersedia');
  }

  return {
    url: data.url,
    mime_type: data.mime_type,
  };
}

export async function downloadWhatsappMedia(mediaId: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN belum diset');
  }

  const media = await getWhatsappMediaUrl(mediaId);
  const res = await fetch(media.url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gagal download media WhatsApp: ${res.status} ${detail}`);
  }

  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: media.mime_type || res.headers.get('content-type') || 'image/jpeg',
  };
}
