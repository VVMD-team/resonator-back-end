import { Notification } from "custom-types/Notification";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export default function mapNotificationDoc(
  doc: QueryDocumentSnapshot
): Notification & { id: string } {
  const notification = doc.data() as Notification;

  return { ...notification, id: doc.id };
}
