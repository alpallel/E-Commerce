from decimal import Decimal

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import *


class UserSerializer(serializers.ModelSerializer):
    user_password = serializers.CharField(write_only=True, required=False)
    user_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = User
        fields = ("user_id", "username", "user_password", "user_picture", "created_at")
        read_only_fields = ("created_at",)

    def create(self, validated_data):
        # extract password so we can hash it using model helper
        password = validated_data.pop("user_password", None)
        user = User.objects.create(**validated_data)
        if password is not None:
            user.set_password(password)
            user.save(update_fields=["user_password"])
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get("username", instance.username)
        password = validated_data.get("user_password", None)
        if password is not None:
            instance.set_password(password)
            instance.save(update_fields=["user_password"])
        instance.user_picture = validated_data.get("user_picture", instance.user_picture)
        instance.save()
        return instance


class ItemsSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model = Items
        fields = ("item_id", "item_name", "item_description", "item_picture", "price", "created_at", "updated_at", "slug")
        read_only_fields = ("created_at", "updated_at")


class CartItemSerializer(serializers.ModelSerializer):
    item = ItemsSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=Items.objects.all(), source="item", write_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "item", "item_id", "quantity")
        read_only_fields = ("id", "item")

    def create(self, validated_data):
        return CartItem.objects.create(**validated_data)
    def validate_quantity(self, value):
        if value is None:
            return 1
        try:
            if int(value) < 1:
                raise ValidationError("quantity must be >= 1")
        except (TypeError, ValueError):
            raise ValidationError("quantity must be an integer")
        return int(value)

    def update(self, instance, validated_data):
        item = validated_data.get("item")
        if item is not None:
            instance.item = item
        qty = validated_data.get("quantity")
        if qty is not None:
            instance.quantity = int(qty)
        instance.save()
        return instance

class CartSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    cart_items = CartItemSerializer(many=True, required=False)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "user", "cart_items", "total_price")

    def create(self, validated_data):
        cart_items_data = validated_data.pop("cart_items", [])
        user = validated_data.get("user") or self.context.get("request") and getattr(self.context.get("request"), "user", None)
        if user is None or user.is_anonymous:
            raise ValidationError("User must be set to create a cart")
        cart = Cart.objects.create(user=user)
        for ci in cart_items_data:
            item = ci.get("item")
            quantity = ci.get("quantity", 1)
            CartItem.objects.create(cart=cart, item=item, quantity=quantity)
        return cart

    def update(self, instance, validated_data):
        user = validated_data.get("user")
        if user is not None:
            instance.user = user
            instance.save()

        incoming = {ci["item"].id: ci for ci in validated_data.get("cart_items", [])}
        existing_qs = instance.cart_items.select_related("item").all()
        existing_ids = {ci.item.id for ci in existing_qs}

        for item_id, ci in incoming.items():
            obj, created = CartItem.objects.update_or_create(
                cart=instance, item_id=item_id,
                defaults={"quantity": ci.get("quantity", 1)}
            )

        to_remove = [ci for ci in existing_qs if ci.item.id not in incoming]
        for ci in to_remove:
            ci.delete()

        return instance

    def get_total_price(self, obj):
        total = Decimal("0.00")
        for ci in obj.cart_items.select_related("item").all():
            price = ci.item.price or Decimal("0.00")
            total += price * ci.quantity
        return str(total)
