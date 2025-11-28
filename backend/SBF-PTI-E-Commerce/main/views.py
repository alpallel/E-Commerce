from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import F

from .models import *
from .serializers import *


class CustomTokenAuthentication(TokenAuthentication):
    keyword = 'Token'

    def get_model(self):
        return AuthToken

    def authenticate(self, request):
        # First try Authorization header
        auth = request.META.get('HTTP_AUTHORIZATION', '').split()
        if auth and auth[0].lower() == self.keyword.lower() and len(auth) == 2:
            try:
                token_obj = AuthToken.objects.get(token=auth[1])
                return (token_obj.user, token_obj)
            except AuthToken.DoesNotExist:
                return None
        
        # Fall back to cookie-based token
        token_value = request.COOKIES.get('auth_token')
        if token_value:
            try:
                token_obj = AuthToken.objects.get(token=token_value)
                return (token_obj.user, token_obj)
            except AuthToken.DoesNotExist:
                return None
        
        return None


class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('user_password')

        if not username or not password:
            return Response(
                {'error': 'username and user_password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Use the model's password checker
        if not getattr(user, 'check_password', lambda p: False)(password):
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Create or get auth token
        token, _ = AuthToken.objects.get_or_create(user=user)

        response = Response(
            {
                'message': 'Login successful',
                'user_id': str(user.user_id),
                'username': user.username,
                'token': token.token,
            },
            status=status.HTTP_200_OK
        )
        
        # Set token as HTTP-only cookie
        response.set_cookie(
            key='auth_token',
            value=token.token,
            httponly=True,
            samesite='Strict',
            max_age=86400 * 30  # 30 days
        )
        
        return response

class RegisterAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('user_password')

        if not username or not password:
            return Response(
                {'error': 'username and user_password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': f'Username \'{username}\' already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # create user, hash password via model helper
        user = User.objects.create(username=username)
        if hasattr(user, 'set_password'):
            user.set_password(password)
            user.save(update_fields=["user_password"])

        token = AuthToken.objects.create(user=user)

        response = Response(
            {
                'message': 'Registration successful',
                'user_id': str(user.user_id),
                'username': user.username,
                'token': token.token,
            },
            status=status.HTTP_201_CREATED
        )
        response.set_cookie(
            key='auth_token',
            value=token.token,
            httponly=True,
            samesite='Strict',
            max_age=86400 * 30  # 30 days
        )
        return response


class LogoutAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (CustomTokenAuthentication,)

    def post(self, request):
        response = Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
        
        # Delete the authentication cookie
        response.delete_cookie('auth_token')
        
        return response


class AllItemsAPIView(APIView):
    def get(self, request):
        items = Items.objects.all()
        serializer = ItemsSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ItemsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemDetailAPIView(APIView):
    def get_object(self, id):
        return get_object_or_404(Items, id=id)

    def get(self, request, id):
        item = self.get_object(id)
        serializer = ItemsSerializer(item)
        return Response(serializer.data)

    def put(self, request, id):
        item = self.get_object(id)
        serializer = ItemsSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = self.get_object(id)
        item.delete()
        return Response({'message': 'Item deleted successfully'}, status=status.HTTP_200_OK)


class CartAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (CustomTokenAuthentication,)

    def get(self, request):
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        # Use CartSerializer for consistent response
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        slug = request.data.get('slug')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (TypeError, ValueError):
            return Response({'error': 'quantity must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        if not slug:
            return Response({'error': 'slug is required'}, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Items, slug=slug)
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, item=item, defaults={'quantity': quantity})
        if not created:
            cart_item.quantity = F('quantity') + quantity
            cart_item.save()
            cart_item.refresh_from_db()

        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        slug = request.data.get('slug')
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)

        if slug:
            item = get_object_or_404(Items, slug=slug)
            cart_item = CartItem.objects.filter(cart=cart, item=item).first()
            if not cart_item:
                return Response({'error': 'item not in cart'}, status=status.HTTP_404_NOT_FOUND)
            cart_item.delete()
            serializer = CartSerializer(cart, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        # clear whole cart
        cart.cart_items.all().delete()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


