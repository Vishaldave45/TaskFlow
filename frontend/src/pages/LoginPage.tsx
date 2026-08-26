import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { Layers, ArrowRight } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      await login(data)
      navigate('/')
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        'Invalid email or password.'
      setErrorMsg(typeof msg === 'string' ? msg : 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex minH="100vh" alignItems="center" justifyContent="center" bg="bg.canvas" p="4">
      <Box
        w="100%"
        maxW="400px"
        p="8"
        bg="bg.surface"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="12px"
        boxShadow="0 8px 30px rgba(0,0,0,0.3)"
      >
        <VStack gap="6" alignItems="stretch">
          {/* Logo & Headline */}
          <VStack gap="2" alignItems="flex-start">
            <Flex
              w="10"
              h="10"
              bg="brand.500"
              color="white"
              borderRadius="8px"
              alignItems="center"
              justifyContent="center"
              mb="1"
            >
              <Layers size={20} />
            </Flex>
            <Heading size="md" fontWeight="700" color="fg.default">
              Sign in to TaskFlow
            </Heading>
            <Text fontSize="xs" color="fg.muted">
              Enter your credentials to access your engineering workspace.
            </Text>
          </VStack>

          {errorMsg && (
            <Box p="3" bg="rgba(240, 106, 106, 0.12)" border="1px solid" borderColor="rgba(240, 106, 106, 0.3)" borderRadius="6px">
              <Text fontSize="xs" color="#F06A6A" fontWeight="500">
                {errorMsg}
              </Text>
            </Box>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="4">
              <Field.Root invalid={!!errors.email}>
                <Field.Label fontSize="xs" fontWeight="500">Email Address</Field.Label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="name@work-email.com"
                  size="sm"
                  borderRadius="6px"
                  bg="bg.subtle"
                  borderColor="border.subtle"
                />
                {errors.email && <Field.ErrorText fontSize="xs">{errors.email.message}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label fontSize="xs" fontWeight="500">Password</Field.Label>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  size="sm"
                  borderRadius="6px"
                  bg="bg.subtle"
                  borderColor="border.subtle"
                />
                {errors.password && <Field.ErrorText fontSize="xs">{errors.password.message}</Field.ErrorText>}
              </Field.Root>

              <Button
                type="submit"
                w="100%"
                size="sm"
                bg="brand.500"
                color="white"
                loading={isLoading}
                _hover={{ bg: 'brand.600' }}
                mt="2"
              >
                Sign In
                <ArrowRight size={14} style={{ marginLeft: '6px' }} />
              </Button>
            </Stack>
          </form>

          <Flex justifyContent="center" fontSize="xs" color="fg.muted" gap="1">
            <Text>Don't have an account?</Text>
            <RouterLink to="/register" style={{ color: '#599eff', fontWeight: 600 }}>
              Create an account
            </RouterLink>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  )
}
