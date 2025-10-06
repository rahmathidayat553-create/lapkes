
import React, { useState, useCallback, useMemo, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import type { School, Teacher, Subject, Class, Student, User, CalendarEvent } from './types';
import { SchoolLevel, SchoolDays, TeacherStatus, Gender, StudentStatus, TransferReason, CalendarStatus } from './types';

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

const initialStudents: Student[] = [
    { id: 1, nisn: '001', name: 'Andi', gender: Gender.Male, status: StudentStatus.New, entryDate: '2023-07-15', classId: 2, photo: 'https://picsum.photos/seed/andi/100' },
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
};

// Fix: Using a named interface for props to avoid potential parsing issues.
interface IconProps {
    children: React.ReactNode;
}
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

// Fix: Using a named interface for props to avoid potential parsing issues.
interface ThemeProviderProps {
    children: React.ReactNode;
}
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

// Fix: Using a named interface for props to avoid potential parsing issues.
interface AuthProviderProps {
    children: React.ReactNode;
}
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

// Fix: Using a named interface for props to avoid potential parsing issues.
interface LayoutProps {
    children: React.ReactNode;
}
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

const DashboardPage = () => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Siswa</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{initialStudents.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Guru</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{initialTeachers.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Kelas</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{initialClasses.length}</p>
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

    const handleSave = () => {
        if (!currentEvent.date || !currentEvent.title || !currentEvent.status) {
            alert("Harap isi semua field yang wajib diisi.");
            return;
        }

        if (modalMode === 'add') {
            setEvents([...events, { ...currentEvent, id: Date.now() } as CalendarEvent]);
        } else {
            setEvents(events.map(e => e.id === currentEvent.id ? { ...e, ...currentEvent } : e));
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                            {modalMode === 'add' ? 'Tambah Acara Baru' : 'Edit Acara'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">
                                    Batal
                                </button>
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ClassManagementPage = () => {
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentClass, setCurrentClass] = useState<Partial<Class>>({});

    const openModal = (mode: 'add' | 'edit', cls: Class | null = null) => {
        setModalMode(mode);
        setCurrentClass(cls || { code: '', name: '', homeroomTeacherId: initialTeachers[0]?.id });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentClass({});
    };

    const handleSave = () => {
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
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentClass({ ...currentClass, [name]: name === 'homeroomTeacherId' ? Number(value) : value });
    };

    const getTeacherName = (teacherId: number) => {
        return initialTeachers.find(t => t.id === teacherId)?.name || 'N/A';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Kelas</h2>
                <button
                    onClick={() => openModal('add')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center space-x-2"
                >
                    <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>
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
                        {classes.map((cls, index) => (
                            <tr key={cls.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                            {modalMode === 'add' ? 'Tambah Kelas Baru' : 'Edit Kelas'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                                        {initialTeachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">
                                    Batal
                                </button>
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StudentAttendanceInputPage = () => {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    
    const studentsInClass = useMemo(() => {
        if (!selectedClass) return [];
        return initialStudents.filter(s => s.classId === selectedClass);
    }, [selectedClass]);

    const initialAttendance = useMemo(() => {
        const att: { [key: number]: string } = {};
        studentsInClass.forEach(student => {
            att[student.id] = 'H';
        });
        return att;
    }, [studentsInClass]);

    const [attendance, setAttendance] = useState(initialAttendance);
    const [attendingTeachersCount, setAttendingTeachersCount] = useState(1);
    
    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = parseInt(e.target.value, 10);
        setSelectedClass(classId);
    };

    const handleAttendanceChange = (studentId: number, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            classId: selectedClass,
            date: attendanceDate,
            studentAttendance: attendance,
            attendingTeachers: attendingTeachersCount,
        });
        alert('Data kehadiran berhasil disimpan!');
    };
    
    const formInputClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Pilih Kelas dan Tanggal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                        <select onChange={handleClassChange} className={formInputClass}>
                            <option>-- Pilih Kelas --</option>
                            {initialClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className={`${formInputClass} dark:[color-scheme:dark]`} />
                    </div>
                </div>
            </div>
            {selectedClass && (
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Input Kehadiran Siswa - {initialClasses.find(c=>c.id === selectedClass)?.name}</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Siswa</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pertemuan 1</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {studentsInClass.map((student, index) => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                                <div className="flex justify-center space-x-4">
                                                    {['H', 'S', 'I', 'A'].map(status => (
                                                        <label key={status} className="flex items-center space-x-1 cursor-pointer">
                                                            <input type="radio" name={`att-${student.id}`} value={status} checked={attendance[student.id] === status} onChange={() => handleAttendanceChange(student.id, status)} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                                            <span className="dark:text-gray-300">{status}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                         <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Input Kehadiran Guru</h3>
                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Guru Hadir</label>
                            <select value={attendingTeachersCount} onChange={(e) => setAttendingTeachersCount(Number(e.target.value))} className={`${formInputClass} w-48`}>
                                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                         </div>
                         <div className="space-y-4">
                            {Array.from({ length: attendingTeachersCount }).map((_, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Guru</label>
                                        <select className={formInputClass}>
                                            {initialTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mata Pelajaran</label>
                                        <select className={formInputClass}>
                                            {initialSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Pertemuan</label>
                                         <select className={formInputClass}>
                                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                     <div className="flex justify-end">
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200">
                            Simpan Kehadiran
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

const TeacherManagementPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher>>({});

    const openModal = (mode: 'add' | 'edit', teacher: Teacher | null = null) => {
        setModalMode(mode);
        setCurrentTeacher(teacher || { name: '', gender: Gender.Male, status: TeacherStatus.NonASN, nip: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTeacher({});
    };

    const handleSave = () => {
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
                        {teachers.map((teacher, index) => (
                            <tr key={teacher.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                            {modalMode === 'add' ? 'Tambah Guru Baru' : 'Edit Data Guru'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">
                                    Batal
                                </button>
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StudentManagementPage = () => {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openModal = (mode: 'add' | 'edit', student: Student | null = null) => {
        setModalMode(mode);
        setCurrentStudent(student || { 
            nisn: '',
            name: '', 
            gender: Gender.Male, 
            status: StudentStatus.New, 
            entryDate: new Date().toISOString().split('T')[0],
            classId: initialClasses[0]?.id
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentStudent({});
    };

    const handleSave = () => {
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
        return initialClasses.find(c => c.id === classId)?.name || 'N/A';
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
                        {students.map((student, index) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                            {modalMode === 'add' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                                        {initialClasses.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
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
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">
                                    Batal
                                </button>
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
    return (
        <HashRouter>
            {isAuthenticated ? (
                <Layout>
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/identitas-sekolah" element={<SchoolIdentityPage />} />
                        <Route path="/kalender-pendidikan" element={<CalendarManagementPage />} />
                        <Route path="/guru" element={<TeacherManagementPage />} />
                        <Route path="/mapel" element={<PlaceholderPage title="Data Mata Pelajaran"/>} />
                        <Route path="/pengajar-mapel" element={<PlaceholderPage title="Data Pengajar Mapel"/>} />
                        <Route path="/siswa" element={<StudentManagementPage />} />
                        <Route path="/kelas" element={<ClassManagementPage />} />
                        <Route path="/input-kehadiran" element={<StudentAttendanceInputPage />} />
                        <Route path="/rekap-kehadiran-siswa" element={<PlaceholderPage title="Rekap Kehadiran Siswa"/>} />
                        <Route path="/rekap-kehadiran-guru" element={<PlaceholderPage title="Rekap Kehadiran Guru"/>} />
                        <Route path="/mutasi-siswa" element={<PlaceholderPage title="Data Mutasi Siswa"/>} />
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
