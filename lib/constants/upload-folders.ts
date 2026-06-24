import { PERMISSIONS, type Permission } from "@/lib/constants/permissions";

export const UPLOAD_FOLDERS = ["students", "partners", "settings", "lenders"] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const UPLOAD_FOLDER_PERMISSIONS: Record<UploadFolder, Permission> = {
  students: PERMISSIONS.STUDENTS_WRITE,
  partners: PERMISSIONS.PARTNERS_WRITE,
  settings: PERMISSIONS.SETTINGS_WRITE,
  lenders: PERMISSIONS.STUDENTS_WRITE,
};

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}
