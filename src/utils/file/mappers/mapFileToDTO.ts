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
    createdAt: file.createdAt,
    fileTransactionHash: file.fileTransactionHash,
    ...(file.sharedKey && { sharedKey: file.sharedKey }),
  };
}
