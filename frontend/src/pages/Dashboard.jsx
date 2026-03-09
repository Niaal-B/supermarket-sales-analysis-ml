import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/AppLayout'
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-3 shadow-xl rounded-xl">
        {label && (
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            {new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-sm font-bold text-gray-900">
              {entry.name}: <span className="text-primary">{currency ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [shopCount, setShopCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [salesData, setSalesData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [salesSummary, setSalesSummary] = useState({
    total_revenue: 0,
    total_sales: 0,
    average_sale: 0,
  })
  const role = user?.role
  const isStaff = role === 'staff'
  const isAdmin = role === 'admin'
  const isSalesManager = role === 'sales_manager'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Set date range for last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const params = new URLSearchParams({
        period: 'daily',
        start_date: startDateStr,
        end_date: endDateStr,
      })

      // If user is not admin, filter by their shop
      if (user?.role !== 'admin' && user?.shop) {
        const shopId = typeof user.shop === 'object' ? user.shop.id : user.shop
        if (shopId) {
          params.append('shop_id', shopId.toString())
        }
      }

      // Fetch data in parallel
      const apiCalls = [
        api.get('/shops/').catch(() => ({ data: [] })),
        api.get('/products/categories/').catch(() => ({ data: [] })),
        api.get('/products/').catch(() => ({ data: [] })),
      ]

      // Only fetch sales reports if not staff
      if (!isStaff) {
        apiCalls.push(api.get(`/sales/reports/?${params.toString()}`).catch(() => ({ data: null })))
        apiCalls.push(api.get(`/sales/reports/payment-methods/?${params.toString()}`).catch(() => ({ data: { data: [] } })))
        apiCalls.push(api.get(`/sales/reports/top-products/?${params.toString()}&limit=5`).catch(() => ({ data: { data: [] } })))
      }

      const results = await Promise.all(apiCalls)

      const [shopsRes, categoriesRes, productsRes] = results
      const salesRes = isStaff ? { data: null } : results[3]
      const paymentRes = isStaff ? { data: { data: [] } } : results[4]
      const topProductsRes = isStaff ? { data: { data: [] } } : results[5]

      setShopCount(shopsRes.data.length)
      setCategoryCount(categoriesRes.data.length)
      setProductCount(productsRes.data.length)

      if (salesRes.data) {
        setSalesData(salesRes.data.data || [])
        setSalesSummary({
          total_revenue: salesRes.data.summary?.total_revenue || 0,
          total_sales: salesRes.data.summary?.total_sales || 0,
          average_sale: salesRes.data.summary?.average_sale || 0,
        })
      }

      setPaymentData(paymentRes.data.data || [])
      setTopProducts(topProductsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isAdmin && 'Admin Overview'}
            {isSalesManager && 'Sales Manager Dashboard'}
            {isStaff && 'Staff Workspace'}
          </h2>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* ADMIN DASHBOARD */}
        {isAdmin && (
          <>
            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-slate-900 to-slate-700 text-white animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="label-text text-slate-100">Total Shops</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{shopCount}</div>
                  <p className="caption text-slate-200/80">Active shops</p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-blue-600 to-indigo-600 text-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="label-text text-blue-50">Total Categories</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{categoryCount}</div>
                  <p className="caption text-blue-100/80">Product categories</p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-emerald-500 to-emerald-600 text-white animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="label-text text-emerald-50">Total Products</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{productCount}</div>
                  <p className="caption text-emerald-100/80">Products in catalog</p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-soft bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="label-text text-fuchsia-50">Total Revenue (30d)</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {loading ? '...' : formatCurrency(salesSummary.total_revenue)}
                  </div>
                  <p className="caption text-fuchsia-100/80">Across all shops</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Sales KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-soft bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales (30d)</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : salesSummary.total_sales}</div>
                  <p className="text-xs text-muted-foreground mt-1">Transactions across all shops</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Ticket Size</CardTitle>
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : formatCurrency(salesSummary.average_sale)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
                  <TrendingUp className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {salesData.length > 1 && !loading
                      ? salesData[salesData.length - 1].total_revenue > salesData[0].total_revenue
                        ? '↑'
                        : '↓'
                      : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">vs start of period</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Charts */}
            {!loading && (
              <div className="space-y-6 mb-8">
                {salesData.length > 0 && (
                  <Card className="border-0 shadow-soft overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="heading-4 text-white">Daily Revenue Trend</CardTitle>
                          <CardDescription className="text-slate-200">
                            How much you made each day (Last 30 days)
                          </CardDescription>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg text-emerald-300">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8 pb-4 bg-slate-950/40">
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis
                            dataKey="period"
                            tickFormatter={formatDate}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 13 }}
                            dy={10}
                          />
                          <YAxis
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 13 }}
                          />
                          <Tooltip content={<CustomTooltip currency={true} />} />
                          <Area
                            type="monotone"
                            dataKey="total_revenue"
                            stroke="#22c55e"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                            name="Revenue"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Admin Top Products */}
            {!loading && topProducts.length > 0 && (
              <Card className="mb-8 border-0 shadow-soft overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-slate-700/70">
                  <CardTitle className="heading-4 text-white">Bestselling Items</CardTitle>
                  <CardDescription className="text-slate-200">
                    Which products are moving the fastest (Last 30 days)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-4 bg-slate-950/40">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1f2937" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="product_name"
                        type="category"
                        width={180}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#e5e7eb', fontSize: 13, fontWeight: 500 }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#020617', opacity: 0.4 }} />
                      <Bar
                        dataKey="total_quantity"
                        fill="url(#colorBar)"
                        name="Quantity Sold"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        barSize={30}
                      >
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* SALES MANAGER DASHBOARD */}
        {isSalesManager && (
          <>
            {/* Manager Focus Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-soft bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-emerald-900">Your Assigned Shop</CardTitle>
                    <CardDescription className="text-emerald-700">
                      You are responsible for this location
                    </CardDescription>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-6 9 6-9 6-9-6zm9 6v6" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold text-emerald-900 mb-1">
                    {user?.shop?.name || 'No shop assigned'}
                  </div>
                  <p className="text-xs text-emerald-800/80">
                    Contact admin if this assignment is incorrect.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-50 to-sky-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-sky-900">Sales (Last 30 days)</CardTitle>
                  <TrendingUp className="h-5 w-5 text-sky-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-900">
                    {loading ? '...' : formatCurrency(salesSummary.total_revenue)}
                  </div>
                  <p className="text-xs text-sky-800/80 mt-1">Revenue for your shop</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-gradient-to-br from-amber-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900">Average Bill</CardTitle>
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-900">
                    {loading ? '...' : formatCurrency(salesSummary.average_sale)}
                  </div>
                  <p className="text-xs text-amber-800/80 mt-1">Per customer transaction</p>
                </CardContent>
              </Card>
            </div>

            {/* Manager Charts */}
            {!loading && (
              <div className="space-y-6 mb-8">
                {salesData.length > 0 && (
                  <Card className="border-0 shadow-soft overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="heading-4 text-gray-900">Daily Sales Trend</CardTitle>
                          <CardDescription>Simple view of your shop&apos;s daily revenue</CardDescription>
                        </div>
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenueManager" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="period"
                            tickFormatter={formatDate}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 13 }}
                            dy={10}
                          />
                          <YAxis
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 13 }}
                          />
                          <Tooltip content={<CustomTooltip currency={true} />} />
                          <Area
                            type="monotone"
                            dataKey="total_revenue"
                            stroke="#0ea5e9"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRevenueManager)"
                            animationDuration={1500}
                            name="Revenue"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Manager Tips */}
            <Card className="border-0 shadow-soft bg-gradient-to-br from-sky-50 to-emerald-50 mb-4">
              <CardHeader>
                <CardTitle className="heading-4 text-gray-900">Next Best Actions</CardTitle>
                <CardDescription>
                  Quick suggestions based on your recent performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <p>• Review low-performing products and consider promotions or repositioning.</p>
                <p>• Monitor payment mix and ensure POS and UPI channels are always available.</p>
                <p>• Track peak hours using sales trends and optimize staffing accordingly.</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* STAFF DASHBOARD */}
        {isStaff && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-sky-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-900">Today&apos;s Overview</CardTitle>
                    <CardDescription>Quick snapshot of key context</CardDescription>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-700">
                    <div>
                      <p className="font-semibold">Shops</p>
                      <p className="text-lg font-bold text-gray-900">{shopCount}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Categories</p>
                      <p className="text-lg font-bold text-gray-900">{categoryCount}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Products</p>
                      <p className="text-lg font-bold text-gray-900">{productCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-900">Your Role</CardTitle>
                  <CardDescription className="text-emerald-800/80">
                    Day-to-day responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-emerald-900 space-y-1">
                  <p>• Record sales accurately and issue bills.</p>
                  <p>• Keep track of stock-outs and inform your manager.</p>
                  <p>• Maintain cleanliness and customer experience at the counter.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-gradient-to-br from-amber-50 to-orange-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900">Quick Shortcuts</CardTitle>
                  <CardDescription className="text-amber-800/80">
                    Frequently used sections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-amber-900">
                    <li>• Go to `Sales` to create a new bill.</li>
                    <li>• Use `Inventory` to quickly check product availability.</li>
                    <li>• View `Transfers` to track stock movements.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-sky-50">
              <CardHeader>
                <CardTitle className="heading-3 text-gray-900">Welcome to your workspace</CardTitle>
                <CardDescription className="body-medium mt-2">
                  Focused view for billing and shop operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="body-medium text-gray-700">
                  Use the sidebar on the left to quickly move between billing, products, and inventory.
                  This dashboard is simplified for speed so you can complete customer checkouts without distraction.
                  For detailed analytics and configuration, your manager or admin can use their dashboards.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}

