import {
  DelegateData,
  delegateConversation,
  delegateMessages,
} from "./helpers";

type DelegateChatData = DelegateData;

export default async function delegateChat({
  delegatorId,
  delegateeId,
  conversationId,
}: DelegateChatData) {
  const { result: resultDelegateConversation, delegatedConversation } =
    await delegateConversation({
      delegatorId,
      delegateeId,
      conversationId,
    });

  const { result: resultDelegateMessages } = await delegateMessages({
    delegatorId,
    delegateeId,
    conversationId,
  });

  if (!resultDelegateConversation) {
    throw new Error("Something went wrong with delegating conversation");
  }

  if (!resultDelegateMessages) {
    throw new Error("Something went wrong with delegating messages");
  }

  return { delegatedConversation };
}
