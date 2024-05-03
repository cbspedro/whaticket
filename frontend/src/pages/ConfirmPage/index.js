import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from "../../services/api";

const ConfirmPage = (props) => {
  const { token } = props.match.params;
  const history = useHistory();
  const [confirmationStatus, setConfirmationStatus] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get(`/confirm/${token}`);

        // Lógica de manipulação da resposta
        if (response.status === 200) {
          // A conta foi confirmada com sucesso
          setConfirmationStatus('success');
          console.log("Conta confirmada com sucesso");
        } else {
          // A confirmação falhou, lidar com isso adequadamente
          setConfirmationStatus('error');
          console.error("Falha na confirmação da conta");
        }
      } catch (error) {
        // Lidar com erros de rede ou solicitação
        setConfirmationStatus('error');
        console.error("Erro na solicitação de confirmação: ", error);
      }
    };

    // Chame a função fetchTasks
    fetchTasks();
  }, [token]);

  const handleButtonClick = () => {
    // Redirecionar o usuário para a página inicial após a confirmação
    history.push('/');
  };

  return (
    <div>
      <h2>{confirmationStatus === 'success' ? 'Conta Confirmada!' : 'Erro na Confirmação'}</h2>
      {confirmationStatus === 'success' ? (
        <p>Sua conta foi confirmada com sucesso. Agora você pode fazer login e aproveitar nossos serviços.</p>
      ) : (
        <p>Houve um erro ao confirmar sua conta. Por favor, tente novamente mais tarde.</p>
      )}
      <button onClick={handleButtonClick}>Ir para a Página Inicial</button>
    </div>
  );
};

export default ConfirmPage;
