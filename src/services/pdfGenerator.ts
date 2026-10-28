import jsPDF from 'jspdf';
import { Student, PetSpecies } from '../types';

export function generateAnimalKingdomCertificate(student: Student, species?: PetSpecies): jsPDF {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background Royal Parchment
  doc.setFillColor(254, 252, 243);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Golden Border
  doc.setDrawColor(217, 163, 37); // Warm Gold
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner Ornate Thin Border
  doc.setDrawColor(180, 130, 20);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Corner Ornaments
  const drawCorner = (x: number, y: number) => {
    doc.setFillColor(217, 163, 37);
    doc.circle(x, y, 2.5, 'F');
  };
  drawCorner(12, 12);
  drawCorner(pageWidth - 12, 12);
  drawCorner(12, pageHeight - 12);
  drawCorner(pageWidth - 12, pageHeight - 12);

  // Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(140, 95, 10);
  doc.text('ANIMAL KINGDOM ACADEMY OF EXCELLENCE', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(26);
  doc.setTextColor(30, 41, 59);
  doc.text('SERTIFIKAT PENGHARGAAN', pageWidth / 2, 36, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text('GELAR KEHORMATAN: MVP PET MASTER', pageWidth / 2, 45, { align: 'center' });

  // Divider line with diamond
  doc.setDrawColor(217, 163, 37);
  doc.setLineWidth(0.6);
  doc.line(70, 49, 138, 49);
  doc.line(159, 49, 227, 49);
  doc.setFillColor(217, 163, 37);
  doc.circle(pageWidth / 2, 49, 1.8, 'F');

  // Introductory Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Dengan penuh kebanggaan, Dewan Kehormatan Kerajaan Satwa menganugerahkan penghargaan ini kepada:', pageWidth / 2, 60, { align: 'center' });

  // Student Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name.toUpperCase(), pageWidth / 2, 74, { align: 'center' });

  // Student NISN & Class
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`NISN: ${student.nisn}   |   ${student.className}`, pageWidth / 2, 83, { align: 'center' });

  // Achievement narrative
  const speciesName = species?.name || 'Hewan Peliharaan Ajaib';
  const petNick = student.petNickname || 'Sahabat Satwa';
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const narrative = `Atas dedikasi, kedisiplinan, kasih sayang, dan ketekunan luar biasa dalam merawat serta mendidik "${petNick}" (${speciesName}) hingga sukses berevolusi ke Tahap Puncak Dewasa (Level 10) serta meraih prestasi teladan di sekolah.`;
  const splitNarrative = doc.splitTextToSize(narrative, 210);
  doc.text(splitNarrative, pageWidth / 2, 95, { align: 'center' });

  // Golden Medal Box
  doc.setFillColor(254, 249, 195);
  doc.setDrawColor(234, 179, 8);
  doc.roundedRect(60, 114, 177, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(161, 98, 7);
  doc.text('PRESTASI TERCATAT DALAM BUKU BESAR KERAJAAN SATWA', pageWidth / 2, 122, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(113, 63, 18);
  doc.text(`Total Bintang Prestasi: ${student.stars} Bintang ⭐  |  Poin Pengalaman: ${student.xp} XP  |  Status: MVP Pet Master`, pageWidth / 2, 131, { align: 'center' });

  // Gold Seal Circle (Left/Center-bottom)
  const sealX = 75;
  const sealY = 168;
  doc.setFillColor(245, 158, 11); // Amber
  doc.circle(sealX, sealY, 14, 'F');
  doc.setFillColor(251, 191, 36);
  doc.circle(sealX, sealY, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  doc.text('OFFICIAL SEAL', sealX, sealY - 3, { align: 'center' });
  doc.text('VERIFIED', sealX, sealY + 1, { align: 'center' });
  doc.text('MVP MASTER', sealX, sealY + 5, { align: 'center' });

  // Date
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ditetapkan pada: ${todayStr}`, pageWidth / 2, 153, { align: 'center' });

  // Signature Left: Guru / Wali Kelas
  const sigLeftX = 140;
  const sigRightX = 225;
  const sigY = 178;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Dewan Guru & Pengajar', sigLeftX, sigY, { align: 'center' });
  doc.setLineWidth(0.4);
  doc.setDrawColor(148, 163, 184);
  doc.line(sigLeftX - 30, sigY + 12, sigLeftX + 30, sigY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Budi Santoso, S.Pd (Wali Kelas)', sigLeftX, sigY + 17, { align: 'center' });

  // Signature Right: Animal Kingdom Chancellor
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Kepala Kehormatan Satwa', sigRightX, sigY, { align: 'center' });
  doc.line(sigRightX - 30, sigY + 12, sigRightX + 30, sigY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Prof. Archibald Owl, M.Sc', sigRightX, sigY + 17, { align: 'center' });

  return doc;
}

export function downloadStudentCertificate(student: Student, species?: PetSpecies) {
  const doc = generateAnimalKingdomCertificate(student, species);
  const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Sertifikat_MVP_${cleanName}_NISN_${student.nisn}.pdf`);
}
