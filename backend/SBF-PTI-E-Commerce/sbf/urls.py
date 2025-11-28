from django.contrib import admin
from django.urls import path
from main.views import *


urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('',
          AllItemsAPIView.as_view(), name='item_list'),
    path('item_list/',
          AllItemsAPIView.as_view(), name='item_list'),
    path('item/<int:id>/', ItemDetailAPIView.as_view(), name='item_detail'),
    path('cart/', CartAPIView.as_view(), name='cart'),
]
