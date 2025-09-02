"use client";

import { useState } from "react";
import { apiBase } from "../../../lib/api.js";   // fixed path
import { useUser } from "../../../lib/user.js";  // fixed path
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { saveToken } = useUser();
  const router = useRouter();

  const submit = async () => {
    setErr("");
    try {
      const r = await fetch(`${apiBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Register failed");
      saveToken(d.token);
      router.push("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="px-6 pb-16">
      <section className="max-w-md mx-auto card p-6 mt-10">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <div className="mt-4">
          <input
            className="w-full rounded bg-white/10 border border-white/10 px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <input
            type="password"
            className="w-full rounded bg-white/10 border border-white/10 px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <p className="text-red-300 mt-2">{err}</p>}
        <button onClick={submit} className="btn mt-4 w-full">
          Create account
        </button>
        <p className="text-sm text-gray-300 mt-3">
          Have an account? <a className="underline" href="/auth/login">Login</a>
        </p>
      </section>
    </div>
  );
}
