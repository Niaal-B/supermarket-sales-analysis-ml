import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatError } from '@/utils/errorFormatter'
import { ShieldCheck, Briefcase, User } from 'lucide-react'

const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    description: 'Full system access',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    value: 'sales_manager',
    label: 'Sales Manager',
    icon: Briefcase,
    description: 'Manage products & reports',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    value: 'staff',
    label: 'Staff',
    icon: User,
    description: 'Billing & inventory',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('staff')
  const [loading, setLoading] = useState(false)
  const { login, logout } = useAuth()
  const navigate = useNavigate()

  const activeRole = ROLES.find(r => r.value === selectedRole)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(username, password)

    if (result.success) {
      // Verify that the user's actual role matches the selected role
      if (result.user && result.user.role !== selectedRole) {
        // Log the user out immediately since the role doesn't match
        logout()
        toast.error(`Your account is registered as "${ROLES.find(r => r.value === result.user.role)?.label}". Please select the correct role.`)
        setLoading(false)
        return
      }
      toast.success('Login successful!')
      navigate('/dashboard')
    } else {
      const errorMessage = formatError(result.error)
      toast.error(errorMessage)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-large glass-effect border-0 relative z-10 animate-fade-in">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow transform transition-transform duration-300 hover:scale-105">
            <span className="text-4xl font-bold text-white">S</span>
          </div>
          <CardTitle className="heading-2 text-gray-900">Supermarket Sales</CardTitle>
          <CardDescription className="body-medium text-muted-foreground mt-2">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Selector */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <Label className="label-text">Sign in as</Label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => {
                  const Icon = role.icon
                  const isActive = selectedRole === role.value
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${isActive
                          ? `border-primary ${role.bg} shadow-sm`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? role.color : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {role.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {activeRole && (
                <p className="text-xs text-muted-foreground text-center animate-fade-in">
                  <span className={`font-semibold ${activeRole.color}`}>{activeRole.label}</span>: {activeRole.description}
                </p>
              )}
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="username" className="label-text">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="password" className="label-text">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-medium hover:shadow-large transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Sign In as ${activeRole?.label}`}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-6">
          <p className="body-small text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
