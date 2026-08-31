import { Flex, HStack, Progress, Text } from '@chakra-ui/react'
import { CheckCircle2 } from 'lucide-react'
import { MetaLabel, WorkroomSurface } from '@/components/ui'

interface ProjectStatsProps {
  totalTasks: number
  completedTasks: number
}

export function ProjectStats({
  totalTasks,
  completedTasks,
}: ProjectStatsProps) {
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <WorkroomSurface variant="subtle" p={3.5} mb={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <CheckCircle2 size={13} color="#173B36" />
          <MetaLabel variant="brand">SPRINT COMPLETION</MetaLabel>
        </HStack>
        <Text
          fontSize="2xs"
          fontFamily="mono"
          fontWeight="600"
          color="ink.primary"
        >
          {completedTasks} / {totalTasks} TASKS COMPLETED ({progressPercent}%)
        </Text>
      </Flex>
      <Progress
        value={progressPercent}
        size="xs"
        colorScheme="green"
        borderRadius="none"
      />
    </WorkroomSurface>
  )
}
