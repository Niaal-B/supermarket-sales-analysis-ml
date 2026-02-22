import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/AppLayout'

export default function Dashboard() {
  const { user } = useAuth()
  const [shopCount, setShopCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [productCount, setProductCount] = useState(0)

  useEffect(() => {
    // Fetch shop count
    api.get('/shops/')
      .then(response => {
        setShopCount(response.data.length)
      })
      .catch(() => {
        // Silently fail - just show 0
      })
    
    // Fetch category count
    api.get('/products/categories/')
      .then(response => {
        setCategoryCount(response.data.length)
      })
      .catch(() => {
        // Silently fail - just show 0
      })
    
    // Fetch product count
    api.get('/products/')
      .then(response => {
        setProductCount(response.data.length)
      })
      .catch(() => {
        // Silently fail - just show 0
      })
  }, [])

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-white to-green-50/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="label-text text-gray-700">Total Shops</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-glow">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{shopCount}</div>
              <p className="caption">Active shops</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-white to-blue-50/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="label-text text-gray-700">Total Categories</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-glow-blue">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{categoryCount}</div>
              <p className="caption">Product categories</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-white to-indigo-50/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="label-text text-gray-700">Total Products</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-glow-blue">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{productCount}</div>
              <p className="caption">Products in catalog</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-white to-amber-50/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="label-text text-gray-700">Low Stock Items</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-medium">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <p className="caption">Items need restocking</p>
            </CardContent>
          </Card>
        </div>


        {/* Welcome Card */}
        <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-primary/5">
          <CardHeader>
            <CardTitle className="heading-3 text-gray-900">Welcome to Supermarket Sales System</CardTitle>
            <CardDescription className="body-medium mt-2">
              Manage your supermarket operations efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="body-medium text-gray-700">
              This is your dashboard. Use the sidebar to navigate to different sections. 
              Here you can view key metrics and manage shops, products, sales, and inventory.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

