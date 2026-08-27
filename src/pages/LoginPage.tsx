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
  HStack,
  Flex,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { CheckSquare, Eye, EyeOff, LogIn, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/api/client'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/projects'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid email or password.')
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
              Welcome back
            </Heading>
            <Text fontSize="sm" color="ink.secondary">
              Sign in to your TaskFlow workspace
            </Text>
          </Stack>

          {/* Form Card */}
          <Card p={2}>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  {error && (
                    <Box bg="state.error.bg" border="1px solid" borderColor="state.error.border" p={3} borderRadius="md">
                      <HStack spacing={2} align="start">
                        <AlertCircle size={16} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <Text fontSize="sm" color="state.error.text" fontWeight="500">
                          {error}
                        </Text>
                      </HStack>
                    </Box>
                  )}

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
                      autoFocus
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                      Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
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
                    loadingText="Signing in..."
                    leftIcon={<LogIn size={18} />}
                  >
                    Sign In
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    w="full"
                    onClick={() => {
                      setEmail('demo@taskflow.dev')
                      setPassword('password123')
                    }}
                  >
                    Use Demo Credentials (demo@taskflow.dev)
                  </Button>
                </Stack>
              </form>
            </CardBody>
          </Card>

          {/* Footer */}
          <HStack justify="center" spacing={1} fontSize="sm">
            <Text color="ink.secondary">Don't have an account?</Text>
            <Button
              as={RouterLink}
              to="/register"
              variant="ghost"
              size="sm"
              color="brand.primary"
              fontWeight="600"
              rightIcon={<ArrowRight size={14} />}
              p={1}
            >
              Create Account
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
