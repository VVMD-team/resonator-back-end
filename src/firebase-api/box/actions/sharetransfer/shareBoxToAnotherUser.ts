import {
  createNewBoxForAnotherUser,
  CreateNewBoxForAnotherUserActions,
  ShareTransferParams,
} from "./createNewBoxForAnotherUser";

export default async function shareBoxToAnotherUser(
  params: ShareTransferParams
) {
  await createNewBoxForAnotherUser(
    params,
    CreateNewBoxForAnotherUserActions.share
  );
}
