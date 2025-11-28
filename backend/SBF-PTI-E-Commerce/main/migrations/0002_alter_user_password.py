from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="user_password",
            field=models.CharField(max_length=128),
        ),
    ]
