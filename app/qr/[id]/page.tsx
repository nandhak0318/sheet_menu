
import NavBar from "@/app/components/NavBar";
import QRCode from "react-qr-code";
import { useRouter } from 'next/router'

export default function Qr({ params }: { params: { id: string } }) {
  return (
    <>
    <NavBar/>
        <div className="hero-content" style={{ maxWidth:"500px", margin: "0 auto"}}>
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={`${process.env.BASE_URl}/qr/${params.id}`}
            viewBox={`0 0 256 256`}
          />
        </div>
    </>
  )
}