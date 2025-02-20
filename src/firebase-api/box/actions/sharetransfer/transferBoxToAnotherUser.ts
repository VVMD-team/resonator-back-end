import {
  createNewBoxForAnotherUser,
  CreateNewBoxForAnotherUserActions,
  ShareTransferParams,
} from "./createNewBoxForAnotherUser";

export default async function transferBoxToAnotherUser(
  params: ShareTransferParams
) {
  await createNewBoxForAnotherUser(
    params,
    CreateNewBoxForAnotherUserActions.transfer
  );
}
