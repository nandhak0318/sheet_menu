import NavBar from "@/app/components/NavBar";
import prisma from "../../../prisma/client"
import Link from 'next/link';
export default async function View({ params }: { params: { id: string } }) {
  const content = await prisma.sheet.findUnique({
    where:{
      id: parseInt(params.id)
    }
  })
  return(
    <>
    <NavBar/>
      <main className="hero-content place-items-center justify-center items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-full">
    {content?.content.map((c,i:number)=>{
      return(
        <div className="card max-w-sm max-w-fit bg-base-100 shadow-xl" key={i}>
            <figure className="max-h-36 max-w-36"><img src={c?.image_url} alt={c?.name} /></figure>
            <div className="card-body">
              <h2 className="card-title font-bold">{c?.name.toUpperCase()}</h2>
              <p className="font-semibold">Price: <span className="">{c?.price}</span></p>
            </div>
          </div>
      )
    })}

        <div className="toast toast-end">
          <Link href={`${process.env.BASE_URL}/qr/${params.id}`} className="btn font-bold">SHOW QR</Link>
        </div>
    </main>
    </>
  )
}