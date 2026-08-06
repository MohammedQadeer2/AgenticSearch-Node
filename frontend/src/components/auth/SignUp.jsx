import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import GoogleIcon from "./GoogleIcon";

export default function SignUp({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/auth/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create account");
      onSuccess(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="text-sm font-medium text-indigo-300">Start for free</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Create your account</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">Set up your workspace in less than a minute.</p>
      <button type="button" className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm font-medium transition hover:bg-slate-800">
        <GoogleIcon />
        Continue with Google
      </button>
      <div className="my-7 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-700" />
        or sign up with email
        <span className="h-px flex-1 bg-slate-700" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Full name
          <span className="relative mt-2 block">
            <UserRound className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input name="name" value={form.name} onChange={updateForm} placeholder="Your name" className="w-full rounded-xl border border-slate-700 bg-[#0c1527] py-3 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-400" required />
          </span>
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Email address
          <span className="relative mt-2 block">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@example.com" className="w-full rounded-xl border border-slate-700 bg-[#0c1527] py-3 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-400" required />
          </span>
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Password
          <span className="relative mt-2 block">
            <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateForm} placeholder="Create a password" className="w-full rounded-xl border border-slate-700 bg-[#0c1527] py-3 pl-10 pr-11 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-400" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
        </label>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button disabled={isLoading} className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60">{isLoading ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-400">
        Already have an account? <button type="button" onClick={onSwitch} className="font-medium text-indigo-300">Sign in</button>
      </p>
    </div>
  );
}
