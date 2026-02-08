"""
URL patterns for sales app
"""
from django.urls import path
from .views import SaleListCreateView, SaleRetrieveView

app_name = 'sales'

urlpatterns = [
    path('', SaleListCreateView.as_view(), name='sale-list-create'),
    path('<int:pk>/', SaleRetrieveView.as_view(), name='sale-detail'),
]

