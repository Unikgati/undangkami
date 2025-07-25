import React, { useEffect, useState } from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const templates = [
	{
		id: 1,
		name: 'Elegan Klasik',
		image: 'classic-elegance-template',
	},
	{
		id: 2,
		name: 'Modern Minimalis',
		image: 'modern-minimalist-template',
	},
	{
		id: 3,
		name: 'Rustik Romantis',
		image: 'rustic-romance-template',
	},
	{
		id: 4,
		name: 'Bunga Tropis',
		image: 'tropical-bloom-template',
	},
];

const TemplateCard = ({ template }) => {
  const price = Number(template.price) || 0;
  const discount = Number(template.discount) || 0;
  const finalPrice = price * (1 - discount / 100);
  const templateId = String(template.id);

  return (
	<motion.div whileHover={{ y: -10, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="flex-1">
	  <Card className="overflow-hidden border border-purple-200 bg-white text-gray-800 rounded-xl shadow-md sm:rounded-2xl sm:shadow-lg flex flex-col h-full">
		<div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
		  <img
			alt={template.name}
			className="w-full h-full object-cover"
			src={template.thumbnail || 'https://images.unsplash.com/photo-1595872018818-97555653a011'}
			style={{ aspectRatio: '1/1', display: 'block' }}
		  />
		  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-semibold border border-purple-200">
			{template.category || 'Islamic'}
		  </span>
		</div>
		<CardContent className="p-3 sm:p-4 md:p-6 flex flex-col flex-1 justify-between">
		  <div>
			<h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4">{template.name}</h3>
			<div className="mb-2 sm:mb-4 flex flex-wrap items-center">
			  {price > 0 ? (
				<>
				  <span className="text-gray-400 line-through mr-2 text-xs sm:text-sm">Rp{price.toLocaleString('id-ID')}</span>
				  <span className="text-purple-700 font-bold text-sm sm:text-lg">Rp{finalPrice.toLocaleString('id-ID')}</span>
				  {discount > 0 && (
					<span className="ml-2 text-xs text-green-600 font-semibold">-{discount}%</span>
				  )}
				</>
			  ) : (
				<span className="text-green-600 font-bold text-sm sm:text-lg">Gratis</span>
			  )}
			</div>
		  </div>
		  <div className="flex flex-col sm:flex-row justify-between gap-2 mt-2">
			<Link to={`/preview/${templateId}`} className="w-full sm:flex-1">
			  <Button
				variant="outline"
				className="w-full py-2 text-xs sm:text-sm bg-white border border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white hover:border-purple-800"
			  >
				Preview
			  </Button>
			</Link>
			<Link to={`/order/${templateId}`} className="w-full sm:flex-1">
			  <Button className="w-full py-2 text-xs sm:text-sm bg-purple-700 text-white hover:bg-purple-800 hover:shadow-lg">
				Cobain
			  </Button>
			</Link>
		  </div>
		</CardContent>
	  </Card>
	</motion.div>
  );
};

const Homepage = () => {
const [showMobileNav, setShowMobileNav] = useState(false);
const [logoUrl, setLogoUrl] = useState(null);
const [templates, setTemplates] = useState([]);
const [loadingTemplates, setLoadingTemplates] = useState(true);

useEffect(() => {
  const fetchTemplates = async () => {
	setLoadingTemplates(true);
	try {
	  const { getApp } = await import('firebase/app');
	  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
	  const db = getFirestore(getApp());
	  const querySnapshot = await getDocs(collection(db, 'templates'));
	  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	  // Filter hanya yang status publish
	  setTemplates(data.filter(t => t.status === 'publish'));
	} catch (err) {
	  // Optionally show toast or error
	} finally {
	  setLoadingTemplates(false);
	}
  };
  fetchTemplates();
}, []);
	useEffect(() => {
		// Real-time listener agar logo langsung update jika berubah di Firestore
		const docRef = doc(db, "settings", "webapp");
		const unsubscribe = import("firebase/firestore").then(({ onSnapshot }) => {
			return onSnapshot(docRef, (docSnap) => {
				if (docSnap.exists()) {
					setLogoUrl(docSnap.data().logoUrl);
				} else {
					setLogoUrl(null);
				}
			});
		});
		return () => {
			unsubscribe.then(u => u && u());
		};
	}, []);

	return (
		<>
			<Helmet>
				<title>Undangan Digital Modern & Elegan</title>
				<meta
					name="description"
					content="Pilih dari berbagai template undangan digital yang indah. Buat dan bagikan undangan pernikahan Anda dengan mudah."
				/>
				<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
				{/* Animasi stabilo untuk highlight */}
				  <style>{`
.animated-highlight {
  position: relative;
  display: inline-block;
  z-index: 0;
  color: #222;
  font-weight: bold;
  padding: 0.2em 0.4em; /* 🟡 padding atas-bawah dan kiri-kanan */
  border-radius: 0.3em;
}

.animated-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffe066;
  z-index: -1;
  transform: scaleX(0);
  transform-origin: left;
  animation: highlightOnce 1.2s ease-out forwards;
  border-radius: 0.25em;
}

@keyframes highlightOnce {
  to {
	transform: scaleX(1);
  }
}
  `}</style>
			</Helmet>
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-purple-900 text-white">
				{/* Header */}
				<header className="w-full px-8 py-6 flex items-center justify-between rounded-b-3xl relative">
					<div className="flex items-center gap-3">
						{logoUrl && (
							<img
								src={logoUrl}
								alt="Logo"
								className="max-h-12 max-w-32 object-contain"
								style={{ height: 'auto', width: 'auto', display: 'block' }}
							/>
						)}
					</div>
					{/* Desktop Nav */}
					<nav className="hidden md:flex gap-8 text-lg">
						<a
							href="/"
							className="hover:text-yellow-300 transition font-[Plus Jakarta Sans] font-light font-[600]"
						>
							Home
						</a>
						<a
							href="#templates"
							className="hover:text-yellow-300 transition font-[Plus Jakarta Sans] font-light font-[600]"
						>
							Template
						</a>
						<a
							href="/login"
							className="hover:text-yellow-300 transition font-[Plus Jakarta Sans] font-light font-[600]"
						>
							Login
						</a>
					</nav>
					{/* Hamburger Button (Mobile) */}
					<button
						className="md:hidden text-white focus:outline-none"
						onClick={() => setShowMobileNav((prev) => !prev)}
						aria-label="Toggle navigation"
					>
						<svg width="32" height="32" fill="none" viewBox="0 0 24 24">
							<path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					{/* Mobile Nav */}
					{showMobileNav && (
						<motion.div
					initial={{ y: 300 }}
					animate={{ y: 0 }}
					exit={{ y: 300 }}
					transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
							className="fixed left-0 bottom-0 w-full bg-gradient-to-t from-purple-900/100 to-purple-800/100 z-50 flex flex-col items-center gap-6 py-10 rounded-t-3xl"
						>
							{/* Overlay to close menu on outside touch */}
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowMobileNav(false)}
								style={{ touchAction: 'manipulation' }}
							/>
							<div className="relative z-50 w-full flex flex-col items-center gap-6">
								<a
									href="/"
									className="text-lg font-[Plus Jakarta Sans] font-light font-[600] hover:text-yellow-300 transition"
									onClick={() => setShowMobileNav(false)}
								>
									Home
								</a>
								<a
									href="#templates"
									className="text-lg font-[Plus Jakarta Sans] font-light font-[600] hover:text-yellow-300 transition"
									onClick={() => setShowMobileNav(false)}
								>
									Template
								</a>
								<a
									href="/login"
									className="text-lg font-[Plus Jakarta Sans] font-light font-[600] hover:text-yellow-300 transition"
									onClick={() => setShowMobileNav(false)}
								>
									Login
								</a>
							</div>
						</motion.div>
					)}
				</header>

				{/* Hero Section */}
				<section className="relative flex flex-col items-center justify-center text-center py-20 md:py-32 px-4 overflow-hidden">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1 }}
						className="z-10"
					>
						<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg font-playfair">
							Undangan Digital{' '}
							<span className="inline-block relative">
								<AnimatedWords
									words={['modern', 'elegan', 'terjangkau']}
								/>
							</span>
						</h1>
<p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-4 font-[Plus Jakarta Sans]">
							Pilih templatenya, cobain langsung secara gratis!
						</p>
<p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8 font-[Plus Jakarta Sans]">
  <span className="animated-highlight">
	Kalau nggk cocok, nggk usah bayar.
  </span>
</p>
						<a
						href="#templates"
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-lg hover:text-purple-700 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
						onClick={(e) => {
							e.preventDefault();
							const el = document.getElementById('templates');
							if (el) {
							el.scrollIntoView({ behavior: 'smooth' });
							}
						}}
						>
						Lihat Template
						<span className="transform transition-transform duration-300 group-hover:translate-x-1">
							➜
						</span>
						</a>
					</motion.div>
					{/* Animated background shapes */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.3 }}
						transition={{ duration: 1.5 }}
						className="absolute inset-0 w-full h-full pointer-events-none"
					>
						<svg
							className="absolute left-0 top-0 w-96 h-96 opacity-40 blur-2xl"
							viewBox="0 0 400 400"
							fill="none"
						>
							<circle
								cx="200"
								cy="200"
								r="180"
								fill="url(#paint0_radial)"
							/>
							<defs>
								<radialGradient
									id="paint0_radial"
									cx="0"
									cy="0"
									r="1"
									gradientTransform="translate(200 200) rotate(90) scale(180)"
								>
									<stop stopColor="#fff" stopOpacity="0.7" />
									<stop offset="1" stopColor="#a78bfa" stopOpacity="0.2" />
								</radialGradient>
							</defs>
						</svg>
						<svg
							className="absolute right-0 bottom-0 w-96 h-96 opacity-30 blur-2xl"
							viewBox="0 0 400 400"
							fill="none"
						>
							<ellipse
								cx="200"
								cy="200"
								rx="160"
								ry="100"
								fill="url(#paint1_radial)"
							/>
							<defs>
								<radialGradient
									id="paint1_radial"
									cx="0"
									cy="0"
									r="1"
									gradientTransform="translate(200 200) rotate(90) scale(160 100)"
								>
									<stop stopColor="#fff" stopOpacity="0.5" />
									<stop offset="1" stopColor="#f472b6" stopOpacity="0.1" />
								</radialGradient>
							</defs>
						</svg>
					</motion.div>
				</section>

				{/* Main Content */}
<main className="flex-1 p-8">
  <section id="templates" style={{ position: 'relative', width: '100%' }}>
	{loadingTemplates && (
	  <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: '220px', padding: '48px 0' }}>
		<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mb-4"></div>
		<div className="text-gray-300 text-lg">Memuat template...</div>
	  </div>
	)}
	{!loadingTemplates && templates.length === 0 && (
	  <div className="text-center text-gray-400 py-10 text-lg">Belum ada template yang tersedia.</div>
	)}
	{!loadingTemplates && templates.length > 0 && (
	  <div
	className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
	style={{ alignItems: 'stretch' }}
  >
		{templates.map((template, index) => (
		  <div key={template.id} className="flex">
			<TemplateCard template={template} />
		  </div>
		))}
	  </div>
	)}
  </section>
</main>

				{/* Footer */}
				<footer className="w-full bg-white/30 backdrop-blur-md text-center py-8 mt-12 border-t border-white/20 rounded-t-3xl">
					<div className="flex flex-col md:flex-row items-center justify-between px-8">
						<div className="mb-4 md:mb-0">
							<p className="text-gray-100">
								© {new Date().getFullYear()} Undangan Digital. Dibuat dengan{' '}
								<span className="text-pink-400">🧠</span>.
							</p>
						</div>
						<div className="flex gap-4">
<a
	href="https://instagram.com"
	target="_blank"
	rel="noopener noreferrer"
	className="hover:text-yellow-300 transition font-[Plus Jakarta Sans] font-light font-[300]"
							>
								Instagram
							</a>
<a
	href="mailto:info@undangan.digital"
	className="hover:text-yellow-300 transition font-[Plus Jakarta Sans] font-light font-[300]"
							>
								Email
							</a>
<a
	href="https://wa.me/628123456789"
	target="_blank"
	rel="noopener noreferrer"
	className="hover:text-yellow-300 transition font-[Plus Jakarta Sans] font-light font-[300]"
							>
								WhatsApp
							</a>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
};

export default Homepage;

function AnimatedWords({ words, interval = 1800 }) {
	const [index, setIndex] = useState(0);
	const [show, setShow] = useState(true);
	useEffect(() => {
		const timer = setInterval(() => {
			setShow(false);
			setTimeout(() => {
				setIndex((prev) => (prev + 1) % words.length);
				setShow(true);
			}, 350); // waktu animasi keluar
		}, interval);
		return () => clearInterval(timer);
	}, [words, interval]);
	return (
		<span
			className={`text-purple-400 font-bold transition-all duration-500 ${
				show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
			}`}
			style={{ display: 'inline-block' }}
		>
			{words[index]}
		</span>
	);
}