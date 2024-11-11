from rest_framework import serializers
from usuarios.models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nome_completo', 'telefone', 'cidade', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            nome_completo=validated_data.get('nome_completo', ''),
            telefone=validated_data.get('telefone', ''),
            cidade=validated_data.get('cidade', ''),
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        # Atualização de outros campos
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.nome_completo = validated_data.get('nome_completo', instance.nome_completo)
        instance.telefone = validated_data.get('telefone', instance.telefone)
        instance.cidade = validated_data.get('cidade', instance.cidade)

        # Atualização de senha, se fornecida
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)

        instance.save()
        return instance
