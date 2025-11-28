from django.db import migrations
from django.utils.text import slugify
import uuid


def seed_data(apps, schema_editor):
    Items = apps.get_model('main', 'Items')
    User = apps.get_model('main', 'User')
    AuthToken = apps.get_model('main', 'AuthToken')
    # create sample items (no Category model in this project layout)
    sample_items = [
        {'item_name': 'Oak Chair', 'item_description': 'Sturdy oak chair', 'price': '49.99', 'item_picture': ''},
        {'item_name': 'Pine Table', 'item_description': 'Solid pine dining table', 'price': '129.99', 'item_picture': ''},
        {'item_name': 'Ceramic Vase', 'item_description': 'Handmade ceramic vase', 'price': '24.50', 'item_picture': ''},
        {'item_name': 'Desk Lamp', 'item_description': 'Adjustable desk lamp', 'price': '34.00', 'item_picture': ''},
    ]

    for si in sample_items:
        # create a reasonably unique slug to avoid unique constraint issues
        base = slugify(si['item_name']) or 'item'
        slug = f"{base}-{uuid.uuid4().hex[:8]}"
        Items.objects.get_or_create(slug=slug, defaults={
            'item_name': si['item_name'],
            'item_description': si['item_description'],
            'price': si['price'],
            'item_picture': si['item_picture'],
        })

    # create a demo user (password: demo123)
    if not User.objects.filter(username='demo@local').exists():
        user = User.objects.create(username='demo@local')
        # use model helper if available
        if hasattr(user, 'set_password'):
            user.set_password('demo123')
            user.save(update_fields=['user_password'])
        else:
            user.user_password = 'demo123'
            user.save()
        # create token for demo user
        AuthToken.objects.get_or_create(user=user)


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_alter_user_password'),
    ]

    operations = [
        migrations.RunPython(seed_data),
    ]
