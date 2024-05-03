// cronjob.ts
import cron from 'node-cron';

// Função que será executada a cada 10 segundos
export const executaAcaoACada10Segundos = () => {
    console.log('CronJob Ok');
};

// Agendamento do cronjob para executar a cada 10 segundos
cron.schedule('*/10 * * * * *', () => {
    executaAcaoACada10Segundos();
});