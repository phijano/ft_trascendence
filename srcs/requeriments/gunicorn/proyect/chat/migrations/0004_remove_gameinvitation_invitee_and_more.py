# Generated by Django 4.2.6 on 2024-10-14 18:18

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0003_blockeduser_gameinvitation_message_room_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gameinvitation',
            name='invitee',
        ),
        migrations.RemoveField(
            model_name='gameinvitation',
            name='inviter',
        ),
        migrations.RemoveField(
            model_name='message',
            name='room',
        ),
        migrations.RemoveField(
            model_name='message',
            name='user',
        ),
        migrations.AlterField(
            model_name='room',
            name='name',
            field=models.CharField(max_length=100, unique=True, verbose_name='name'),
        ),
        migrations.AlterField(
            model_name='room',
            name='users',
            field=models.ManyToManyField(related_name='rooms_joined', to=settings.AUTH_USER_MODEL, verbose_name='users'),
        ),
        migrations.DeleteModel(
            name='BlockedUser',
        ),
        migrations.DeleteModel(
            name='GameInvitation',
        ),
        migrations.DeleteModel(
            name='Message',
        ),
    ]
