import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostForm from '@/components/posts/PostForm'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)

  if (isNaN(postId)) notFound()

  const supabase = await createClient()

  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, author_id, title, content, category_tool, category_task')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!post) notFound()
  if (!user || user.id !== post.author_id) redirect('/')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <PostForm
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          category_tool: post.category_tool,
          category_task: post.category_task,
        }}
      />
    </div>
  )
}
