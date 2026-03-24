'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PostEditorProps {
  initialContent?: string
  onChange: (html: string) => void
  onMediaUpload?: (mediaId: string) => void
}

const MAX_CHARACTERS = 10000

export function PostEditor({ initialContent = '', onChange, onMediaUpload }: PostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
      CharacterCount.configure({ limit: MAX_CHARACTERS }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-4 prose max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('이미지는 10MB 이하만 업로드할 수 있습니다.')
      return
    }

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'png'
    const uuid = crypto.randomUUID()
    const path = `${user.id}/${uuid}.${ext}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          uploader_id: user.id,
          storage_path: path,
          file_type: file.type,
          file_size: file.size,
          is_used: false,
        })
        .select('id')
        .single()

      if (mediaError) throw mediaError

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)

      editor?.commands.setImage({ src: urlData.publicUrl })
      onMediaUpload?.(mediaData.id)
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      toast.error('이미지 업로드에 실패했습니다.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // 같은 파일 재선택을 허용하기 위해 초기화
    e.target.value = ''
  }

  const characterCount = editor?.storage.characterCount?.characters?.() ?? 0
  const isOverLimit = characterCount >= MAX_CHARACTERS

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-1 border-b bg-gray-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            'rounded px-2 py-1 text-sm font-bold transition-colors',
            editor?.isActive('bold')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          aria-label="굵게"
          aria-pressed={editor?.isActive('bold')}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            'rounded px-2 py-1 text-sm italic transition-colors',
            editor?.isActive('italic')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          aria-label="기울임"
          aria-pressed={editor?.isActive('italic')}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={cn(
            'rounded px-2 py-1 text-sm font-mono transition-colors',
            editor?.isActive('code')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          aria-label="코드"
          aria-pressed={editor?.isActive('code')}
        >
          {'</>'}
        </button>
        <div className="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="이미지 업로드"
        >
          이미지
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* 에디터 영역 */}
      <EditorContent editor={editor} />

      {/* 글자 수 카운터 */}
      <div
        className={cn(
          'border-t px-4 py-1.5 text-right text-xs',
          isOverLimit ? 'text-red-500' : 'text-gray-400'
        )}
        aria-live="polite"
        aria-label={`글자 수: ${characterCount} / ${MAX_CHARACTERS}`}
      >
        {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
      </div>
    </div>
  )
}
