import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://blindly-dominant-akita.ngrok-free.app/api'; 

export type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;
  id: number;
};

type Equipe = {
  id: number;
  nome: string;
};


async function getAuthToken(): Promise<string> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    return token;
  } catch (error) {
    console.error('Erro ao obter o token de autenticação:', error);
    throw error;
  }
}


export const fetchTorneios = async (search?: string): Promise<Torneio[]> => {
  try {
    const url = search ? `${API_URL}/torneios/?search=${search}` : `${API_URL}/torneios/`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Falha ao carregar os torneios');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar torneios:', error);
    throw error;
  }
};


// Função para buscar um torneio específico por ID
export const fetchTorneio = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/torneios/${id}/`);
    return response.data; // Retorna os detalhes do torneio
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error('Erro ao buscar torneio: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao buscar torneio.');
    }
  }
};



export const createTorneio = async (torneioData: {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;  // Mudado de 'local' para 'localizacao'
}) => {
  try {
    const response = await axios.post(`${API_URL}/torneios/`, torneioData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error('Erro ao criar torneio: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao criar torneio.');
    }
  }
};

// Função para atualizar um torneio
export const updateTorneio = async (
  id: number,
  torneioData: {
    nome: string;
    data_inicio: string;
    data_fim: string;
    local: string;
  }
) => {
  try {
    const response = await axios.put(`${API_URL}/torneios/${id}/`, torneioData);
    return response.data; // Retorna os dados do torneio atualizado
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error('Erro ao atualizar torneio: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao atualizar torneio.');
    }
  }
};

// Função para excluir um torneio
export const deleteTorneio = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/torneios/${id}/`);
    return { message: 'Torneio excluído com sucesso.' };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error('Erro ao excluir torneio: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao excluir torneio.');
    }
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/usuarios/login/`, {
      username,
      password,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.detail || 'Erro ao fazer login');
    } else {
      throw new Error('Erro de rede. Tente novamente.');
    }
  }
};


export const registerUser = async (email: string, username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/usuarios/register/`, {
      email,
      username,
      password,
    });

    if (response.status === 201) {
      return response.data; 
    } else {
      throw new Error('Falha ao criar usuário. Status inesperado: ' + response.status);
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.detail || 'Erro ao registrar');
    } else {
      throw new Error('Erro de rede. Tente novamente.');
    }
  }
};

export const logoffUser = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('Token de atualização não encontrado');
    }

    const response = await axios.post(
      `${API_URL}/usuarios/logoff/`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao fazer logoff:', error.message);
      throw new Error('Erro ao fazer logoff: ' + error.message);
    } else {
      console.error('Erro desconhecido ao fazer logoff:', error);
      throw new Error('Erro desconhecido ao fazer logoff.');
    }
  }
};
export const updateUserDetails = async (userId: number, userData: { nome_completo?: string; email?: string; telefone?: string; cidade?: string }) => {
  try {
    const token = await getAuthToken();

    const response = await axios.patch(`${API_URL}/usuarios/${userId}/`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao atualizar detalhes do usuário:', error.message);
      throw new Error('Erro ao atualizar detalhes do usuário: ' + error.message);
    } else {
      console.error('Erro desconhecido ao atualizar detalhes do usuário:', error);
      throw new Error('Erro desconhecido ao atualizar detalhes do usuário.');
    }
  }
};



export const getUserDetails = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/usuarios/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    throw error;
  }
};

// Função para atualizar os detalhes da equipe
export const atualizarEquipe = async (equipeId: number, equipe: Equipe) => {
  try {
    const response = await axios.put(`${API_URL}/equipes/${equipeId}/`, equipe);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao atualizar equipe');
  }
};

export const createEquipeParaTorneio = async (torneioId: number, equipeData: { nome: string; cidade: string; treinador: string; fundacao: string }) => {
  try {
    const response = await fetch(`${API_URL}/equipes/create-for-torneio/${torneioId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: equipeData.nome,           
        cidade: equipeData.cidade,       
        treinador: equipeData.treinador, 
        fundacao: equipeData.fundacao,  
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar a equipe');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchProximasPartidas = async (torneioId: number) => {
  try {
    const response = await fetch(`${API_URL}/partidas/por-torneio/${torneioId}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar partidas');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Função para buscar todas as equipes cadastradas
export const fetchEquipes = async (): Promise<Equipe[]> => {
  try {
    const response = await axios.get(`${API_URL}/equipes/`);
    return response.data; // Retorna a lista de equipes
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error('Erro ao buscar equipes: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao buscar equipes.');
    }
  }
};

export const vincularEquipeATorneio = async (torneioId: number, equipeId: number) => {
  try {
    const response = await axios.post(`${API_URL}/equipes/vincular-equipe/${equipeId}/torneio/${torneioId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao vincular equipe ao torneio');
  }
};


export const updatePartida = async (id: number, partida: any) => {
  try {
    const updatedPartida = {
      ...partida,
      Equipe_casa: partida.Equipe_casa.id,  // Enviando apenas o ID da equipe
      Equipe_visitante: partida.Equipe_visitante.id,  // Enviando apenas o ID da equipe
      data: partida.data,  // A data deve ser um formato ISO 8601
    };

    const response = await fetch(`${API_URL}/partidas/${id}/atualiza-partida/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPartida),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro de resposta:', errorData);
      throw new Error(`Erro ao atualizar partida: ${errorData.detail || 'Erro desconhecido'}`);
    }

    const responseData = await response.json();
    return responseData;  // Resposta incluirá as equipes com as logos

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao atualizar partida:', error.message); // Acesse a mensagem de erro
      throw new Error('Erro ao atualizar partida: ' + error.message);
    } else {
      // Se não for um erro esperado, trata como erro desconhecido
      console.error('Erro desconhecido:', error);
      throw new Error('Erro ao atualizar partida: erro desconhecido');
    }
  }
};



// Equipe by ID
export const fetchEquipeDetails = async (id: number): Promise<Equipe> => {
  try {
    const response = await axios.get(`${API_URL}/equipes/${id}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error('Erro ao buscar detalhes da equipe: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao buscar detalhes da equipe.');
    }
  }
};


// Buscar as equipes de um torneio específico
export const fetchEquipesPorTorneio = async (torneioId: number) => {
  try {
    const response = await axios.get(`${API_URL}/equipes/por-torneio/${torneioId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar equipes');
  }
};


// Buscar os torneios de uma equipe específica
export const fetchTorneiosPorEquipe = async (EquipeId: number) => {
  try {
    const response = await axios.get(`${API_URL}/equipes/${EquipeId}/torneios/`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar equipes');
  }
};

// Criar o confronto (partida)
export const createConfronto = async (torneioId: number, equipeCasaId: number, equipeVisitanteId: number, data: string, localizacao: string) => {
  try {
    const response = await axios.post(`${API_URL}/partidas/confronto-torneio/${torneioId}/`, {
      Equipe_casa: equipeCasaId,
      Equipe_visitante: equipeVisitanteId,
      data: data,
      localizacao: localizacao,
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao criar confronto');
  }
};