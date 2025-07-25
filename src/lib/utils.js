import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility: konversi tanggal, jam, zona waktu ke ISO 8601
export function toISODate(tanggal, jam, zonaWaktu) {
  // tanggal: "Sabtu, 20 Desember 2025"
  // jam: "08.00"
  // zonaWaktu: "WIB"
  // Output: "2025-12-20T08:00:00+07:00"
  const mapZona = { WIB: "+07:00", WITA: "+08:00", WIT: "+09:00" };
  const tgl = tanggal.replace(/^[^,]+, /, ""); // "20 Desember 2025"
  const [day, month, year] = tgl.split(" ");
  const bulan = {
    Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
    Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12"
  };
  const jam24 = jam.replace(".", ":");
  return `${year}-${bulan[month]}-${day.padStart(2, "0")}T${jam24}:00${mapZona[zonaWaktu] || "+07:00"}`;
}