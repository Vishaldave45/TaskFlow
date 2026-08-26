import React, { useState } from 'react'
import { Box, Button, Flex, HStack, Text, Textarea, VStack } from '@chakra-ui/react'
import { useCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'
import { MessageSquare, Trash2, Send } from 'lucide-react'

interface CommentsSectionProps {
  taskId: number
  projectOwnerId?: number
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId, projectOwnerId }) => {
  const { data: comments = [], isLoading } = useCommentsQuery(taskId)
  const { mutate: createComment, isPending: isPosting } = useCreateCommentMutation(taskId)
  const { mutate: deleteComment } = useDeleteCommentMutation(taskId)
  const { user } = useAuth()
  const [content, setContent] = useState('')

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createComment(
      { content: content.trim() },
      {
        onSuccess: () => setContent(''),
      }
    )
  }

  return (
    <Box>
      <Flex alignItems="center" gap="2" mb="4">
        <MessageSquare size={16} color="#8B95A5" />
        <Text fontSize="sm" fontWeight="600" color="fg.default">
          Comments ({comments.length})
        </Text>
      </Flex>

      {/* Comment Form */}
      <Box as="form" onSubmit={handlePostComment} mb="6">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="sm"
          borderRadius="6px"
          bg="bg.subtle"
          borderColor="border.subtle"
          rows={2}
          fontSize="13px"
        />
        <Flex justifyContent="flex-end" mt="2">
          <Button
            type="submit"
            size="xs"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
            loading={isPosting}
            disabled={!content.trim()}
          >
            <Send size={12} style={{ marginRight: '4px' }} />
            Send
          </Button>
        </Flex>
      </Box>

      {/* Comments List */}
      <VStack gap="3" alignItems="stretch">
        {comments.map((comment) => {
          const isAuthor = user?.id === comment.author.id
          const isProjectOwner = user?.id === projectOwnerId
          const canDelete = isAuthor || isProjectOwner

          return (
            <Box
              key={comment.id}
              p="3"
              bg="bg.subtle"
              borderRadius="6px"
              border="1px solid"
              borderColor="border.subtle"
            >
              <Flex justifyContent="space-between" alignItems="flex-start">
                <HStack gap="2">
                  <Flex
                    w="5"
                    h="5"
                    borderRadius="full"
                    bg="brand.600"
                    color="white"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="10px"
                    fontWeight="600"
                  >
                    {comment.author.username.slice(0, 1).toUpperCase()}
                  </Flex>
                  <Text fontSize="12px" fontWeight="600" color="fg.default">
                    {comment.author.username}
                  </Text>
                  <Text fontSize="10px" color="fg.muted">
                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </HStack>

                {canDelete && (
                  <Button
                    size="2xs"
                    variant="ghost"
                    color="fg.muted"
                    _hover={{ color: '#F06A6A' }}
                    onClick={() => deleteComment(comment.id)}
                    title="Delete comment"
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </Flex>

              <Text fontSize="13px" color="fg.default" mt="2" whiteSpace="pre-wrap">
                {comment.content}
              </Text>
            </Box>
          )
        })}

        {!isLoading && comments.length === 0 && (
          <Text fontSize="xs" color="fg.muted" textAlign="center" py="4">
            No comments on this task yet.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
