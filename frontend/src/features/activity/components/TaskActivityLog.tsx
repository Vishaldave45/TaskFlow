import { Box, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { CheckCircle } from 'lucide-react'
import type { ActivityLog } from '@/types'

interface TaskActivityLogProps {
  activity: ActivityLog[]
}

export function TaskActivityLog({ activity }: TaskActivityLogProps) {
  return (
    <Stack spacing={2} maxH="200px" overflowY="auto">
      {activity.map((log) => (
        <Flex
          key={log.id}
          gap={2.5}
          p={2}
          bg="surface.subtle"
          borderRadius="sm"
          align="start"
        >
          <Box mt={0.5}>
            <CheckCircle size={13} color="#173B36" />
          </Box>
          <Box flex="1">
            <HStack justify="space-between">
              <Text fontSize="xs" fontWeight="700" color="ink.primary">
                {log.user ? log.user.username : 'System'}
              </Text>
              <Text fontSize="3xs" fontFamily="mono" color="ink.muted">
                {new Date(log.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </HStack>
            <Text fontSize="2xs" color="ink.secondary">
              {log.action}
            </Text>
          </Box>
        </Flex>
      ))}

      {activity.length === 0 && (
        <Text fontSize="2xs" color="ink.muted" textAlign="center" py={3}>
          No activity logged yet.
        </Text>
      )}
    </Stack>
  )
}
