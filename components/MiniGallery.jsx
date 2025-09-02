
export default function MiniGallery(){
  const items=[
    {src:"/images/anime-preview.png",label:"Anime"},
    {src:"/images/scifi-preview.png",label:"Sci-Fi"},
    {src:"/images/cartoon-preview.png",label:"Cartoon"},
  ];
  return (<section id="gallery" className="max-w-5xl mx-auto mt-16"><h3 className="text-2xl font-bold">Preview</h3><div className="grid md:grid-cols-3 gap-4 mt-5">{items.map(it=>(<figure key={it.label} className="card overflow-hidden"><img src={it.src} alt={it.label} className="w-full h-48 object-cover"/><figcaption className="px-4 py-3 text-sm text-gray-300">{it.label}</figcaption></figure>))}</div></section>);
}
