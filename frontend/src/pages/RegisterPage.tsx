import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { CheckSquare, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/api/client'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      await register({ username, email, password })
      navigate('/projects', { replace: true })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || 'Registration failed.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="canvas" py={{ base: 12, md: 24 }} display="flex" alignItems="center">
      <Container maxW="md">
        <Stack spacing={8}>
          {/* Header */}
          <Stack spacing={2} textAlign="center" align="center">
            <Flex
              w="48px"
              h="48px"
              bg="brand.primary"
              color="white"
              borderRadius="lg"
              align="center"
              justify="center"
              boxShadow="hardBrand"
            >
              <CheckSquare size={26} />
            </Flex>
            <Heading as="h1" size="xl" fontWeight="700" color="ink.primary" letterSpacing="tight">
              Create account
            </Heading>
            <Text fontSize="sm" color="ink.secondary">
              Get started with TaskFlow in seconds
            </Text>
          </Stack>

          {/* Form Card */}
          <Card p={2}>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  {error && (
                    <Alert status="error" borderRadius="md" py={2.5}>
                      <AlertIcon />
                      <AlertDescription fontSize="sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                      Username
                    </FormLabel>
                    <Input
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      autoFocus
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                      Email Address
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                      Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          p={1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="solid"
                    size="lg"
                    w="full"
                    mt={2}
                    isLoading={loading}
                    loadingText="Creating account..."
                    leftIcon={<UserPlus size={18} />}
                  >
                    Register & Continue
                  </Button>
                </Stack>
              </form>
            </CardBody>
          </Card>

          {/* Footer */}
          <HStack justify="center" spacing={1} fontSize="sm">
            <Text color="ink.secondary">Already have an account?</Text>
            <Button
              as={RouterLink}
              to="/login"
              variant="ghost"
              size="sm"
              color="brand.primary"
              fontWeight="600"
              leftIcon={<ArrowLeft size={14} />}
              p={1}
            >
              Sign In
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
