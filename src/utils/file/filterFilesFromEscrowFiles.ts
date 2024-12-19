import { File } from "custom-types/File";

const filterFilesFromEscrowFiles = (file: File) => !file.escrowFileStatus;

export default filterFilesFromEscrowFiles;
