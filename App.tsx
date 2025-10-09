import React, { useState, useCallback, useMemo, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import type { School, Teacher, Subject, Class, Student, User, CalendarEvent, StudentTransfer, SubjectTeacher, StudentAttendance, TeacherAttendance } from './types';
import { SchoolLevel, SchoolDays, TeacherStatus, Gender, StudentStatus, TransferReason, CalendarStatus, AttendanceStatus } from './types';

// --- MOCK DATA ---
const initialSchoolData: School = {
    id: 1,
    npsn: '12345678',
    name: 'SMK Negeri 1 Codeville',
    level: SchoolLevel.SMK,
    headmaster: 'Dr. John Doe',
    viceHeadmaster: 'Jane Smith, M.Pd.',
    address: 'Jl. Raya Koding No. 404, Jakarta',
    logo: 'https://picsum.photos/100',
    format: SchoolDays.Five,
};

const initialTeachers: Teacher[] = [
    { id: 1, name: 'Budi Santoso', gender: Gender.Male, status: TeacherStatus.ASN, nip: '198001012010011001' },
    { id: 2, name: 'Citra Lestari', gender: Gender.Female, status: TeacherStatus.NonASN },
    { id: 3, name: 'Agus Wijaya', gender: Gender.Male, status: TeacherStatus.ASN, nip: '198505052015031002' },
];

const initialSubjects: Subject[] = [
    { id: 1, code: 'MTK-01', name: 'Matematika' },
    { id: 2, code: 'FIS-01', name: 'Fisika' },
    { id: 3, code: 'BIO-01', name: 'Biologi' },
];

const initialClasses: Class[] = [
    { id: 1, code: 'X-RPL', name: 'X Rekayasa Perangkat Lunak', homeroomTeacherId: 1 },
    { id: 2, code: 'XI-TJKT', name: 'XI TJKT 1', homeroomTeacherId: 2 },
];

const initialSubjectTeachers: SubjectTeacher[] = [
    { id: 1, teacherId: 1, subjectId: 1, classId: 1, meetings: 4 },
    { id: 2, teacherId: 2, subjectId: 2, classId: 1, meetings: 3 },
    { id: 3, teacherId: 3, subjectId: 3, classId: 2, meetings: 3 },
    { id: 4, teacherId: 1, subjectId: 1, classId: 2, meetings: 4 },
];

const initialStudentTransfers: StudentTransfer[] = [
    { id: 1, studentId: 1, exitDate: '2024-06-20', reason: TransferReason.Pindah, notes: 'Pindah ke sekolah lain di luar kota.' }
];

const initialStudents: Student[] = [
    { id: 1, nisn: '001', name: 'Andi', gender: Gender.Male, status: StudentStatus.Inactive, entryDate: '2023-07-15', exitDate: '2024-06-20', classId: 2, photo: 'https://picsum.photos/seed/andi/100' },
    { id: 2, nisn: '002', name: 'Budi', gender: Gender.Male, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2, photo: 'https://picsum.photos/seed/budi/100' },
    { id: 3, nisn: '003', name: 'Hasan', gender: Gender.Male, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2 },
    { id: 4, nisn: '004', name: 'Nurdi', gender: Gender.Male, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2 },
    { id: 5, nisn: '005', name: 'Isma', gender: Gender.Female, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2 },
    { id: 6, nisn: '006', name: 'Nina', gender: Gender.Female, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2 },
    { id: 7, nisn: '007', name: 'Ani', gender: Gender.Female, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2 },
    { id: 8, nisn: '008', name: 'Siti', gender: Gender.Female, status: StudentStatus.New, entryDate: '2023-07-15', classId: 1 },
];

const initialUsers: User[] = [
    { id: 1, name: 'Rahmat', username: 'admin' },
    { id: 2, name: 'Guru Contoh', username: 'guru' },
];

const initialCalendarEvents: CalendarEvent[] = [
    { id: 1, date: '2024-07-01', title: 'Awal Tahun Ajaran Baru', status: CalendarStatus.Active, description: 'Hari pertama masuk sekolah.' },
    { id: 2, date: '2024-08-17', title: 'Hari Kemerdekaan RI', status: CalendarStatus.Holiday },
    { id: 3, date: '2024-09-16', title: 'Penilaian Tengah Semester (PTS)', status: CalendarStatus.Ineffective, description: 'Minggu pelaksanaan PTS ganjil.' },
    { id: 4, date: '2024-12-25', title: 'Hari Raya Natal', status: CalendarStatus.Holiday },
];

const getISODate = (dayOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
};

const initialStudentAttendance: StudentAttendance[] = [
    // Class 2 (XI TJKT 1) - Today and recent
    { id: 1, studentId: 2, date: getISODate(-2), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 2, studentId: 3, date: getISODate(-2), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 3, studentId: 4, date: getISODate(-2), meeting: 1, status: AttendanceStatus.Sakit },
    { id: 4, studentId: 2, date: getISODate(-1), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 5, studentId: 3, date: getISODate(-1), meeting: 1, status: AttendanceStatus.Ijin },
    { id: 6, studentId: 4, date: getISODate(-1), meeting: 1, status: AttendanceStatus.Hadir },
    // A few weeks ago
    { id: 7, studentId: 2, date: getISODate(-14), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 8, studentId: 3, date: getISODate(-14), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 9, studentId: 4, date: getISODate(-14), meeting: 1, status: AttendanceStatus.Alpa },
    // Class 1 (X RPL)
    { id: 10, studentId: 8, date: getISODate(-8), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 11, studentId: 8, date: getISODate(-7), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 12, studentId: 8, date: getISODate(-6), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 13, studentId: 8, date: getISODate(-5), meeting: 1, status: AttendanceStatus.Hadir },
    { id: 14, studentId: 8, date: getISODate(-4), meeting: 1, status: AttendanceStatus.Hadir },
    // Previous month
    { id: 15, studentId: 2, date: getISODate(-35), meeting: 1, status: AttendanceStatus.Hadir },
];

const initialTeacherAttendance: TeacherAttendance[] = [
    // Teacher 1 (Budi) - Teaches Math in both classes (8 meetings/week)
    { id: 1, teacherId: 1, subjectId: 1, classId: 1, date: getISODate(-8), meetings: 4 }, // a week ago
    { id: 2, teacherId: 1, subjectId: 1, classId: 2, date: getISODate(-8), meetings: 4 },
    { id: 3, teacherId: 1, subjectId: 1, classId: 1, date: getISODate(-1), meetings: 4 }, // this week
    { id: 4, teacherId: 1, subjectId: 1, classId: 2, date: getISODate(-1), meetings: 3 }, // Missed 1 meeting this week

    // Teacher 2 (Citra) - Teaches Physics (3 meetings/week)
    { id: 5, teacherId: 2, subjectId: 2, classId: 1, date: getISODate(-9), meetings: 3 },
    { id: 6, teacherId: 2, subjectId: 2, classId: 1, date: getISODate(-2), meetings: 3 },

    // Teacher 3 (Agus) - Teaches Biology (3 meetings/week)
    { id: 7, teacherId: 3, subjectId: 3, classId: 2, date: getISODate(-15), meetings: 3 }, // 2 weeks ago
    // Agus was absent last week
    { id: 8, teacherId: 3, subjectId: 3, classId: 2, date: getISODate(0), meetings: 3 }, // present today
];


// --- ICONS (Heroicons SVG paths) ---
const ICONS = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h-1.5m-15 0v11.25A2.25 2.25 0 006 16.5h2.25m0-13.5h12M12 12.75a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H12zm0 2.25a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H12zM12 18a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H12zm2.25-4.5a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H14.25zM14.25 18a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H14.25zM16.5 12.75a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H16.5zM18.75 18a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H18.75zM18.75 12.75a.75.75 0 000-1.5h.008a.75.75 0 000 1.5H18.75z" />,
  school: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h27" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  book: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  student: <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-2.072-1.036A49.92 49.92 0 003 13.179M21 13.179a49.92 49.92 0 00-2.192-2.998l-2.072 1.036m-1.631 0c.21.35.394.71.549 1.082" />,
  clipboard: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5v-1.5h-1.5v1.5z" />,
  logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />,
  sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M3 12H.75m4.243-4.95l1.59-1.59M12 6.75A5.25 5.25 0 006.75 12a5.25 5.25 0 005.25 5.25a5.25 5.25 0 005.25-5.25A5.25 5.25 0 0012 6.75z" />,
  moon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
  plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  pencil: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
  trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
};

// FIX: Changed prop types to use React.PropsWithChildren to resolve errors about missing 'children' prop.
type IconProps = React.PropsWithChildren<{}>;
function Icon({ children }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {children}
        </svg>
    );
}

// --- THEME CONTEXT ---
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void; }>({
    theme: 'dark',
    toggleTheme: () => {},
});

// FIX: Changed prop types to use React.PropsWithChildren to resolve errors about missing 'children' prop.
type ThemeProviderProps = React.PropsWithChildren<{}>;
function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

const useTheme = () => useContext(ThemeContext);


// --- AUTH CONTEXT ---
const AuthContext = createContext<{ isAuthenticated: boolean; login: (user: string, pass: string) => boolean; logout: () => void; }>({
    isAuthenticated: false,
    login: () => false,
    logout: () => {},
});

// FIX: Changed prop types to use React.PropsWithChildren to resolve errors about missing 'children' prop.
type AuthProviderProps = React.PropsWithChildren<{}>;
function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = (user: string, pass: string) => {
        if (user === 'admin' && pass === 'password123') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };
    
    const logout = () => {
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

const useAuth = () => useContext(AuthContext);

// --- COMPONENTS ---

// A reusable and accessible modal component
type ModalProps = React.PropsWithChildren<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    title: string;
    maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl';
}>;

function Modal({ isOpen, onClose, onSave, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Focus trapping
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            firstElement.focus();

            const handleTabKey = (event: KeyboardEvent) => {
                if (event.key === 'Tab') {
                    if (event.shiftKey) {
                        if (document.activeElement === firstElement) {
                            event.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            event.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };
            
            const currentModalRef = modalRef.current;
            currentModalRef.addEventListener('keydown', handleTabKey);

            return () => {
                if (currentModalRef) {
                    currentModalRef.removeEventListener('keydown', handleTabKey);
                }
            };
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={onSave} className="flex flex-col h-full">
                    <div className="p-6">
                         <h3 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                    </div>
                    <div className="p-6 pt-0 overflow-y-auto flex-grow">
                        {children}
                    </div>
                    <div className="p-6 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">
                            Batal
                        </button>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// A reusable and accessible success modal component
type SuccessModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
};

function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            closeButtonRef.current.focus();
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
         <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-300" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 id="success-modal-title" className="text-lg font-bold my-3 text-gray-900 dark:text-gray-100">
                   {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                   {message}
                </p>
                <div className="mt-6 flex justify-center">
                    <button
                        ref={closeButtonRef}
                        type="button" 
                        onClick={onClose} 
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-primary-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <Icon>
                {theme === 'light' ? ICONS.moon : ICONS.sun}
            </Icon>
        </button>
    );
}

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = (to: string) => { window.location.hash = to; };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(username, password)) {
            navigate('/');
        } else {
            setError('Username atau password salah.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">LAPKES</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Laporan Kesiswaan</p>
                <form onSubmit={handleLogin}>
                    {error && <p className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded mb-4 text-sm">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                            placeholder="admin"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                            placeholder="password123"
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { path: '/', name: 'Dashboard', icon: ICONS.dashboard },
        { path: '/identitas-sekolah', name: 'Identitas Sekolah', icon: ICONS.school },
        { path: '/kalender-pendidikan', name: 'Kalender Pendidikan', icon: ICONS.calendar },
        { path: '/guru', name: 'Data Guru', icon: ICONS.users },
        { path: '/mapel', name: 'Data Mata Pelajaran', icon: ICONS.book },
        { path: '/pengajar-mapel', name: 'Data Pengajar Mapel', icon: ICONS.users },
        { path: '/siswa', name: 'Data Siswa', icon: ICONS.student },
        { path: '/kelas', name: 'Data Kelas', icon: ICONS.school },
        { path: '/input-kehadiran', name: 'Input Kehadiran', icon: ICONS.clipboard },
        { path: '/rekap-kehadiran-siswa', name: 'Rekap Kehadiran Siswa', icon: ICONS.clipboard },
        { path: '/rekap-kehadiran-guru', name: 'Rekap Kehadiran Guru', icon: ICONS.clipboard },
        { path: '/mutasi-siswa', name: 'Data Mutasi Siswa', icon: ICONS.student },
        { path: '/manajemen-pengguna', name: 'Manajemen Pengguna', icon: ICONS.users },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
            <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700 dark:border-gray-800">
                LAPKES
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive(item.path) ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <Icon>{item.icon}</Icon>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="px-4 py-4 border-t border-gray-700 dark:border-gray-800">
                 <button onClick={logout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-red-600 hover:text-white">
                    <Icon>{ICONS.logout}</Icon>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const Header = () => {
    const location = useLocation();
    const pageTitle = location.pathname.replace(/\//g, ' ').replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim() || 'Dashboard';
    
    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{pageTitle}</h1>
            <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                <span className="text-gray-600 dark:text-gray-300">Selamat datang, Admin!</span>
                <img className="h-10 w-10 rounded-full object-cover" src="https://picsum.photos/100" alt="Admin"/>
            </div>
        </header>
    );
};

// FIX: Changed prop types to use React.PropsWithChildren to resolve errors about missing 'children' prop.
type LayoutProps = React.PropsWithChildren<{}>;
function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

const DashboardPage = ({ students, teachers, classes }: { students: Student[]; teachers: Teacher[]; classes: Class[]; }) => {
    const activeStudentCount = useMemo(() => students.filter(s => s.status !== StudentStatus.Inactive).length, [students]);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Siswa Aktif</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{activeStudentCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Guru</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{teachers.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Kelas</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{classes.length}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Kehadiran Hari Ini</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">95%</p>
                </div>
            </div>
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Selamat Datang di Aplikasi LAPKES</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Aplikasi Laporan Kesiswaan (LAPKES) membantu Anda mengelola data sekolah, siswa, guru, dan kehadiran dengan mudah dan efisien. Gunakan menu di sebelah kiri untuk navigasi.
                </p>
            </div>
        </div>
    );
};

const SchoolIdentityPage = () => {
    const [school, setSchool] = useState(initialSchoolData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setSchool({ ...school, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Data sekolah berhasil diperbarui!');
        // In real app, you would save this to a backend.
    };
    
    const formInputClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NPSN</label>
                        <input type="text" name="npsn" value={school.npsn} onChange={handleChange} className={formInputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Sekolah</label>
                        <input type="text" name="name" value={school.name} onChange={handleChange} className={formInputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenjang</label>
                        <select name="level" value={school.level} onChange={handleChange} className={formInputClass}>
                            {Object.values(SchoolLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kepala Sekolah</label>
                        <input type="text" name="headmaster" value={school.headmaster} onChange={handleChange} className={formInputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Wakasek Kesiswaan</label>
                        <input type="text" name="viceHeadmaster" value={school.viceHeadmaster} onChange={handleChange} className={formInputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Format Hari Sekolah</label>
                        <select name="format" value={school.format} onChange={handleChange} className={formInputClass}>
                           {Object.values(SchoolDays).map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</label>
                        <textarea name="address" value={school.address} onChange={handleChange} rows={3} className={formInputClass}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <img src={school.logo} alt="Logo Sekolah" className="h-16 w-16 rounded-full" />
                            <input type="file" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

const CalendarManagementPage = () => {
    const [events, setEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentEvent, setCurrentEvent] = useState<Partial<CalendarEvent>>({});

    const openModal = (mode: 'add' | 'edit', event: CalendarEvent | null = null) => {
        setModalMode(mode);
        setCurrentEvent(event || { 
            date: new Date().toISOString().split('T')[0], 
            title: '', 
            status: CalendarStatus.Active,
            description: '' 
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentEvent({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentEvent.date || !currentEvent.title || !currentEvent.status) {
            alert("Harap isi semua field yang wajib diisi.");
            return;
        }

        if (modalMode === 'add') {
            setEvents([...events, { ...currentEvent, id: Date.now() } as CalendarEvent]);
        } else {
            setEvents(events.map(ev => ev.id === currentEvent.id ? { ...ev, ...currentEvent } : ev));
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus acara ini?")) {
            setEvents(events.filter(e => e.id !== id));
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentEvent({ ...currentEvent, [name]: value });
    };

    const getStatusBadge = (status: CalendarStatus) => {
        const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        switch (status) {
            case CalendarStatus.Holiday:
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200`;
            case CalendarStatus.Ineffective:
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200`;
            case CalendarStatus.Active:
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200`;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Kalender Pendidikan</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Tambah Acara</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Acara</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {events.map((event, index) => (
                            <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{event.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <span className={getStatusBadge(event.status)}>{event.status}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{event.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', event)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                       <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Acara Baru' : 'Edit Acara'}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                        <input type="date" name="date" value={currentEvent.date || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Acara</label>
                        <input type="text" name="title" value={currentEvent.title || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select name="status" value={currentEvent.status || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(CalendarStatus).map(s => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan (Opsional)</label>
                        <textarea name="description" value={currentEvent.description || ''} onChange={handleFormChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// --- Pagination Component ---
type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-between mt-4 py-3">
             <div className="flex-1 flex justify-between sm:hidden">
                 <button onClick={handlePrevious} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Previous
                </button>
                <button onClick={handleNext} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end">
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                         <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span aria-current="page" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Next</span>
                             <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

const SubjectManagementPage = ({ subjects, setSubjects }: { subjects: Subject[], setSubjects: React.Dispatch<React.SetStateAction<Subject[]>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const paginatedSubjects = useMemo(() => {
        return subjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [subjects, currentPage]);
    const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);

    const openModal = (mode: 'add' | 'edit', subject: Subject | null = null) => {
        setModalMode(mode);
        setCurrentSubject(subject || { code: '', name: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentSubject({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSubject.code || !currentSubject.name) {
            alert("Harap isi semua field.");
            return;
        }

        if (modalMode === 'add') {
            setSubjects([...subjects, { ...currentSubject, id: Date.now() } as Subject]);
        } else {
            setSubjects(subjects.map(s => s.id === currentSubject.id ? { ...s, ...currentSubject } : s));
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) {
            setSubjects(subjects.filter(s => s.id !== id));
            if (paginatedSubjects.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentSubject({ ...currentSubject, [name]: value });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Mata Pelajaran</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Tambah Mapel</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kode Mapel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Mapel</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedSubjects.map((subject, index) => (
                            <tr key={subject.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{subject.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{subject.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', subject)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                       <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Mata Pelajaran</label>
                        <input type="text" name="code" value={currentSubject.code || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Mata Pelajaran</label>
                        <input type="text" name="name" value={currentSubject.name || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const SubjectTeacherManagementPage = ({
    assignments,
    setAssignments,
    teachers,
    subjects,
    classes,
}: {
    assignments: SubjectTeacher[];
    setAssignments: React.Dispatch<React.SetStateAction<SubjectTeacher[]>>;
    teachers: Teacher[];
    subjects: Subject[];
    classes: Class[];
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentAssignment, setCurrentAssignment] = useState<Partial<SubjectTeacher>>({});

    const openModal = (mode: 'add' | 'edit', assignment: SubjectTeacher | null = null) => {
        setModalMode(mode);
        setCurrentAssignment(
            assignment || {
                teacherId: teachers[0]?.id,
                subjectId: subjects[0]?.id,
                classId: classes[0]?.id,
                meetings: 1,
            }
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAssignment({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentAssignment.teacherId || !currentAssignment.subjectId || !currentAssignment.classId || !currentAssignment.meetings) {
            alert('Harap isi semua field.');
            return;
        }

        if (modalMode === 'add') {
            const isDuplicate = assignments.some(
                a => a.teacherId === currentAssignment.teacherId &&
                     a.subjectId === currentAssignment.subjectId &&
                     a.classId === currentAssignment.classId
            );
            if (isDuplicate) {
                alert('Penugasan guru untuk mata pelajaran dan kelas ini sudah ada.');
                return;
            }
            setAssignments([...assignments, { ...currentAssignment, id: Date.now() } as SubjectTeacher]);
        } else {
            setAssignments(
                assignments.map(a => (a.id === currentAssignment.id ? { ...a, ...currentAssignment } : a))
            );
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data pengajar ini?')) {
            setAssignments(assignments.filter(a => a.id !== id));
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentAssignment({ ...currentAssignment, [name]: Number(value) });
    };

    const getTeacherName = (teacherId: number) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
    const getSubjectName = (subjectId: number) => subjects.find(s => s.id === subjectId)?.name || 'N/A';
    const getClassName = (classId: number) => classes.find(c => c.id === classId)?.name || 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Pengajar Mata Pelajaran</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Tambah Pengajar</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Guru</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mata Pelajaran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kelas</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jml Pertemuan/Minggu</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {assignments.map((assignment, index) => (
                            <tr key={assignment.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{getTeacherName(assignment.teacherId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getSubjectName(assignment.subjectId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getClassName(assignment.classId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">{assignment.meetings}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', assignment)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(assignment.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Pengajar Mapel' : 'Edit Pengajar Mapel'}
                maxWidth="max-w-md"
            >
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guru</label>
                        <select name="teacherId" value={currentAssignment.teacherId || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mata Pelajaran</label>
                        <select name="subjectId" value={currentAssignment.subjectId || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                        <select name="classId" value={currentAssignment.classId || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Pertemuan per Minggu</label>
                        <input type="number" name="meetings" min="1" value={currentAssignment.meetings || 1} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};


const ClassManagementPage = ({ classes, setClasses, teachers }: { classes: Class[], setClasses: React.Dispatch<React.SetStateAction<Class[]>>, teachers: Teacher[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentClass, setCurrentClass] = useState<Partial<Class>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const paginatedClasses = useMemo(() => {
        return classes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [classes, currentPage]);
    const totalPages = Math.ceil(classes.length / ITEMS_PER_PAGE);

    const openModal = (mode: 'add' | 'edit', cls: Class | null = null) => {
        setModalMode(mode);
        setCurrentClass(cls || { code: '', name: '', homeroomTeacherId: teachers[0]?.id });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentClass({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentClass.code || !currentClass.name || !currentClass.homeroomTeacherId) {
            alert("Harap isi semua field.");
            return;
        }

        if (modalMode === 'add') {
            setClasses([...classes, { ...currentClass, id: Date.now() } as Class]);
        } else {
            setClasses(classes.map(c => c.id === currentClass.id ? { ...c, ...currentClass } : c));
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
            setClasses(classes.filter(c => c.id !== id));
            if (paginatedClasses.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentClass({ ...currentClass, [name]: name === 'homeroomTeacherId' ? Number(value) : value });
    };

    const getTeacherName = (teacherId: number) => {
        return teachers.find(t => t.id === teacherId)?.name || 'N/A';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Kelas</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Tambah Kelas</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kode Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wali Kelas</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedClasses.map((cls, index) => (
                            <tr key={cls.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{cls.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{cls.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getTeacherName(cls.homeroomTeacherId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', cls)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                       <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Kelas Baru' : 'Edit Kelas'}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Kelas</label>
                        <input type="text" name="code" value={currentClass.code || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kelas</label>
                        <input type="text" name="name" value={currentClass.name || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wali Kelas</label>
                        <select name="homeroomTeacherId" value={currentClass.homeroomTeacherId || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const StudentAttendanceInputPage = ({ students, classes }: { students: Student[], classes: Class[] }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const studentsInClass = useMemo(() => {
        if (!selectedClassId) return [];
        return students.filter(s => s.classId === parseInt(selectedClassId, 10) && s.status !== StudentStatus.Inactive);
    }, [selectedClassId, students]);

    const initialAttendance = useMemo(() => {
        const att: { [key: number]: string } = {};
        studentsInClass.forEach(student => {
            att[student.id] = AttendanceStatus.Hadir;
        });
        return att;
    }, [studentsInClass]);

    const [attendance, setAttendance] = useState<{ [key: number]: string }>({});
    const [attendingTeachersCount, setAttendingTeachersCount] = useState(0);

    useEffect(() => {
        setAttendance(initialAttendance);
    }, [initialAttendance]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAttendanceDate(e.target.value);
        setSelectedClassId('');
        setAttendance({});
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClassId(e.target.value);
    };

    const handleAttendanceChange = (studentId: number, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const resetForm = () => {
        setAttendanceDate('');
        setSelectedClassId('');
        setAttendance({});
        setAttendingTeachersCount(0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            classId: selectedClassId,
            date: attendanceDate,
            studentAttendance: attendance,
            teacherAttendanceCount: attendingTeachersCount,
        });
        setIsSuccessModalOpen(true);
    };
    
    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        resetForm();
    };

    const formInputClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const selectedClassName = useMemo(() => classes.find(c => c.id === parseInt(selectedClassId, 10))?.name, [selectedClassId, classes]);

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold">1</span>
                        <span>Pilih Tanggal</span>
                    </h3>
                    <div className="max-w-xs">
                        <label htmlFor="attendanceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Kehadiran</label>
                        <input id="attendanceDate" type="date" value={attendanceDate} onChange={handleDateChange} className={`${formInputClass} dark:[color-scheme:dark]`} />
                    </div>
                </div>

                {attendanceDate && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center space-x-3">
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${selectedClassId ? 'bg-primary-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>2</span>
                            <span>Pilih Kelas</span>
                        </h3>
                        <div className="max-w-xs">
                            <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                            <select id="classSelect" onChange={handleClassChange} value={selectedClassId} className={formInputClass}>
                                <option value="" disabled>-- Pilih Kelas --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {selectedClassId && (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center space-x-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold">3</span>
                                <span>Input Kehadiran Siswa - {selectedClassName}</span>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Siswa</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Kehadiran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {studentsInClass.map((student, index) => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    <select
                                                        value={attendance[student.id] || AttendanceStatus.Hadir}
                                                        onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                                        className="block w-24 mx-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    >
                                                        {Object.values(AttendanceStatus).map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                             <h3 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center space-x-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold">4</span>
                                <span>Input Kehadiran Guru</span>
                            </h3>
                             <div className="mb-4 max-w-xs">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Guru Hadir</label>
                                <select value={attendingTeachersCount} onChange={(e) => setAttendingTeachersCount(Number(e.target.value))} className={formInputClass}>
                                    {Array.from({ length: 11 }, (_, i) => i).map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                             </div>
                        </div>
                         <div className="flex justify-end">
                            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200">
                                Simpan Kehadiran
                            </button>
                        </div>
                    </>
                )}
            </form>

            <SuccessModal 
                isOpen={isSuccessModalOpen}
                onClose={closeSuccessModal}
                title="Berhasil Disimpan"
                message="Data kehadiran telah berhasil disimpan."
            />
        </div>
    );
};


const TeacherManagementPage = ({ teachers, setTeachers }: { teachers: Teacher[], setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const paginatedTeachers = useMemo(() => {
        return teachers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [teachers, currentPage]);
    const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE);

    const openModal = (mode: 'add' | 'edit', teacher: Teacher | null = null) => {
        setModalMode(mode);
        setCurrentTeacher(teacher || { name: '', gender: Gender.Male, status: TeacherStatus.NonASN, nip: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTeacher({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTeacher.name || !currentTeacher.gender || !currentTeacher.status) {
            alert("Harap isi semua field yang wajib diisi.");
            return;
        }

        if (currentTeacher.status === TeacherStatus.ASN && !currentTeacher.nip) {
            alert("NIP wajib diisi untuk guru ASN.");
            return;
        }

        if (modalMode === 'add') {
            setTeachers([...teachers, { ...currentTeacher, id: Date.now() } as Teacher]);
        } else {
            setTeachers(teachers.map(t => t.id === currentTeacher.id ? { ...t, ...currentTeacher } : t));
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
            setTeachers(teachers.filter(t => t.id !== id));
            if (paginatedTeachers.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedTeacher = { ...currentTeacher, [name]: value };

        if (name === 'status' && value === TeacherStatus.NonASN) {
            updatedTeacher.nip = '';
        }

        setCurrentTeacher(updatedTeacher);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Data Guru</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Tambah Guru</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jenis Kelamin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIP</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedTeachers.map((teacher, index) => (
                            <tr key={teacher.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{teacher.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.nip || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', teacher)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                       <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Guru Baru' : 'Edit Data Guru'}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                        <input type="text" name="name" value={currentTeacher.name || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
                        <select name="gender" value={currentTeacher.gender || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(Gender).map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Kepegawaian</label>
                        <select name="status" value={currentTeacher.status || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(TeacherStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    {currentTeacher.status === TeacherStatus.ASN && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIP (Nomor Induk Pegawai)</label>
                            <input type="text" name="nip" value={currentTeacher.nip || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

const StudentManagementPage = ({ students, setStudents, classes }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, classes: Class[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const paginatedStudents = useMemo(() => {
        return students.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [students, currentPage]);
    const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);

    const openModal = (mode: 'add' | 'edit', student: Student | null = null) => {
        setModalMode(mode);
        setCurrentStudent(student || { 
            nisn: '',
            name: '', 
            gender: Gender.Male, 
            status: StudentStatus.New, 
            entryDate: new Date().toISOString().split('T')[0],
            classId: classes[0]?.id
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentStudent({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStudent.nisn || !currentStudent.name || !currentStudent.classId || !currentStudent.entryDate) {
            alert("Harap isi semua field yang wajib diisi.");
            return;
        }

        if (modalMode === 'add') {
            setStudents([...students, { ...currentStudent, id: Date.now() } as Student]);
        } else {
            setStudents(students.map(s => s.id === currentStudent.id ? { ...s, ...currentStudent } : s));
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
            setStudents(students.filter(s => s.id !== id));
            if (paginatedStudents.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentStudent({ ...currentStudent, [name]: name === 'classId' ? Number(value) : value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCurrentStudent(prev => ({ ...prev, photo: event.target.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const getClassName = (classId: number) => {
        return classes.find(c => c.id === classId)?.name || 'N/A';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Data Siswa</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Tambah Siswa</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Siswa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jenis Kelamin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tgl Masuk</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedStudents.map((student, index) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={student.photo || `https://ui-avatars.com/api/?name=${student.name.replace(/\s/g, '+')}&background=random`} alt={student.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">NISN: {student.nisn}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getClassName(student.classId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === StudentStatus.New || student.status === StudentStatus.Transfer ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.entryDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', student)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                       <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NISN</label>
                        <input type="text" name="nisn" value={currentStudent.nisn || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                        <input type="text" name="name" value={currentStudent.name || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
                        <select name="gender" value={currentStudent.gender || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(Gender).map(g => (<option key={g} value={g}>{g}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                        <select name="classId" value={currentStudent.classId || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                            {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Siswa</label>
                        <select name="status" value={currentStudent.status || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(StudentStatus).map(s => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Masuk</label>
                        <input type="date" name="entryDate" value={currentStudent.entryDate || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Siswa (Opsional)</label>
                        <div className="mt-2 flex items-center space-x-4">
                            <img 
                                className="h-16 w-16 rounded-full object-cover" 
                                src={currentStudent.photo || `https://ui-avatars.com/api/?name=${(currentStudent.name || 'S').replace(/\s/g, '+')}&background=random`} 
                                alt="Foto Siswa" 
                            />
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handlePhotoChange} 
                                className="hidden" 
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="ml-5 bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Pilih Foto
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. WhatsApp (Opsional)</label>
                        <input type="text" name="whatsapp" value={currentStudent.whatsapp || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="628123456789" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const StudentTransferPage = ({ students, setStudents, transfers, setTransfers }: {
    students: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    transfers: StudentTransfer[];
    setTransfers: React.Dispatch<React.SetStateAction<StudentTransfer[]>>;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentTransfer, setCurrentTransfer] = useState<Partial<StudentTransfer>>({});

    const availableStudents = useMemo(() => {
        return students.filter(s => s.status !== StudentStatus.Inactive);
    }, [students]);

    const openModal = (mode: 'add' | 'edit', transfer: StudentTransfer | null = null) => {
        setModalMode(mode);
        setCurrentTransfer(transfer || { 
            studentId: availableStudents[0]?.id,
            exitDate: new Date().toISOString().split('T')[0],
            reason: TransferReason.Pindah,
            notes: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTransfer({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTransfer.studentId || !currentTransfer.exitDate || !currentTransfer.reason) {
            alert("Harap isi semua field yang wajib diisi.");
            return;
        }

        if (modalMode === 'add') {
            const newTransfer = { ...currentTransfer, id: Date.now() } as StudentTransfer;
            setTransfers(prev => [...prev, newTransfer]);
            setStudents(prev => prev.map(s => 
                s.id === newTransfer.studentId 
                ? { ...s, status: StudentStatus.Inactive, exitDate: newTransfer.exitDate } 
                : s
            ));
        } else {
            setTransfers(prev => prev.map(t => t.id === currentTransfer.id ? { ...t, ...currentTransfer } as StudentTransfer : t));
            setStudents(prev => prev.map(s => 
                s.id === currentTransfer.studentId 
                ? { ...s, exitDate: currentTransfer.exitDate } 
                : s
            ));
        }
        closeModal();
    };

    const handleDelete = (transferId: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data mutasi ini? Tindakan ini akan mengaktifkan kembali status siswa.")) {
            const transferToDelete = transfers.find(t => t.id === transferId);
            if (!transferToDelete) return;

            setTransfers(prev => prev.filter(t => t.id !== transferId));
            setStudents(prev => prev.map(s => 
                s.id === transferToDelete.studentId 
                ? { ...s, status: StudentStatus.New, exitDate: undefined } 
                : s
            ));
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentTransfer(prev => ({ ...prev, [name]: name === 'studentId' ? Number(value) : value }));
    };

    const getStudentName = (studentId: number) => {
        return students.find(s => s.id === studentId)?.name || 'Siswa tidak ditemukan';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Mutasi Siswa</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon>{ICONS.plus}</Icon>
                    <span>Catat Mutasi</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Siswa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal Keluar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alasan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catatan</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {transfers.map((transfer, index) => (
                            <tr key={transfer.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{getStudentName(transfer.studentId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{transfer.exitDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{transfer.reason}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{transfer.notes || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    <button onClick={() => openModal('edit', transfer)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <Icon>{ICONS.pencil}</Icon>
                                    </button>
                                    <button onClick={() => handleDelete(transfer.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                       <Icon>{ICONS.trash}</Icon>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                title={modalMode === 'add' ? 'Catat Mutasi Siswa' : 'Edit Mutasi Siswa'}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Siswa</label>
                        <select name="studentId" value={currentTransfer.studentId || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={modalMode==='edit'}>
                            {modalMode === 'edit' ? 
                                <option value={currentTransfer.studentId}>{getStudentName(currentTransfer.studentId!)}</option>
                                : availableStudents.map(s => (<option key={s.id} value={s.id}>{s.name} (NISN: {s.nisn})</option>))
                            }
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Keluar</label>
                        <input type="date" name="exitDate" value={currentTransfer.exitDate || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alasan</label>
                        <select name="reason" value={currentTransfer.reason || ''} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(TransferReason).map(r => (<option key={r} value={r}>{r}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catatan (Opsional)</label>
                        <textarea name="notes" value={currentTransfer.notes || ''} onChange={handleFormChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const RekapKehadiranSiswaPage = ({ students, classes, attendanceRecords }: {
    students: Student[];
    classes: Class[];
    attendanceRecords: StudentAttendance[];
}) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [selectedClassId, setSelectedClassId] = useState('all');

    const recapData = useMemo(() => {
        let filteredStudents = students;
        if (selectedClassId !== 'all') {
            filteredStudents = students.filter(s => s.classId === parseInt(selectedClassId));
        }

        return filteredStudents.map(student => {
            const studentRecords = attendanceRecords.filter(
                rec => rec.studentId === student.id && rec.date >= startDate && rec.date <= endDate
            );

            const summary = {
                [AttendanceStatus.Hadir]: 0,
                [AttendanceStatus.Sakit]: 0,
                [AttendanceStatus.Ijin]: 0,
                [AttendanceStatus.Alpa]: 0,
            };

            studentRecords.forEach(rec => {
                summary[rec.status]++;
            });

            return {
                ...student,
                summary,
                className: classes.find(c => c.id === student.classId)?.name || 'N/A'
            };
        });
    }, [students, classes, attendanceRecords, startDate, endDate, selectedClassId]);

    const handleExport = () => {
        const headers = ["No", "NISN", "Nama Siswa", "Kelas", "Hadir", "Sakit", "Izin", "Alpa"];
        const rows = recapData.map((data, index) => [
            index + 1,
            data.nisn,
            data.name,
            data.className,
            data.summary.H,
            data.summary.S,
            data.summary.I,
            data.summary.A,
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rekap_kehadiran_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const setThisWeek = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust for Sunday
        
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        setStartDate(firstDayOfWeek.toISOString().split('T')[0]);
        setEndDate(lastDayOfWeek.toISOString().split('T')[0]);
    };
    
    const setThisMonth = () => {
        setStartDate(firstDayOfMonth);
        setEndDate(lastDayOfMonth);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="all">Semua Kelas</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div className="flex space-x-2">
                        <button onClick={setThisWeek} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">Minggu Ini</button>
                        <button onClick={setThisMonth} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">Bulan Ini</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Hasil Rekapitulasi</h2>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                    >
                        <Icon>{ICONS.download}</Icon>
                        <span>Export ke Excel</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NISN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hadir</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sakit</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Izin</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alpa</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {recapData.length > 0 ? recapData.map((data, index) => (
                                <tr key={data.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{data.nisn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{data.className}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.summary.H}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.summary.S}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.summary.I}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.summary.A}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Tidak ada data kehadiran untuk filter yang dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Bar Chart Component ---
const BarChart = ({ data, title }: { data: { label: string; value: number }[]; title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 100);
    const chartHeight = 300;
    const barWidth = 35;
    const barMargin = 20;
    const chartWidth = data.length * (barWidth + barMargin);

    const getBarColor = (value: number) => {
        if (value < 75) return "fill-red-500";
        if (value < 90) return "fill-yellow-500";
        return "fill-green-500";
    };

    return (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
            {data.length > 0 ? (
                 <div className="overflow-x-auto">
                    <svg width={chartWidth} height={chartHeight + 40} className="font-sans">
                        <g transform="translate(0, 10)">
                            {data.map((d, i) => {
                                const barHeight = (d.value / maxValue) * chartHeight;
                                return (
                                    <g key={d.label} transform={`translate(${(barWidth + barMargin) * i}, 0)`}>
                                        <rect
                                            className={`${getBarColor(d.value)} transition-all duration-300`}
                                            x="0"
                                            y={chartHeight - barHeight}
                                            width={barWidth}
                                            height={barHeight}
                                            rx="4"
                                        />
                                        <text
                                            className="text-xs fill-current text-gray-800 dark:text-gray-100 font-bold"
                                            x={barWidth / 2}
                                            y={chartHeight - barHeight - 5}
                                            textAnchor="middle"
                                        >
                                            {`${d.value.toFixed(1)}%`}
                                        </text>
                                        <text
                                            className="text-xs fill-current text-gray-500 dark:text-gray-400"
                                            x={barWidth / 2}
                                            y={chartHeight + 15}
                                            textAnchor="middle"
                                        >
                                            {d.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                 </div>
            ) : (
                <div className="h-[340px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Tidak ada data untuk ditampilkan pada grafik.
                </div>
            )}
        </div>
    );
};


const RekapKehadiranGuruPage = ({ teachers, subjectTeachers, attendanceRecords }: {
    teachers: Teacher[];
    subjectTeachers: SubjectTeacher[];
    attendanceRecords: TeacherAttendance[];
}) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [selectedTeacherId, setSelectedTeacherId] = useState('all');

    const getWeekdaysInRange = (start: string, end: string) => {
        let count = 0;
        const currentDate = new Date(start);
        const lastDate = new Date(end);

        while (currentDate <= lastDate) {
            const day = currentDate.getDay();
            if (day >= 1 && day <= 5) { // Monday to Friday
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return count;
    };

    const recapData = useMemo(() => {
        const weekdays = getWeekdaysInRange(startDate, endDate);
        if (weekdays === 0) return [];
        
        let filteredTeachers = teachers;
        if (selectedTeacherId !== 'all') {
            filteredTeachers = teachers.filter(t => t.id === parseInt(selectedTeacherId));
        }

        return filteredTeachers.map(teacher => {
            const teacherAssignments = subjectTeachers.filter(st => st.teacherId === teacher.id);
            const weeklyMeetings = teacherAssignments.reduce((sum, current) => sum + current.meetings, 0);
            const expectedMeetingsPerDay = weeklyMeetings / 5; // Assuming 5-day school week
            const totalExpectedMeetings = Math.round(expectedMeetingsPerDay * weekdays);

            const attendedRecords = attendanceRecords.filter(
                rec => rec.teacherId === teacher.id && rec.date >= startDate && rec.date <= endDate
            );
            const totalAttendedMeetings = attendedRecords.reduce((sum, current) => sum + current.meetings, 0);
            
            const percentage = totalExpectedMeetings > 0 ? (totalAttendedMeetings / totalExpectedMeetings) * 100 : 0;

            return {
                teacherId: teacher.id,
                teacherName: teacher.name,
                expected: totalExpectedMeetings,
                attended: totalAttendedMeetings,
                percentage: Math.min(percentage, 100), // Cap at 100%
            };
        });
    }, [teachers, subjectTeachers, attendanceRecords, startDate, endDate, selectedTeacherId]);

    const chartData = useMemo(() => {
        return recapData.map(d => ({ label: d.teacherName, value: d.percentage }));
    }, [recapData]);

    const handleExport = () => {
        const headers = ["No", "Nama Guru", "Pertemuan Seharusnya", "Pertemuan Dihadiri", "Persentase Kehadiran (%)"];
        const rows = recapData.map((data, index) => [
            index + 1,
            data.teacherName,
            data.expected,
            data.attended,
            data.percentage.toFixed(2),
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rekap_kehadiran_guru_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const setThisWeek = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 4); // Monday to Friday

        setStartDate(firstDayOfWeek.toISOString().split('T')[0]);
        setEndDate(lastDayOfWeek.toISOString().split('T')[0]);
    };
    
    const setThisMonth = () => {
        setStartDate(firstDayOfMonth);
        setEndDate(lastDayOfMonth);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guru</label>
                        <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="all">Semua Guru</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                     <div className="flex space-x-2">
                        <button onClick={setThisWeek} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">Minggu Ini</button>
                        <button onClick={setThisMonth} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">Bulan Ini</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Grafik & Rincian Kehadiran Guru</h2>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                    >
                        <Icon>{ICONS.download}</Icon>
                        <span>Export ke Excel</span>
                    </button>
                </div>
                <div className="mb-8">
                     <BarChart data={chartData} title={`Persentase Kehadiran Guru (${startDate} s/d ${endDate})`} />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Guru</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pertemuan Seharusnya</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pertemuan Dihadiri</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Persentase</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {recapData.length > 0 ? recapData.map((data, index) => (
                                <tr key={data.teacherId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{data.teacherName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.expected}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.attended}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.percentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : data.percentage >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                                            {data.percentage.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Tidak ada data kehadiran untuk filter yang dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Placeholder for other pages
function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Fitur ini sedang dalam pengembangan.</p>
        </div>
    );
}


function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
    </ThemeProvider>
  );
}

const MainApp = () => {
    const { isAuthenticated } = useAuth();

    // Centralized state management
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [transfers, setTransfers] = useState<StudentTransfer[]>(initialStudentTransfers);
    const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>(initialSubjectTeachers);
    const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(initialStudentAttendance);
    const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>(initialTeacherAttendance);
    
    return (
        <HashRouter>
            {isAuthenticated ? (
                <Layout>
                    <Routes>
                        <Route path="/" element={<DashboardPage students={students} teachers={teachers} classes={classes} />} />
                        <Route path="/identitas-sekolah" element={<SchoolIdentityPage />} />
                        <Route path="/kalender-pendidikan" element={<CalendarManagementPage />} />
                        <Route path="/guru" element={<TeacherManagementPage teachers={teachers} setTeachers={setTeachers} />} />
                        <Route path="/mapel" element={<SubjectManagementPage subjects={subjects} setSubjects={setSubjects} />} />
                        <Route path="/pengajar-mapel" element={<SubjectTeacherManagementPage assignments={subjectTeachers} setAssignments={setSubjectTeachers} teachers={teachers} subjects={subjects} classes={classes} />} />
                        <Route path="/siswa" element={<StudentManagementPage students={students} setStudents={setStudents} classes={classes} />} />
                        <Route path="/kelas" element={<ClassManagementPage classes={classes} setClasses={setClasses} teachers={teachers} />} />
                        <Route path="/input-kehadiran" element={<StudentAttendanceInputPage students={students} classes={classes} />} />
                        <Route path="/rekap-kehadiran-siswa" element={<RekapKehadiranSiswaPage students={students} classes={classes} attendanceRecords={studentAttendance} />} />
                        <Route path="/rekap-kehadiran-guru" element={<RekapKehadiranGuruPage teachers={teachers} subjectTeachers={subjectTeachers} attendanceRecords={teacherAttendance}/>} />
                        <Route path="/mutasi-siswa" element={<StudentTransferPage students={students} setStudents={setStudents} transfers={transfers} setTransfers={setTransfers} />} />
                        <Route path="/manajemen-pengguna" element={<PlaceholderPage title="Manajemen Pengguna"/>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            ) : (
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            )}
        </HashRouter>
    );
}

export default App;
