import React, { useEffect, useState } from 'react';
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
		description: 'Desain timeless dengan sentuhan modern.',
	},
	{
		id: 2,
		name: 'Modern Minimalis',
		image: 'modern-minimalist-template',
		description: 'Bersih, simpel, dan fokus pada detail.',
	},
	{
		id: 3,
		name: 'Rustik Romantis',
		image: 'rustic-romance-template',
		description: 'Nuansa alam yang hangat dan mempesona.',
	},
	{
		id: 4,
		name: 'Bunga Tropis',
		image: 'tropical-bloom-template',
		description: 'Ceria dan penuh warna seperti di surga tropis.',
	},
];

const TemplateCard = ({ template }) => {
	const handlePreview = (e) => {
		e.preventDefault();
		// ...toast logic...
	};
	return (
		<motion.div
			whileHover={{ y: -10, scale: 1.05 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="overflow-hidden glass-effect border-none shadow-2xl">
				<CardContent className="p-0">
					<img
						alt={template.name}
						className="w-full h-64 object-cover"
						src="https://images.unsplash.com/photo-1595872018818-97555653a011"
					/>
					<div className="p-6">
						<h3 className="text-xl font-playfair font-bold text-white">
							{template.name}
						</h3>
						<p className="text-gray-300 mt-2 text-sm">
							{template.description}
						</p>
						<div className="flex justify-between mt-6">
							<Button
								variant="outline"
								className="bg-transparent text-white border-white hover:bg-white hover:text-black transition-colors"
								onClick={handlePreview}
							>
								Preview
							</Button>
							<Link to={`/order/${template.id}`}>
								<Button className="bg-white text-black hover:bg-gray-200 pulse-glow">
									Coba Sekarang
								</Button>
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

const Homepage = () => {
	return (
		<>
			<Helmet>
				<title>Undangan Digital Modern & Elegan</title>
				<meta
					name="description"
					content="Pilih dari berbagai template undangan digital yang indah. Buat dan bagikan undangan pernikahan Anda dengan mudah."
				/>
			</Helmet>
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-purple-900 text-white">
				{/* Header */}
				<header className="w-full px-8 py-6 flex items-center justify-between rounded-b-3xl">
					<div className="flex items-center gap-3">
						<img
							src="/logo192.png"
							alt="Logo"
							className="h-10 w-10 rounded-full border border-purple-400"
						/>
					</div>
					<nav className="hidden md:flex gap-8 text-lg">
						<a
							href="/"
							className="hover:text-yellow-300 transition font-semibold font-[600]"
						>
							Home
						</a>
						<a
							href="#templates"
							className="hover:text-yellow-300 transition font-semibold font-[600]"
						>
							Template
						</a>
						<a
							href="/login"
							className="hover:text-yellow-300 transition font-semibold font-[600]"
						>
							Login
						</a>
					</nav>
				</header>

				{/* Hero Section */}
				<section className="relative flex flex-col items-center justify-center text-center py-20 md:py-32 px-4 overflow-hidden">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1 }}
						className="z-10"
					>
						<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg font-playfair">
							Undangan Digital{' '}
							<span className="inline-block relative">
								<AnimatedWords
									words={['modern', 'elegan', 'terjangkau']}
								/>
							</span>
						</h1>
						<p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8 font-sans">
							Buat undangan pernikahan digital dengan template premium,
							mudah, dan interaktif. Coba, preview, dan bagikan momen
							spesial Anda!
						</p>
						<a
							href="#templates"
							className="inline-block px-8 py-4 rounded-full bg-white text-purple-700 font-bold text-lg shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
							onClick={(e) => {
								e.preventDefault();
								const el = document.getElementById('templates');
								if (el) {
									el.scrollIntoView({ behavior: 'smooth' });
								}
							}}
						>
							Lihat Template
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
					<motion.div
						id="templates"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.8 }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
					>
						{templates.map((template, index) => (
							<motion.div
								key={template.id}
								initial={{ opacity: 0, y: 50 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: 0.8 + index * 0.2,
									duration: 0.5,
								}}
							>
								<TemplateCard template={template} />
							</motion.div>
						))}
					</motion.div>
				</main>

				{/* Footer */}
				<footer className="w-full bg-white/30 backdrop-blur-md text-center py-8 mt-12 border-t border-white/20 rounded-t-3xl">
					<div className="flex flex-col md:flex-row items-center justify-between px-8">
						<div className="mb-4 md:mb-0">
							<p className="text-gray-100">
								© {new Date().getFullYear()} Undangan Digital. Dibuat dengan{' '}
								<span className="text-pink-400">❤️</span>.
							</p>
						</div>
						<div className="flex gap-4">
							<a
								href="https://instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-yellow-300 transition"
							>
								Instagram
							</a>
							<a
								href="mailto:info@undangan.digital"
								className="hover:text-yellow-300 transition"
							>
								Email
							</a>
							<a
								href="https://wa.me/628123456789"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-yellow-300 transition"
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