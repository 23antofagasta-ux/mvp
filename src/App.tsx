/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, GraduationCap, ArrowRight, Share2, Users, Heart, Gamepad2, Award } from 'lucide-react';
import { Role, Student, Teacher, AppTheme } from './types';
import { storageService, SyncEvent } from './services/storage';
import { Navbar } from './components/common/Navbar';
import { PushNotificationToast } from './components/common/PushNotificationToast';
import { QRCodeModal } from './components/common/QRCodeModal';
import { TeacherLogin } from './components/teacher/TeacherLogin';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentLogin } from './components/student/StudentLogin';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AVAILABLE_THEMES } from './components/common/ThemeSelector';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => storageService.getTheme());
  const [currentRole, setCurrentRole] = useState<Role>(null);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // QR Modal
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrTargetStudent, setQrTargetStudent] = useState<Student | null>(null);

  // Check URL query parameters on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const nisnParam = urlParams.get('nisn');
    const portalParam = urlParams.get('portal');

    if (nisnParam) {
      const student = storageService.getStudentByNisn(nisnParam);
      if (student) {
        setActiveStudent(student);
        setCurrentRole('student');
        return;
      }
    }

    if (portalParam === 'guru') {
      setCurrentRole('teacher');
    } else if (portalParam === 'siswa') {
      setCurrentRole('student');
    }
  }, []);

  // Listen to cross-tab updates for current student & theme changes
  useEffect(() => {
    const unsub = storageService.subscribe((event: SyncEvent) => {
      if (activeStudent && event.type === 'STAR_UPDATE' && event.studentId === activeStudent.id) {
        const refreshed = storageService.getStudentById(activeStudent.id);
        if (refreshed) {
          setActiveStudent(refreshed);
        }
      } else if (event.type === 'THEME_CHANGED') {
        setCurrentTheme(event.theme);
      }
    });
    return () => unsub();
  }, [activeStudent]);

  const handleOpenQRModal = (student?: Student) => {
    setQrTargetStudent(student || activeStudent || null);
    setIsQRModalOpen(true);
  };

  const handleLogout = () => {
    setActiveTeacher(null);
    setActiveStudent(null);
    setCurrentRole(null);
    // Clear URL parameters cleanly
    if (window.history.pushState) {
      const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  };

  return (
    <div
      data-theme={currentTheme}
      className={`min-h-screen theme-${currentTheme} bg-gradient-to-b from-amber-50/50 via-slate-50 to-amber-50/30 text-slate-800 flex flex-col font-sans transition-colors duration-300`}
    >
      {/* Global Real-time Audio & Confetti Push Notification Toast */}
      <PushNotificationToast currentStudentNisn={activeStudent?.nisn} />

      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        activeTeacher={activeTeacher}
        activeStudent={activeStudent}
        onSwitchRole={() => {
          handleLogout();
        }}
        onLogout={handleLogout}
        onOpenQR={() => handleOpenQRModal()}
      />

      {/* Main Body Routing */}
      <main className="flex-1">
        {/* VIEW 0: ROLE SELECTOR LANDING */}
        {currentRole === null && (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 text-center">
            {/* Hero Mascot Icon */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-2xl border-4 border-white flex items-center justify-center text-5xl sm:text-6xl animate-bounce-gentle mx-auto">
                🐾
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md border-2 border-white">
                MVP
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight">
              My Virtual Pet
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed font-medium">
              Game Edukasi Penguatan Karakter & Apresiasi Belajar. Rawat hewan peliharaan virtualmu, raih bintang prestasi, dan jadilah MVP Pet Master!
            </p>

            {/* Portal Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto mt-8 sm:mt-10">
              {/* Teacher Portal Option */}
              <div
                onClick={() => setCurrentRole('teacher')}
                className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-300 hover:border-amber-500 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group active:scale-98"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition duration-300">
                    👨‍🏫
                  </div>
                  <h2 className="text-xl font-extrabold font-heading text-slate-800 mt-4">
                    Panel Guru & Wali Kelas
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Masuk dengan PIN untuk mengelola database siswa, membagikan QR code ke HP siswa, memberikan reward bintang real-time, dan mengelola Pet Gallery 4 tahap evolusi.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      ⌨️ Ketik Manual / Keypad
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      🔒 PIN Rahasia Guru
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Real-time Stars
                    </span>

                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-black text-amber-600 group-hover:text-amber-700">
                  <span>Masuk Panel Guru</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Student Portal Option */}
              <div
                onClick={() => setCurrentRole('student')}
                className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-300 hover:border-amber-500 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group active:scale-98"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-amber-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition duration-300">
                    🎒
                  </div>
                  <h2 className="text-xl font-extrabold font-heading text-slate-800 mt-4">
                    Panel Siswa / Player
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Masuk dengan mengetik manual NISN atau nama siswa (atau scan QR code). Rawat pet kesayangan, raih bintang, mainkan mini-game, dan raih sertifikat resmi MVP!
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      ⌨️ Ketik NISN / Nama Siswa
                    </span>
                    <span className="bg-yellow-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      13 Spesies Hewan
                    </span>
                    <span className="bg-yellow-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Sertifikat PDF
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-black text-amber-600 group-hover:text-amber-700">
                  <span>Mulai Bermain</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>

            {/* Quick Interactive Theme Showcase Bar */}
            <div className="mt-8 max-w-xl mx-auto p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-black font-heading text-slate-700 flex items-center gap-1.5">
                  <span>🎨</span>
                  <span>Pilihan Tema Tampilan:</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Clay • Cartoon • Dark • Bright
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_THEMES.map((th) => {
                  const isActive = currentTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        storageService.setTheme(th.id);
                        setCurrentTheme(th.id);
                      }}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'bg-amber-100 border-amber-500 shadow-sm font-bold scale-102'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black text-slate-900">
                        <span>{th.icon} {th.label}</span>
                        {isActive && <span className="text-amber-600 text-[10px]">✓</span>}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 line-clamp-1">{th.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Features Highlight strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xl mb-0.5">⭐</div>
                <div className="text-xs font-bold text-slate-800">Reward Real-time</div>
                <div className="text-[10px] text-slate-500">Audio chime & notifikasi instan</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xl mb-0.5">🐣</div>
                <div className="text-xs font-bold text-slate-800">4 Tahap Evolusi</div>
                <div className="text-[10px] text-slate-500">Telur ➔ Anak ➔ Remaja ➔ Dewasa</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xl mb-0.5">🎮</div>
                <div className="text-xs font-bold text-slate-800">4 Mini-Game Edukasi</div>
                <div className="text-[10px] text-slate-500">Kuis Satwa & Kilat Perkalian</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xl mb-0.5">👑</div>
                <div className="text-xs font-bold text-slate-800">Sertifikat MVP PDF</div>
                <div className="text-[10px] text-slate-500">Format landscape resmi Kerajaan</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1: TEACHER PORTAL */}
        {currentRole === 'teacher' && (
          <>
            {!activeTeacher ? (
              <TeacherLogin
                onSuccess={(teacher) => setActiveTeacher(teacher)}
                onSwitchToStudent={() => {
                  setCurrentRole('student');
                  setActiveStudent(null);
                }}
              />
            ) : (
              <TeacherDashboard
                teacher={activeTeacher}
                onLoginAsStudent={(st) => {
                  setActiveStudent(st);
                  setCurrentRole('student');
                }}
                onOpenQR={(st) => handleOpenQRModal(st)}
              />
            )}
          </>
        )}

        {/* VIEW 2: STUDENT PORTAL */}
        {currentRole === 'student' && (
          <>
            {!activeStudent ? (
              <StudentLogin
                onSuccess={(st) => setActiveStudent(st)}
                onSwitchToTeacher={() => {
                  setCurrentRole('teacher');
                  setActiveTeacher(null);
                }}
              />
            ) : (
              <StudentDashboard
                initialStudent={activeStudent}
                onOpenQR={(st) => handleOpenQRModal(st)}
              />
            )}
          </>
        )}
      </main>

      {/* Share / QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        student={qrTargetStudent}
      />
    </div>
  );
}
