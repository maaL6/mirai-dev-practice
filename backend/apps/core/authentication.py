from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Do not enforce CSRF for API views to allow Vite proxy
        # to work without complex CSRF cookie handling
        return
