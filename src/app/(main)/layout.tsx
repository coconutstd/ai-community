import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginModalDynamic } from '@/components/auth/LoginModalDynamic'
import { AuthHydrator } from '@/components/auth/AuthHydrator'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col">
      <AuthHydrator
        user={user ? JSON.parse(JSON.stringify(user)) : null}
        profile={profile ? JSON.parse(JSON.stringify(profile)) : null}
      />
      <Header />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-[112px] py-8">
        {children}
      </main>
      <Footer />
      <LoginModalDynamic />
    </div>
  )
}
