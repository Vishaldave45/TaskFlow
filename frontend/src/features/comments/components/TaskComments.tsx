import { Box, Flex, HStack, IconButton, Input, Stack, Text, Badge } from '@chakra-ui/react'
import { Send, Trash2 } from 'lucide-react'
import type { Comment, User } from '@/types'

interface TaskCommentsProps {
  comments: Comment[]
  currentUser: User | null
  isOwner: boolean
  newComment: string
  setNewComment: (val: string) => void
  onAddComment: (e: React.FormEvent) => void
  onDeleteComment: (commentId: number) => void
  submittingComment: boolean
}

export function TaskComments({
  comments,
  currentUser,
  isOwner,
  newComment,
  setNewComment,
  onAddComment,
  onDeleteComment,
  submittingComment,
}: TaskCommentsProps) {
  return (
    <Stack spacing={3}>
      <Stack spacing={2} maxH="200px" overflowY="auto">
        {comments.map((c) => {
          const canDelete = isOwner || c.author.id === currentUser?.id
          return (
            <Box
              key={c.id}
              p={2.5}
              bg="surface.subtle"
              borderRadius="sm"
              border="1px solid"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb={1}>
                <HStack spacing={1.5}>
                  <Text fontSize="xs" fontWeight="700" color="ink.primary">
                    {c.author.username}
                  </Text>
                  {c.author.id === currentUser?.id && (
                    <Badge variant="neutral" fontSize="3xs">
                      YOU
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={2}>
                  <Text fontSize="3xs" fontFamily="mono" color="ink.muted">
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {canDelete && (
                    <IconButton
                      aria-label="Delete note"
                      icon={<Trash2 size={11} />}
                      size="2xs"
                      variant="ghost"
                      color="state.error.text"
                      onClick={() => onDeleteComment(c.id)}
                    />
                  )}
                </HStack>
              </Flex>
              <Text fontSize="xs" color="ink.primary">
                {c.content}
              </Text>
            </Box>
          )
        })}

        {comments.length === 0 && (
          <Text fontSize="2xs" color="ink.muted" textAlign="center" py={3}>
            No notes posted yet.
          </Text>
        )}
      </Stack>

      <Flex as="form" onSubmit={onAddComment} gap={2}>
        <Input
          placeholder="Write note..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          size="sm"
        />
        <IconButton
          type="submit"
          aria-label="Send"
          icon={<Send size={13} />}
          variant="solid"
          size="sm"
          isLoading={submittingComment}
        />
      </Flex>
    </Stack>
  )
}
