import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import AnimatedBackground from "../components/AnimatedBackground.jsx";
import { roleOptions } from "../data/mockData.js";
import { useAuth } from "../context/AuthContext.jsx";

const modes = {
  login: {
    title: "Welcome back",
    button: "Sign in",
  },
  register: {
    title: "Create your workspace",
    button: "Create account",
  },
  forgot: {
    title: "Reset your password",
    button: "Send reset link",
  },
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: "admin@campus.edu",
      password: "Demo@1234",
      name: "Campus Admin",
      role: "Hostel Admin",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (mode === "register") {
      await signUp(values);
    } else if (mode === "forgot") {
      await requestPasswordReset(values.email);
    } else {
      await signIn(values);
    }

    navigate("/app/dashboard");
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <AnimatedBackground />
      <section className="relative mx-auto grid min-h-screen max-w-[1500px] items-center gap-8 px-4 py-8 md:px-8 lg:grid-cols-[0.95fr_0.85fr]">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/45">
            Secure access platform
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-6xl">
            {modes[mode].title}
          </h1>
          <p className="max-w-2xl text-lg text-white/65">
            Unified sign in for Super Admin, Hostel Admin, Mess Manager, Staff, and Student roles.
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(modes).map(([key, item]) => (
              <button key={key} type="button" onClick={() => setMode(key)} className={`rounded-full border px-4 py-2 text-sm transition ${mode === key ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}>
                {item.button}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-[32px] border border-white/10 bg-white/8 p-6 backdrop-blur-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60">Email</label>
              <input {...register("email", { required: true })} className="glass-input mt-2 w-full" placeholder="admin@campus.edu" />
              {errors.email ? <p className="mt-1 text-xs text-rose-300">Email is required</p> : null}
            </div>
            {mode !== "forgot" ? (
              <div>
                <label className="text-sm text-white/60">Password</label>
                <input type="password" {...register("password", { required: true, minLength: 8 })} className="glass-input mt-2 w-full" placeholder="••••••••" />
                {errors.password ? <p className="mt-1 text-xs text-rose-300">Password must be at least 8 characters</p> : null}
              </div>
            ) : null}
            {mode === "register" ? (
              <div>
                <label className="text-sm text-white/60">Full name</label>
                <input {...register("name", { required: true })} className="glass-input mt-2 w-full" placeholder="Campus Admin" />
              </div>
            ) : null}
            <div>
              <label className="text-sm text-white/60">Role</label>
              <select {...register("role")} className="glass-input mt-2 w-full">
                {roleOptions.map((role) => (
                  <option key={role} value={role} className="bg-ink-900">
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60">
              {isSubmitting ? "Working..." : modes[mode].button}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}