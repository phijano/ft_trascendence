# Generated by Django 4.2.6 on 2024-11-09 14:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0010_alter_room_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatinvitation',
            name='room_data',
            field=models.IntegerField(null=True),
        ),
    ]