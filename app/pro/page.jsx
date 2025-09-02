
"use client";

import { useUser } from "../../lib/user.js";
import { apiBase } from "../../lib/api.js";

export default function ProPage(){
  const { token, user } = useUser();

  const checkout = async ()=>{
    if(!token){ return alert("Please login first."); }
    const r = await fetch(`${apiBase()}/api/billing/create-checkout-session`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json(); if(!r.ok){ alert(d.error || "Stripe not configured"); return; }
    window.location.href = d.url;
  };

  return (
    <div className="px-6 pb-16">
      <section className="max-w-3xl mx-auto card p-6 mt-10 text-center">
        <h2 className="text-3xl font-semibold">Go PRO</h2>
        <p className="text-gray-300 mt-2">Unlimited remixes • HD output • No watermark</p>
        <div className="mt-6 grid md:grid-cols-3 gap-4 text-left">
          <div className="card p-4"><div className="font-semibold">Free</div><ul className="list-disc ml-5 text-gray-300 text-sm mt-2"><li>Watermark</li><li>SD output</li><li>1 remix/day</li></ul></div>
          <div className="card p-4 border-white"><div className="font-semibold">Pro</div><ul className="list-disc ml-5 text-gray-300 text-sm mt-2"><li>No watermark</li><li>HD output</li><li>Priority queue</li></ul></div>
          <div className="card p-4"><div className="font-semibold">Future</div><ul className="list-disc ml-5 text-gray-300 text-sm mt-2"><li>Exclusive packs</li><li>Early access</li></ul></div>
        </div>
        <button onClick={checkout} className="btn mt-6">{user?.isPro ? "You are PRO" : "Upgrade via Stripe"}</button>
        <p className="text-xs text-gray-400 mt-2">Note: Configure Stripe keys in backend .env</p>
      </section>
    </div>
  );
}
