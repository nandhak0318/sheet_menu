import { revalidatePath } from "next/cache"
import NavBar from "../components/NavBar"
import { getServerSession } from "next-auth"
import prisma from "../../prisma/client"
import { redirect } from "next/navigation"
import { google } from "googleapis"
const sheetApi = google.sheets('v4')
import { parser } from "../utils/parser"
import Link from "next/link"
import { writeFile } from "fs/promises"
import path from "path"


async function sheetapi(sheet_id: string, id: number) {
  "use server"
  // const keyfile = './creds/credentials.json'
    const keyfile = process.env.G_ALL || " "
    await writeFile(path.join(__dirname,'creds.json'),keyfile,'utf-8')
  const spreadSheetId = sheet_id
  const sheetName = 'Sheet1'
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'creds.json'),
    scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
  });

  const client = await auth.getClient();
  try {
    const sheetsResponse = await sheetApi.spreadsheets.get({
      spreadsheetId: sheet_id,
      auth: client,
    });

    const sheet = sheetsResponse.data.sheets?.find((s: any) => s.properties?.title === sheetName);
    if (!sheet) {
      console.log('Sheet not found.');
      return;
    }

    const range = `${sheetName}!A1:C${sheet.properties.gridProperties?.rowCount}`;

    const valuesResponse = await sheetApi.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range,
      auth: client,
    });

    const values = valuesResponse.data.values;
    if (!values || values.length === 0) {
      console.log('No data found.');
      return;
    }

    const data = values.map((row: any) => ({
      name: row[0],
      price: parseFloat(row[1]),
      image_url: row[2],
    }));
    const out = parser(data)
    await prisma.sheet.update({
      where:{
        id:id
      },
      data:{
        content:out
      }
    })
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function Sheet_item({ sheet_id, id }: { sheet_id: string, id: number }) {

  async function handle(formData: FormData) {
    "use server"
    const sheet = await prisma.sheet.findUnique({
      where: {
        id: id
      }
    })
    if (formData.get('edit') && sheet) {
      let shet_id = formData.get('sheet_id')?.toString()
      await prisma.sheet.update({
        where: {
          id: sheet.id
        },
        data: {
          sheet_id: shet_id
        }
      })
    }
    if (formData.get('delete') && sheet) {
      await prisma.sheet.delete({
        where: {
          id: sheet.id
        }
      })
    }
    if (formData.get("sync") && sheet) {

      await sheetapi(sheet?.sheet_id, sheet.id)
    }
    revalidatePath('/dashboard')
  }
  return (
    <>
      <form action={handle} className="flex flex-col p-3 gap-2 shadow-md items-center w-fit rounded-lg  md:flex-row">
        <input name="sheet_id" type="text" placeholder={sheet_id} defaultValue={sheet_id} className="input input-ghost w-96" />
        <div className="flex gap-1 min-w-fit">
          <button name="edit" value="ture" className="btn btn-info">EDIT</button>
          <button name="sync" value="sync" className="btn btn-warning">SYNC</button>
          <button name="delete" value="delete" className="btn btn-error">DELETE</button>
          <Link href={`/view/${id}`} className="btn btn-success">VIEW</Link>
          <Link href={`/qr/${id}`} className="btn btn-success">Qr</Link>
        </div>
      </form>
    </>
  )
}

export default async function Page() {
  const session = await getServerSession()
  if (!session) {
    redirect('/')
  }
  let email = session?.user?.email
  let sheets: any[] = []
  if (email) {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    sheets = await prisma.sheet.findMany({
      where: {
        userId: user?.id
      }
    })
  }
  async function create(formData: FormData) {
    "use server"
    const session = await getServerSession()
    const sheet_id = formData.get('sheet_id')?.toString()
    let email = session?.user?.email
    if (email && sheet_id) {
      const user = await prisma.user.findUnique({
        where: {
          email: email
        }
      })
      const sheet = await prisma.sheet.create({
        data: {
          sheet_id: sheet_id,
          userId: user?.id,
        }
      })
    }
    revalidatePath('/dashboard')
  }
  return (
    <>
      <NavBar />
      <main className=" flex-col hero-content gap-0">
        <section className="w-full  p-6 py-1 ">
          <h1 className="text-4xl font-bold tracking-tight text-green-400 sm:text-6xl">Sheets</h1>
          <div className="">
            {sheets.length == 0 ? 'no existing sheets found....' : ''}
            {sheets.map((sheet) => <Sheet_item key={sheet.id} id={sheet.id} sheet_id={sheet.sheet_id} />)}
          </div>
        </section>
        <section className="w-full  p-6 ">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Add new <span className="text-green-400">Sheet</span></h1>
          <form action={create} className="flex  items-center gap-1">
            <input name="sheet_id" type="text" placeholder="Enter Sheet Id" className="input input-bordered input-success w-full max-w-xs my-2" />
            <button className="btn btn-success">Create</button>
          </form>
        </section>
      </main>
    </>
  )
}