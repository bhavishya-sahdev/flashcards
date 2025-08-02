import { Github, Linkedin, Mail, Menu, Terminal } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

export default function Navbar({ items, itemsRight }: { items: { href: string, label: string }[], itemsRight?: React.ReactNode[] }) {
    return <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <div className="mr-4 flex">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <div className="relative">
                        <Terminal className="h-7 w-7 text-white" />
                        <div className="absolute inset-0 h-7 w-7 animate-pulse bg-gray-500/20 rounded-full blur-sm"></div>
                    </div>
                    <span className="font-bold text-xl text-white">Bhavishya Sahdev</span>
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-300 transition-colors hover:text-gray-400"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Desktop Social Links */}
            <div className="ml-auto hidden md:flex items-center space-x-4">
                {itemsRight?.map((item) => (
                    item
                ))}
                <Link href="https://github.com/bhavishya-sahdev" className="text-gray-400 hover:text-gray-400 transition-colors">
                    <Github className="h-5 w-5" />
                </Link>
                <Link href="https://in.linkedin.com/in/bhavishya-sahdev" className="text-gray-400 hover:text-gray-400 transition-colors">
                    <Linkedin className="h-5 w-5" />
                </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="ml-auto md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] border-gray-800 bg-gray-900">
                        <div className="flex flex-col space-y-4 mt-8">
                            {/* Mobile Navigation Links */}
                            <nav className="flex flex-col space-y-4">
                                {items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-gray-300 hover:text-white transition-colors text-lg font-medium py-2 px-4 rounded-md hover:bg-gray-800/50"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Social Links */}
                            <div className="flex items-center px-4 space-x-4 pt-6 border-t border-gray-800">
                                <Link
                                    href="https://github.com/bhavishya-sahdev"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <Github className="h-6 w-6" />
                                </Link>
                                <Link
                                    href="https://in.linkedin.com/in/bhavishya-sahdev"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <Linkedin className="h-6 w-6" />
                                </Link>
                                <Link
                                    href="mailto:bhavishya@bhavishya.dev"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <Mail className="h-6 w-6" />
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    </header>
}