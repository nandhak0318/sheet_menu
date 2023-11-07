import NextAuth from "next-auth/next";
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import prisma from "../../../../prisma/client";

export const authOption = {
  theme:{
    colorScheme: "light",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? ""
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? ""
    })
  ],
  callbacks:{
    async signIn(data:any){
      try {
        console.log('maybe existing')
        let { user } = data
        console.log(user)
        let userCol = await prisma.user.findUnique({
          where: {
            email: user.email
          }
        })
        if (!userCol) {
          console.log('user created')
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name
            }
          })
        }
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    }
  }
}
export const handler = NextAuth(authOption)

export { handler as GET, handler as POST }
