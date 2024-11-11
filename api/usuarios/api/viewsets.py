from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from usuarios.models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = Usuario.objects.get(username=username)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
    @action(detail=False, methods=['post'], url_path='logoff')
    def logoff(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()  
            return Response({'detail': 'Logout realizado com sucesso.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)