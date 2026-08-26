import React from 'react'
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useActivityQuery } from '@/hooks/useActivity'
import { ActivityAction, ActivityLog } from '@/types/activity'
import { Activity, PlusCircle, Edit3, UserCheck, ArrowRightLeft, MessageCircle } from 'lucide-react'

interface ActivityTimelineProps {
  taskId: number
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ taskId }) => {
  const { data: logs = [], isLoading } = useActivityQuery(taskId)

  const renderActionDescription = (log: ActivityLog) => {
    switch (log.action) {
      case 'TASK_CREATED':
        return 'created this task'
      case 'STATUS_CHANGED':
        return `changed status ${log.details.from} → ${log.details.to}`
      case 'PRIORITY_CHANGED':
        return `changed priority ${log.details.from} → ${log.details.to}`
      case 'TASK_ASSIGNED':
        return 'reassigned this task'
      case 'COMMENT_ADDED':
        return 'commented on this task'
      case 'TASK_UPDATED':
        return 'updated task details'
      default:
        return 'updated this task'
    }
  }

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case 'TASK_CREATED':
        return <PlusCircle size={13} color="#31D6C5" />
      case 'STATUS_CHANGED':
      case 'PRIORITY_CHANGED':
        return <ArrowRightLeft size={13} color="#599eff" />
      case 'TASK_ASSIGNED':
        return <UserCheck size={13} color="#F2B84B" />
      case 'COMMENT_ADDED':
        return <MessageCircle size={13} color="#B4BCC8" />
      default:
        return <Edit3 size={13} color="#8B95A5" />
    }
  }

  return (
    <Box>
      <Flex alignItems="center" gap="2" mb="4">
        <Activity size={16} color="#8B95A5" />
        <Text fontSize="sm" fontWeight="600" color="fg.default">
          Activity Stream
        </Text>
      </Flex>

      <VStack gap="3" alignItems="stretch" position="relative">
        {logs.map((log) => (
          <Flex key={log.id} gap="3" alignItems="flex-start" fontSize="12px">
            <Box p="1" borderRadius="full" bg="bg.subtle" mt="0.5" flexShrink={0}>
              {getActionIcon(log.action)}
            </Box>
            <Box flex="1">
              <Text color="fg.default">
                <Text as="span" fontWeight="600">
                  {log.user.username}
                </Text>{' '}
                <Text as="span" color="fg.muted">
                  {renderActionDescription(log)}
                </Text>
              </Text>
              <Text fontSize="10px" color="fg.muted" mt="0.5">
                {new Date(log.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Box>
          </Flex>
        ))}

        {!isLoading && logs.length === 0 && (
          <Text fontSize="xs" color="fg.muted" py="2">
            No activity recorded yet.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
