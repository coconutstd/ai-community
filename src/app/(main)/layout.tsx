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
    <>
      <AuthHydrator
        user={user ? JSON.parse(JSON.stringify(user)) : null}
        profile={profile ? JSON.parse(JSON.stringify(profile)) : null}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
      <Footer />
      <LoginModalDynamic />
    </>
  )
}
