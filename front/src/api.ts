import axios, { AxiosError } from 'axios';

const API_URL = 'https://719d-177-44-237-205.ngrok-free.app/api'; 

export type Torneio = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  localizacao: string;
  id: number;
};

type Equipe = {
  nome: string;
};

// Função para listar todos os torneios
export const fetchTorneios = async (): Promise<Torneio[]> => {
    try {
      const response = await fetch(`${API_URL}/torneios/`);
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

    // Verifica se o status é 201, caso contrário, trata o erro
    if (response.status === 201) {
      return response.data; // Retorna os dados do usuário criado
    } else {
      throw new Error('Falha ao criar usuário. Status inesperado: ' + response.status);
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Verifica se há detalhes de erro no corpo da resposta
      throw new Error(error.response?.data.detail || 'Erro ao registrar');
    } else {
      // Erro de rede ou outro erro não capturado
      throw new Error('Erro de rede. Tente novamente.');
    }
  }
};

export const logoffUser = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/usuarios/logoff/`,
      { refresh_token: token },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Limpar o token armazenado após logoff
    return response.data; // Retorna a mensagem de sucesso
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error('Erro ao fazer logoff: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao fazer logoff.');
    }
  }
};

function getAuthToken() {
  throw new Error('Function not implemented.');
}


export const createEquipe = async (torneioId: number, nomeEquipe: string) => {
  try {
    const response = await axios.post(`${API_URL}/equipes/create-for-torneio/${torneioId}/`, {
      nome: nomeEquipe,
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao criar a equipe');
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


// Buscar as equipes de um torneio específico
export const fetchEquipesPorTorneio = async (torneioId: number) => {
  try {
    const response = await axios.get(`${API_URL}/equipes/por-torneio/${torneioId}/`);
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