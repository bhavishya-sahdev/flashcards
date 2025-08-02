import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Checkbox } from "../ui/checkbox"

export function SignInDialog({ triggerLabel = "Auth" }: {
    triggerLabel?: string
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="rounded-none" >{triggerLabel}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sign In</DialogTitle>
                        <DialogDescription>
                            Enter your email below to login to your account
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                value={email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="#"
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>

                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                autoComplete="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                onClick={() => {
                                    setRememberMe(!rememberMe);
                                }}
                            />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>



                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            onClick={async () => {
                                await signIn.email(
                                    {
                                        email,
                                        password
                                    },
                                    {
                                        onRequest: (ctx) => {
                                            setLoading(true);
                                        },
                                        onResponse: (ctx) => {
                                            setLoading(false);
                                        },
                                    },
                                );
                            }}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <p> Login </p>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </form>
        </Dialog>
    )
}
