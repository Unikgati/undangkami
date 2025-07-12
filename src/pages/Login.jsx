import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Loader2 } from 'lucide-react';

const Login = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const username = e.target.username.value;
        const password = e.target.password.value;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = '/admin';
            } else {
                toast({
                    title: "Login gagal",
                    description: data.error || "Username atau password salah.",
                    variant: "destructive"
                });
            }
        } catch (err) {
            toast({
                title: "Login gagal",
                description: "Terjadi kesalahan koneksi.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Login - Undangan Digital</title>
                <meta name="description" content="Masuk ke dashboard admin atau user." />
            </Helmet>
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-purple-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="w-full max-w-xl glass-effect text-white border-none shadow-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-sans">Login</CardTitle>
                            <CardDescription className="text-gray-300">Masukkan username dan kata sandi yang benar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" name="username" type="text" placeholder="username" className="bg-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" placeholder="••••••••" className="bg-white/10" />
                                </div>
                                <Button type="submit" className="w-full pulse-glow bg-white text-black hover:bg-gray-200 flex items-center justify-center" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="mr-2 h-4 w-4" /> Masuk
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default Login;