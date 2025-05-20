export type EvolutionData = {
  event: "messages.upsert";
  instance: string;
  data: MessageData;
  destination: string;
  date_time: string; // ISO 8601 timestamp
  sender: string;
  server_url: string;
  apikey: string;
};

type MessageData = {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  pushName: string;
  status: string;
  message: MessageContent;
  contextInfo?: ContextInfo;
  messageType: "conversation" | "imageMessage" | "audioMessage";
  messageTimestamp: number;
  instanceId: string;
  source: string;
};

type MessageContent = {
  conversation?: string;
  imageMessage?: ImageMessage;
  audioMessage?: AudioMessage;
  messageContextInfo: MessageContextInfo;
  base64?: string;
};

type MessageContextInfo = {
  deviceListMetadata: {
    senderKeyHash: string;
    senderTimestamp: string;
    recipientKeyHash: string;
    recipientTimestamp: string;
  };
  deviceListMetadataVersion: number;
  messageSecret: string;
};

type ImageMessage = {
  url: string;
  mimetype: string;
  fileSha256: string;
  fileLength: string;
  height: number;
  width: number;
  mediaKey: string;
  fileEncSha256: string;
  directPath: string;
  mediaKeyTimestamp: string;
  jpegThumbnail: string;
  scansSidecar?: string;
  scanLengths?: number[];
  midQualityFileSha256?: string;
  contextInfo: Record<string, unknown>;
};

type AudioMessage = {
  url: string;
  mimetype: string;
  fileSha256: string;
  fileLength: string;
  seconds: number;
  ptt: boolean;
  mediaKey: string;
  fileEncSha256: string;
  directPath: string;
  mediaKeyTimestamp: string;
  waveform?: string;
};

type ContextInfo = {
  stanzaId: string;
  participant: string;
  quotedMessage: {
    conversation?: string;
  };
};
