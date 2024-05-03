import React, { useState, useEffect } from 'react';
import { CriarChatFlow, UpdateChatFlow } from 'src/service/chatFlow';
import { getDefaultFlow } from 'src/components/ccFlowBuilder/defaultFlow';

function ModalNovoChatFlow(props) {
  const userId = +localStorage.getItem('userId');
  const [chatFlow, setChatFlow] = useState({
    name: null,
    userId,
    celularTeste: null,
    isActive: true,
  });

  useEffect(() => {
    if (props.chatFlowEdicao.id) {
      setChatFlow({
        ...props.chatFlowEdicao,
        userId,
      });
    } else {
      setChatFlow({
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true,
      });
    }
  }, [props.chatFlowEdicao]);

  const abrirModal = () => {
    // Implemente a lógica de abertura do modal, se necessário.
  };

  const fecharModal = () => {
    setChatFlow({
      name: null,
      action: 0,
      userId,
      celularTeste: null,
      isActive: true,
    });
    props.onUpdateChatFlowEdicao({ id: null });
    props.onUpdateModalChatFlow(false);
  };

  const handleAutoresposta = async () => {
    if (chatFlow.id && !chatFlow?.isDuplicate) {
      const { data } = await UpdateChatFlow(chatFlow);
      // Implemente a lógica de notificação de sucesso, se necessário.
      props.onChatFlowEditado(data);
    } else {
      const flow = { ...getDefaultFlow(), ...chatFlow, id: null };
      const { data } = await CriarChatFlow(flow);
      // Implemente a lógica de notificação de sucesso, se necessário.
      props.onChatFlowCriada(data);
    }
    fecharModal();
  };

  return (
    <div>
      {/* Implemente o JSX para renderizar o modal, formulário e botões aqui */}
    </div>
  );
}

export default ModalNovoChatFlow;
