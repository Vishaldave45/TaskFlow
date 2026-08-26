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

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      await registerUser(data)
      navigate('/')
    } catch (err: any) {
      const details = err.response?.data?.error?.details
      const msg =
        details?.email?.[0] ||
        details?.username?.[0] ||
        err.response?.data?.error?.message ||
        'Registration failed. Please check your details.'
      setErrorMsg(typeof msg === 'string' ? msg : 'Registration error.')
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
              Create your account
            </Heading>
            <Text fontSize="xs" color="fg.muted">
              Join TaskFlow to organize your engineering tasks.
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
              <Field.Root invalid={!!errors.username}>
                <Field.Label fontSize="xs" fontWeight="500">Username</Field.Label>
                <Input
                  {...register('username')}
                  placeholder="e.g. alex_dev"
                  size="sm"
                  borderRadius="6px"
                  bg="bg.subtle"
                  borderColor="border.subtle"
                />
                {errors.username && <Field.ErrorText fontSize="xs">{errors.username.message}</Field.ErrorText>}
              </Field.Root>

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
                  placeholder="Min. 8 characters"
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
                Create Account
                <ArrowRight size={14} style={{ marginLeft: '6px' }} />
              </Button>
            </Stack>
          </form>

          <Flex justifyContent="center" fontSize="xs" color="fg.muted" gap="1">
            <Text>Already have an account?</Text>
            <RouterLink to="/login" style={{ color: '#599eff', fontWeight: 600 }}>
              Sign in
            </RouterLink>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  )
}
