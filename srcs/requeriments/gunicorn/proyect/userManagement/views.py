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
from .models import Friendship, Profile
from pong.models import Match
from django.db.models import Q
from django.core.paginator import Paginator

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
    if request.user.is_authenticated:
        queryset = Friendship.objects.filter(Q(accepter__user_id=request.user, status = 1)|Q(giver__user_id=request.user, status = 1))
        paginator = Paginator(queryset, 10)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        userProfile = Profile.objects.filter(user_id=request.user.id)
        return render(request, "friends.html", {"page_obj":page_obj, 'profile':userProfile[0]})
    return render(request, "friends.html")


def pending(request):
    if request.user.is_authenticated:
        queryset = Friendship.objects.filter(accepter__user_id=request.user, status=0)
        paginator = Paginator(queryset, 10)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "pending.html", {"page_obj":page_obj})
    return render(request, "pending.html")

def invited(request):
    if request.user.is_authenticated:
        queryset = Friendship.objects.filter(giver__user_id=request.user, status = 0)
        paginator = Paginator(queryset, 10)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "invited.html", {"page_obj":page_obj})
    return render(request, "invited.html")

def matches(request):
    if request.user.is_authenticated:
        queryset = Match.objects.filter(Q(player__user_id=request.user)|Q(opponent__user_id=request.user)).order_by('-date')
        paginator = Paginator(queryset, 10)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "history.html", {"page_obj":page_obj})
    return render(request, "history.html")


def search(request):
    if request.user.is_authenticated:
        query = request.GET.get("searchQuery")
        if not query:
            return render(request,"search.html")
        userProfile = Profile.objects.filter(user_id=request.user.id)
        friendships = Friendship.objects.filter(Q(accepter__user_id=request.user)|Q(giver__user_id=request.user))
        queryset = Profile.objects.filter(nick__icontains=query).exclude(nick=userProfile[0].nick)
        friends= []
        for friend in friendships:
            if friend.accepter != userProfile[0]:
                friends.append(friend.accepter)
            else:
                friends.append(friend.giver)        
        paginator = Paginator(queryset, 10)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "search.html", {"page_obj":page_obj,'friends':friends, 'query':query})
    return render(request, "search.html")

class AcceptFriend(View):

    def post(self, request):
        if request.user.is_authenticated:
            friendship_id = request.POST.get("friendship_id")
            friendship_to_accept = Friendship.objects.get(id=friendship_id)
            friendship_to_accept.status = 1
            friendship_to_accept.save()
            return http.HttpResponse(status=201)
        return http.HttpResponse(status=400)

class DeleteFriend(View):

    def post(self, request):
        if request.user.is_authenticated:
            friendship_id = request.POST.get("friendship_id")
            friendship_to_delete = Friendship.objects.get(id=friendship_id)
            friendship_to_delete.delete()
            return http.HttpResponse(status=201)
        return http.HttpResponse(status=400)

class SendInvitation(View):

    def post(self, request):
        if request.user.is_authenticated:
            form = FriendshipCreationForm(request.POST)
            if form.is_valid():
                friendship = form.save(commit="False")

            return http.HttpResponse(status=201)
        return http.HttpResponse(status=400)




