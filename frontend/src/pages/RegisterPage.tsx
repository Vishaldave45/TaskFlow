import { useState } from 'react'
import {
  Box, Button, Container, FormControl, FormLabel, Heading, Input, InputGroup,
  InputRightElement, Stack, Text, HStack, Flex, Divider, SimpleGrid,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, AlertCircle, Terminal, ArrowUpRight } from 'lucide-react'
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
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return }
    setLoading(true)
    try {
      await register({ username, email, password })
      navigate('/projects', { replace: true })
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message || 'Registration failed.')
      else setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="canvas" display="flex" alignItems="center" py={{ base: 6, md: 12 }}>
      <Container maxW="container.lg">
        <SimpleGrid columns={{ base: 1, md: 12 }} bg="surface.base" border="1px solid" borderColor="border.dark" borderRadius="lg" boxShadow="tactile" overflow="hidden" minH="560px">
          <Flex gridColumn={{ base: 'span 1', md: 'span 5' }} bg="brand.primary" color="ink.inverse" p={{ base: 6, md: 10 }} direction="column" justify="space-between" borderRight={{ base: 'none', md: '1px solid' }} borderBottom={{ base: '1px solid', md: 'none' }} borderColor="border.dark">
            <Stack spacing={8}>
              <HStack spacing={2.5}>
                <Flex w="26px" h="26px" bg="surface.base" color="brand.primary" borderRadius="xs" align="center" justify="center">
                  <Terminal size={14} />
                </Flex>
                <Text fontFamily="mono" fontSize="xs" fontWeight="700" letterSpacing="widest">TASKFLOW</Text>
              </HStack>
              <Stack spacing={4}>
                <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" lineHeight="shorter" letterSpacing="tight" color="ink.inverse">
                  Create your workspace
                </Heading>
                <Text fontSize="xs" color="brand.subtle" lineHeight="base">
                  Start collaborating with your team across projects and tasks.
                </Text>
              </Stack>
            </Stack>
          </Flex>
          <Flex gridColumn={{ base: 'span 1', md: 'span 7' }} p={{ base: 6, md: 10 }} direction="column" justify="center" bg="surface.base">
            <Stack spacing={6} maxW="400px" mx="auto" w="full">
              <Heading as="h1" size="lg" fontWeight="700" color="ink.primary">Create Account</Heading>
              {error && (
                <Box bg="state.error.bg" border="1px solid" borderColor="state.error.border" p={3} borderRadius="sm">
                  <HStack spacing={2} align="start">
                    <AlertCircle size={15} color="#991B1B" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <Text fontSize="xs" color="state.error.text" fontWeight="500">{error}</Text>
                  </HStack>
                </Box>
              )}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3.5}>
                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">Username</FormLabel>
                    <Input type="text" placeholder="e.g. alex_rivera" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">Email Address</FormLabel>
                    <Input type="email" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">Password</FormLabel>
                    <InputGroup size="md">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <InputRightElement width="3rem">
                        <Button h="1.75rem" size="xs" variant="ghost" onClick={() => setShowPassword(!showPassword)} p={0}>
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <Button type="submit" variant="solid" size="md" w="full" mt={3} isLoading={loading} loadingText="Registering..." rightIcon={<ArrowRight size={15} />}>
                    Create Account
                  </Button>
                </Stack>
              </form>
              <Divider borderColor="border.default" />
              <HStack justify="space-between" fontSize="xs">
                <Text color="ink.secondary">Already have an account?</Text>
                <Button as={RouterLink} to="/login" variant="ghost" size="xs" fontWeight="600" color="brand.primary" rightIcon={<ArrowUpRight size={13} />}>Sign In</Button>
              </HStack>
            </Stack>
          </Flex>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
