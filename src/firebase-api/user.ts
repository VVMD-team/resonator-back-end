import { db } from "../config/firebase";
import { COLLECTIONS } from "../enums";
import { User } from "../custom-types/User";

export const createUser = async (user: User, uid: string) => {
  try {
    await db.collection(COLLECTIONS.users).doc(uid).set(user);
  } catch (error) {
    throw new Error(`Something went wrong with creating user. Error: ${error}`);
  }
};

export const getUserById = async (
  id: string
): Promise<(User & { id: string }) | null> => {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(id).get();
    if (userDoc.exists) {
      const userData = userDoc.data() as User;
      return { ...userData, id: userDoc.id };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Something went wrong with getting user. Error: ${error}`);
  }
};

export const getUserByPublicKey = async (publicKey: string) => {
  try {
    const userQuery = await db
      .collection(COLLECTIONS.users)
      .where("wallet.publicKey", "==", publicKey.toLowerCase())
      .get();

    if (userQuery.empty) {
      console.error("Can not find user by wallet.publicKey: ", publicKey);
      throw new Error("User with this wallet adress does not exist");
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();
    return { ...user, id: userDoc.id } as User & { id: string };
  } catch (error) {
    throw new Error(
      `Something went wrong with getting user by wallet. Error: ${error}`
    );
  }
};

export const setBoxToUser = async (boxId: string, userId: string) => {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    const updatedBoxIds = [...(userData?.boxIds || []), boxId].filter(
      (id, index, arr) => arr.indexOf(id) === index
    );

    await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ boxIds: updatedBoxIds });

    return { ...userData, boxIds: updatedBoxIds };
  } catch (error) {
    throw new Error(`Failed to add box to user. Error: ${error}`);
  }
};

export const deleteBoxIdFromUser = async (boxId: string, userId: string) => {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    const updatedBoxIds = (userData?.boxIds || []).filter(
      (id: string) => id !== boxId
    );

    await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ boxIds: updatedBoxIds });

    return true;
  } catch (error) {
    throw new Error(`Failed to update user box IDs. Error: ${error}`);
  }
};

export const calculateTotalSize = async (userId: string) => {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();

    if (!userDoc.exists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userData = userDoc.data();
    const boxIds = userData?.boxIds || [];

    if (boxIds.length === 0) {
      return 0;
    }

    const boxDocs = await Promise.all(
      boxIds.map((boxId: string) =>
        db.collection(COLLECTIONS.boxes).doc(boxId).get()
      )
    );

    const totalSize = boxDocs.reduce((sum, boxDoc) => {
      if (boxDoc.exists) {
        const boxData = boxDoc.data();
        return sum + (boxData.size || 0);
      }
      return sum;
    }, 0);

    return totalSize;
  } catch (error) {
    throw new Error(
      `Something went wrong with calculating total size. Error: ${error}`
    );
  }
};

export const setEscrowToUser = async (escrowId: string, userId: string) => {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    const updatedEscrowIds = [...(userData?.escrowIds || []), escrowId].filter(
      (id, index, arr) => arr.indexOf(id) === index
    );

    await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ escrowIds: updatedEscrowIds });

    return { ...userData, escrowIds: updatedEscrowIds };
  } catch (error) {
    throw new Error(`Failed to add escrow to user. Error: ${error}`);
  }
};
