"""
Django settings for trascendence project.

Generated by 'django-admin startproject' using Django 4.2.6.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cdjango-insecure-yrb=73%bos5rsni@-qb0cmy_secret_key2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+2)uwi#n4g^yyhhzr1=)!yf13ws5+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
]

#Fix this, no idea what should add
CSRF_TRUSTED_ORIGINS = [
    'https://localhost:8080',
    'https://127.0.0.1:8080',
]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    #delele daphne in prod
    'daphne',
    'django.contrib.staticfiles',
    'home',
    'userManagement',
    'pong',
    'chat',
    'channels',
    'django_htmx',
    'django_cleanup',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_htmx.middleware.HtmxMiddleware',
]

ROOT_URLCONF = 'trascendence.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                #serving user files in development
                'django.template.context_processors.media',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'trascendence.wsgi.application'
ASGI_APPLICATION = 'trascendence.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'trascendence',
        'USER': 'dbmaster',
        'PASSWORD': 'masterpass',
        'HOST': 'postgre',
        'PORT': '5432',
    }
}

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

#TIME_ZONE = 'UTC'
TIME_ZONE = 'Europe/Madrid'

USE_I18N = True

USE_TZ = True



# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_REDIRECT_URL = '/'
#LOGIN_URL = 'login'

# Email settings not working with gmail, try yahoo
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
#EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'mvptrascendence42@gmail.com'
EMAIL_HOST_PASSWORD = 'qskq yany alqe suwe'
EMAIL_PORT = 587

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
MEDIA_URL = 'avatars/'

STATIC_ROOT = 'static_files/static'
MEDIA_ROOT = 'stattic_files/media'
