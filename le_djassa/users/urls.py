from django.urls import path
from .views import (UserRegistrationView, UserDetailUpdateView, UserDetailUpdateViewBuyer, UserRoleView,
                    CheckAccessView, GetPremierLettreNameUser, RequestPasswordResetView, ResetPasswordView,
                    ResetPasswordInProfileView, PasswordResetConfirmView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserDetailUpdateView.as_view(), name='user-profile'),
    path('profile-buyer/', UserDetailUpdateViewBuyer.as_view(), name='user-detail-update_buyer'),
    path('user-role/', UserRoleView.as_view(), name='user-role'),
    path('check-access/<str:role>/', CheckAccessView.as_view(), name='check-access'),
    path('user-initial/', GetPremierLettreNameUser.as_view(), name='user-initial'),
    path('request-reset-password/', RequestPasswordResetView.as_view(), name='request-reset-password'),
    path('reset-password-in-profile/', ResetPasswordInProfileView.as_view(), name='reset-password-in-profile'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

]