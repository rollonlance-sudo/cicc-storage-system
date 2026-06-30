import { Head, useForm } from '@inertiajs/react';
import { Building2, LoaderCircle, Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Sign in — CICC Storage System" />

            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Brand panel */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(222,47%,13%)] p-10 text-white lg:flex">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
                        aria-hidden
                    />
                    <div className="relative flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-400 text-[hsl(222,47%,13%)]">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold tracking-tight">CICC Storage System</p>
                            <p className="text-xs text-white/60">Secure Document Storage and Tracking</p>
                        </div>
                    </div>

                    <div className="relative max-w-md">
                        <h2 className="text-3xl font-semibold tracking-tight">Official document records, organized and secure.</h2>
                        <p className="mt-3 text-sm text-white/70">
                            Manage procurement files, finance documents, and official office papers with end-to-end tracking, security
                            classifications, and a complete audit trail.
                        </p>
                        <ul className="mt-6 space-y-3 text-sm text-white/80">
                            <li className="flex items-center gap-2"><Building2 className="size-4 text-amber-400" /> Department-wide records management</li>
                            <li className="flex items-center gap-2"><Lock className="size-4 text-amber-400" /> Confidential &amp; restricted file controls</li>
                            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-amber-400" /> Tracking numbers on every record</li>
                        </ul>
                    </div>

                    <p className="relative text-xs text-white/50">Authorized personnel only. All access is monitored and logged.</p>
                </div>

                {/* Form panel */}
                <div className="bg-background flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl">
                                <ShieldCheck className="size-6" />
                            </div>
                            <div>
                                <p className="font-semibold">CICC Storage System</p>
                                <p className="text-muted-foreground text-xs">Secure Document Storage and Tracking</p>
                            </div>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Enter your credentials to access the records system.</p>

                        {status && (
                            <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        <form className="mt-6 flex flex-col gap-5" onSubmit={submit}>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@agency.gov"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-sm font-normal">Remember me on this device</Label>
                            </div>

                            <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </form>

                        <div className="text-muted-foreground mt-8 flex items-center gap-2 rounded-md border border-dashed p-3 text-xs">
                            <Lock className="size-3.5 shrink-0" />
                            Authorized personnel only. Unauthorized access is prohibited.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
