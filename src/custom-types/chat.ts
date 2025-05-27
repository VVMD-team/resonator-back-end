import { Timestamp } from "firebase-admin/firestore";

export type ConversationID = string & { __brand: "ConversationID" };
export type ParticipantID = string & { __brand: "ParticipantID" };

export enum MessageType {
  TEXT = "TEXT",
}

export type Message = {
  id: string;
  conversationId: ConversationID;
  type: MessageType;
  senderWalletAddress: string; // user's id
  content: string;

  readBy: ParticipantID[];

  createdAt: Timestamp;
};

export type ConversationShort = {
  id: ConversationID;
  updatedAt: Timestamp;
  title?: string;
};

export type Conversation = ConversationShort & {
  creatorId: ParticipantID;
  participantIds: ParticipantID[];

  lastMessageAt?: Timestamp;
  lastMessageText?: string;
  deleteAt: Timestamp | null;

  createdAt: Timestamp;
};
