"use client";

import { toast } from "sonner";
import { useState } from "react";
import { getPrintData } from "@/actions/appointments/print";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useAutoPrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printAppointment = async (appointmentId: number) => {
    try {
      setIsPrinting(true);

      const result = await getPrintData(appointmentId);

      if (!result.success) {
        toast.error(result.error || "Erro ao obter dados para impressão");
        return;
      }

      if (!result.printData) {
        toast.error("Dados para impressão não encontrados");
        return;
      }

      // Criar e abrir janela de impressão com os dados
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Não foi possível abrir a janela de impressão");
        return;
      }

      // Gerar HTML da comanda
      const printContent = generateReceiptHtml(result.printData);

      // Escrever conteúdo na janela de impressão
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Esperar o carregamento completo antes de imprimir
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast.success("Comanda enviada para impressão");
    } catch (error) {
      console.error("Erro na impressão:", error);
      toast.error("Erro ao preparar impressão");
    } finally {
      setIsPrinting(false);
    }
  };

  // Função para gerar o HTML da comanda
  const generateReceiptHtml = (printData: any): string => {
    // Formatar datas no mesmo formato que o componente de detalhes
    const startTime = new Date(printData.startTime);
    const endTime = new Date(printData.endTime);

    const formatDate = (date: Date) => {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    const formatTime = (date: Date) => {
      return format(date, "HH:mm", { locale: ptBR });
    };

    // Formatar preço no mesmo formato que o componente de detalhes
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    return `
      <html>
        <head>
          <title>Comanda de Serviço</title>
          <style>
            @media print {
              html, body {
                height: auto;
                margin: 0;
                padding: 0;
                overflow: visible;
              }
  
              * {
                box-sizing: border-box;
              }
  
              .footer {
                page-break-after: avoid;
              }
            }
  
            @page {
              size: 80mm;
              margin: 10mm;
            }
  
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 10px;
            }

            .section {
              margin-bottom: 15px;
            }

            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
  
            p {
              margin: 4px 0;
            }
  
            hr {
              border: none;
              border-top: 1px solid #000;
              margin: 8px 0;
            }

            .label {
              font-weight: medium;
            }
          </style>
        </head>
        <body>
          <div><strong>${
            printData.companyName || "NOME DA EMPRESA"
          }</strong></div>
          <div><strong>COMANDA DE SERVIÇO</strong></div>
          <hr/>

          <div class="section">
            <div class="section-title">Detalhes do Agendamento</div>
            <p><span class="label">Data:</span> ${formatDate(startTime)}</p>
            <p><span class="label">Horário:</span> ${formatTime(startTime)} às ${formatTime(endTime)}</p>
          </div>

          <div class="section">
            <div class="section-title">Cliente</div>
            <p><span class="label">Nome:</span> ${printData.clientName}</p>
          </div>

          <div class="section">
            <div class="section-title">Serviço</div>
            <p><span class="label">Nome:</span> ${printData.serviceName}</p>
            ${printData.price !== undefined ? 
              `<p><span class="label">Valor:</span> ${formatCurrency(printData.price)}</p>` : 
              ''}
          </div>

          ${printData.collaboratorName ? 
            `<div class="section">
              <div class="section-title">Profissional</div>
              <p><span class="label">Nome:</span> ${printData.collaboratorName}</p>
            </div>` : 
            ''}

          ${printData.notes ? 
            `<div class="section">
              <div class="section-title">Observações</div>
              <p>${printData.notes}</p>
            </div>` : 
            ''}

          <hr/>
          <div class="footer">Obrigado pela preferência!</div>
        </body>
      </html>
    `;
  };

  return {
    printAppointment,
    isPrinting
  };
}
