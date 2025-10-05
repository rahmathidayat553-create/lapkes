
export enum Gender {
  Male = 'Laki-Laki',
  Female = 'Perempuan',
}

export enum TeacherStatus {
  ASN = 'ASN',
  NonASN = 'NON-ASN',
}

export enum SchoolLevel {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA',
  SMK = 'SMK',
}

export enum SchoolDays {
  Five = '5 Hari',
  Six = '6 Hari',
}

export enum CalendarStatus {
  Holiday = 'Libur',
  Ineffective = 'Tidak Efektif',
  Active = 'Aktif'
}

export enum StudentStatus {
  New = 'Siswa Baru',
  Transfer = 'Siswa Pindahan',
  Inactive = 'Keluar/Pindah'
}

export enum AttendanceStatus {
  Hadir = 'H',
  Sakit = 'S',
  Ijin = 'I',
  Alpa = 'A',
}

export enum TransferReason {
    Pindah = 'Pindah Sekolah',
    Keluar = 'Keluar',
}

export interface User {
  id: number;
  name: string;
  username: string;
  password?: string; // Should not be stored in frontend state in a real app
}

export interface School {
  id: number;
  npsn: string;
  name: string;
  level: SchoolLevel;
  headmaster: string;
  viceHeadmaster: string;
  address: string;
  logo: string;
  format: SchoolDays;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  status: CalendarStatus;
  description?: string;
}

export interface Teacher {
  id: number;
  name: string;
  gender: Gender;
  status: TeacherStatus;
  nip?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
}

export interface Class {
  id: number;
  code: string;
  name: string;
  homeroomTeacherId: number;
}

export interface SubjectTeacher {
    id: number;
    teacherId: number;
    subjectId: number;
    classId: number;
    meetings: number;
}

export interface Student {
  id: number;
  nisn: string;
  name: string;
  gender: Gender;
  status: StudentStatus;
  entryDate: string;
  exitDate?: string;
  photo?: string;
  whatsapp?: string;
  classId: number;
}

export interface StudentAttendance {
    id: number;
    studentId: number;
    date: string;
    meeting: number;
    status: AttendanceStatus;
}

export interface TeacherAttendance {
    id: number;
    teacherId: number;
    subjectId: number;
    classId: number;
    date: string;
    meetings: number;
}

export interface StudentTransfer {
    id: number;
    studentId: number;
    exitDate: string;
    reason: TransferReason;
    notes?: string;
}
