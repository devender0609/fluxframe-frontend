
export default function HowItWorks(){
  const steps=[
    {n:1,t:"Upload a short video (5–15s) or record in-app."},
    {n:2,t:"Choose a Reality and (optional) trim points."},
    {n:3,t:"Submit—processing returns a shareable MP4."},
  ];
  return (<section id="how" className="max-w-5xl mx-auto mt-14"><h3 className="text-2xl font-bold">How it works</h3><div className="grid md:grid-cols-3 gap-4 mt-5">{steps.map(s=>(<div key={s.n} className="card p-5"><div className="text-4xl font-extrabold opacity-80">{s.n}</div><p className="text-gray-300 mt-2">{s.t}</p></div>))}</div></section>);
}
