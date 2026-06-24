// src/lib/whatsapp/payload.ts
export type ParsedWhatsappMessage = {
  id: string;
  from: string;
  displayName?: string | null;
  type: 'text' | 'image' | 'interactive' | 'unknown';
  text?: string | null;
  mediaId?: string | null;
  mimeType?: string | null;
};

type AnyRecord = Record<string, any>;

export function parseWhatsappMessages(payload: AnyRecord): ParsedWhatsappMessage[] {
  const result: ParsedWhatsappMessage[] = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contacts = value.contacts || [];
      const contactByWaId = new Map<string, AnyRecord>();

      for (const contact of contacts) {
        if (contact.wa_id) contactByWaId.set(contact.wa_id, contact);
      }

      for (const message of value.messages || []) {
        const from = message.from;
        const contact = contactByWaId.get(from);
        const displayName = contact?.profile?.name || null;

        if (message.type === 'text') {
          result.push({
            id: message.id,
            from,
            displayName,
            type: 'text',
            text: message.text?.body || '',
          });
          continue;
        }

        if (message.type === 'image') {
          result.push({
            id: message.id,
            from,
            displayName,
            type: 'image',
            text: message.image?.caption || '',
            mediaId: message.image?.id || null,
            mimeType: message.image?.mime_type || null,
          });
          continue;
        }

        if (message.type === 'interactive') {
          const interactive = message.interactive || {};
          const button = interactive.button_reply;
          const list = interactive.list_reply;

          result.push({
            id: message.id,
            from,
            displayName,
            type: 'interactive',
            text: button?.id || list?.id || button?.title || list?.title || '',
          });
          continue;
        }

        result.push({
          id: message.id,
          from,
          displayName,
          type: 'unknown',
        });
      }
    }
  }

  return result;
}
