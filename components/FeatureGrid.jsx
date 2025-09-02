
export default function FeatureGrid(){
  const items=[
    { title:"Video Remix", desc:"Turn 5–15s clips into anime, sci-fi, or cartoon realities."},
    { title:"Trim & Submit", desc:"Pick start/end seconds to focus your best moment."},
    { title:"Fast Processing", desc:"Queue-based backend returns a shareable MP4."},
    { title:"Share Anywhere", desc:"One-tap share to Shorts, TikTok, Reels."},
    { title:"Pro Tier", desc:"HD output, no watermark, priority queue."},
    { title:"Stripe Ready", desc:"Checkout session + webhook to flip Pro on."},
  ];
  return (<section id="features" className="max-w-5xl mx-auto mt-16"><h3 className="text-2xl font-bold">Features</h3><div className="mt-5 grid md:grid-cols-3 gap-4">{items.map(it=>(<div key={it.title} className="card p-5"><div className="text-lg font-semibold">{it.title}</div><p className="text-gray-300 mt-1">{it.desc}</p></div>))}</div></section>);
}
