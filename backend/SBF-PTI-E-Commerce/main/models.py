from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.urls import reverse
from django.utils.text import slugify
import uuid
import secrets
from django.contrib.auth.hashers import make_password, check_password


class User(models.Model):
    user_id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    username = models.CharField(max_length=20, unique=True)
    # allow room for hashed passwords
    user_password = models.CharField(max_length=128)
    user_picture = models.ImageField(upload_to="users/%Y/%m/%d/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        """Required by DRF's IsAuthenticated permission class."""
        return True

    def set_password(self, raw_password):
        """Hash and set the user's password (does not save)."""
        self.user_password = make_password(raw_password)

    def check_password(self, raw_password):
        """Return True if the given raw_password matches the stored hash."""
        return check_password(raw_password, self.user_password)


class Items(models.Model):
    item_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    # Changed to TextField to support external URLs
    item_picture = models.TextField(blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True)
    item_description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["item_name"]
        verbose_name = "item"
        verbose_name_plural = "items"

    def __str__(self):
        return f"{self.item_name} ({self.price})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.item_name)
            self.slug = base_slug
            # Handle duplicate slugs by adding a counter
            counter = 1
            while Items.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
    
    def get_add_to_cart(self):
        return reverse('core:add_to_cart', kwargs={
            'slug': self.slug
        })

    def remove_from_the_cart(self):
        return reverse('core:remove_from_the_cart', kwargs={
            'slug':self.slug
        })


class OrderItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Items, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def get_total_price(self):
        return self.item.price * self.quantity
    

class Cart(models.Model):
    user = models.OneToOneField(to=User, on_delete=models.CASCADE, related_name="cart")
    items = models.ManyToManyField(to=Items, through="CartItem", related_name="carts")

    def __str__(self):
        return f"Cart of {self.user}"
    
    def get_total(self):
        total = 0
        for order_item in self.items.all():
            total = total + order_item.get_final_price()
        return total

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="cart_items")
    item = models.ForeignKey(Items, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ("cart", "item")

    def __str__(self):
        return f"{self.quantity} × {self.item.item_name} in {self.cart}"


class AuthToken(models.Model):
    """Simple token auth for API (login returns token, client includes in Authorization header)."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="auth_token")
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Token for {self.user.username}"