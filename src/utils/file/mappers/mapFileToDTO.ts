import { File, FileDTO, FileDTOShort } from "custom-types/File";

export default function mapFileToDTO(
  file: ({ id: string } & File) | null,
  variant: "long" | "short" = "long"
): FileDTO | FileDTOShort | null {
  if (!file) {
    return null;
  }

  const fileShort = {
    id: file.id,
    name: file.name,
    size: file.size,
    mimetype: file.mimetype,
    ...(file.escrowFileStatus && { escrowFileStatus: file.escrowFileStatus }),
  };

  if (variant === "short") {
    return fileShort;
  }

  return {
    ...fileShort,
    ownerIds: file.ownerIds,
    createdAt: file.createdAt,
    fileTransactionHash: file.fileTransactionHash,
    encryptedIvBase64: file.encryptedIvBase64,
    encryptedAesKeys: file.encryptedAesKeys,
    senderPublicKeyHex: file.senderPublicKeyHex,

    ...(file.sharedKey && { sharedKey: file.sharedKey }),
  };
}
