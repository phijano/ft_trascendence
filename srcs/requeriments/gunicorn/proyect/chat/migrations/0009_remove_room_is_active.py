# Generated by Django 4.2.6 on 2024-11-08 13:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0008_room_created_at'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='is_active',
        ),
    ]