from django.shortcuts import render

from django.contrib.auth.models import User
from django.views import generic

from django import http
from django.views.generic import View
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignUpForm
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import EmailMessage
from .models import Match
from django.db.models import Q

# Create your views here.

class LogIn(View):

    def get(self, request):
        if not request.user.is_authenticated:
            return http.HttpResponseForbidden()
        return http.JsonResponse({
            "id": request.user.pk,
            "username": request.user.get_username(),
            })

    def post(self, request):
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return self.get(request)
        return http.JsonResponse(form.errors.get_json_data(), status=400)


class LogOut(View):

    def get(self, request):
        logout(request)
        return http.HttpResponse(status=205)


class SignUp(View):

    def get(self, request):
        return http.HttpResponseForbidden()

    def post(self, request):
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.is_active = False
            user.save()
            currentSite = get_current_site(request)
            tokenGenerator = PasswordResetTokenGenerator()
            mail_subject = 'Activate your account'
            message = render_to_string('registration/accountActiveEmail.html', {
                'user': user,
                'domain': currentSite.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': tokenGenerator.make_token(user),
            })
            to_email = form.cleaned_data.get('email')
            email = EmailMessage(mail_subject, message, to=[to_email])
            email.send()
            return http.HttpResponse(status=201)
        return http.JsonResponse(form.errors.get_json_data(), status=400)


class SignUpTemplate(generic.FormView):
    form_class = SignUpForm
    template_name = "registration/signup.html"

class ActivateUser(View):
    def get(self, request, uidb64, token):
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        tokenGenerator = PasswordResetTokenGenerator()
        if user and tokenGenerator.check_token(user, token):
            user.is_active = True
            user.save()
        return

def profile(request):
    #if request.user.is_authenticated:
    return render(request, 'profile.html')
    #else:
    #    return http.HttpResponse(status=404)


def friends(request):
    #if request.user.is_authenticated:
    return render(request, 'profile.html')
    #else:
    #    return http.HttpResponse(status=404)

class History(generic.ListView):
    #if request.user.is_authenticated:
    model = Match
    template_name = 'history.html'
    paginated_by = 1

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs) 
        context["matches"] = Match.objects.filter(Q(player__user_id=self.request.user)|Q(opponent__user_id=self.request.user)).order_by('-date')
        return context

#    return render(request, 'profile.html')
    #else:
    #    return http.HttpResponse(status=404)






