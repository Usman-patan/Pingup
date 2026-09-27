"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MessageSquare, Shield, Zap, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            {/* Navbar */}
            <nav className="absolute top-0 w-full z-50 px-6 py-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif">P</div>
                    <span className="font-semibold text-lg tracking-tight">PingUp</span>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:px-8 overflow-hidden">
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    {/* Badge */}
                    <div className="mb-8 flex justify-center fade-in">
                        <span className="relative inline-flex overflow-hidden rounded-full p-[1px]">
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#4D7C0F_50%,#E2E8F0_100%)]" />
                            <span className="inline-flex h-full w-full cursor-default items-center justify-center rounded-full bg-background px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-3xl">
                                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                                Redefining Communication
                            </span>
                        </span>
                    </div>

                    <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-7xl mb-8 leading-[1.1]">
                        Experience connection, <br />
                        <span className="text-primary relative inline-block">
                            naturally.
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>

                    <p className="mt-8 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
                        A serene messaging experience designed for clarity and peace of mind.
                        Fast, secure, and free from distractions.
                    </p>

                    <div className="mt-12 flex items-center justify-center gap-x-6">
                        <Authenticated>
                            <Button
                                size="lg"
                                className="rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
                                onClick={() => router.push("/conversations")}
                            >
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Go to Conversations
                            </Button>
                        </Authenticated>
                        <Unauthenticated>
                            <SignInButton mode="modal">
                                <Button
                                    size="lg"
                                    className="rounded-full px-8 py-6 text-lg bg-foreground text-background hover:bg-foreground/90 shadow-lg transition-all hover:-translate-y-1"
                                >
                                    Start Chatting
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full px-8 py-6 text-lg border-2 border-border text-foreground hover:bg-secondary/50 hover:border-foreground/20 transition-all"
                                >
                                    Register
                                </Button>
                            </SignUpButton>
                        </Unauthenticated>
                    </div>
                </div>

                {/* Abstract Background Gradient */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/20 to-secondary/40 rounded-full blur-[120px] -z-10 opacity-60" />
            </section>

            {/* Features Section */}
            <section className="py-24 bg-card/50 backdrop-blur-sm border-y border-border/50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-serif">Why Choose PingUp?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Built for modern teams and friends who value focus over noise.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-border/50">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                <Zap className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-foreground">Lightning Fast</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Real-time syncing powered by Convex ensures your messages land instantly, every time.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-border/50">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-foreground">Secure & Private</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Your conversations are yours alone. Built with industry-standard security practices.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-border/50">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-foreground">Naturally Beautiful</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A clean, distraction-free interface that helps you focus on what matters most: connection.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background py-12 border-t border-border">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif">P</div>
                            <span className="font-semibold text-lg tracking-tight">PingUp</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">KamalHussain (MRSF)</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} PingUp. Crafted with care.
                    </p>

                    <div className="flex gap-6">
                        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Next.js</a>
                        <a href="https://convex.dev" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Convex</a>
                        <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Clerk</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
