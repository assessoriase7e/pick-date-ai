"use client";

import { toast } from "sonner";
import { useState } from "react";
import { getPrintData } from "@/actions/appointments/print";

export function useAutoPrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printAppointment = async (appointmentId: number) => {
    try {
      setIsPrinting(true);

      // Usar a server action em vez da chamada à API
      const result = await getPrintData(appointmentId);

      if (!result.success) {
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.info(`Nenhuma impressão necessária: ${result.message}`);
        }
        return;
      }

      if (!result.printData) {
        toast.info(result.message || "Nenhuma impressora disponível");
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
              size: 10px;
              margin: 10mm;
            }
  
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 10px;
            }
  
            p {
              margin: 4px 0;
            }
  
            hr {
              border: none;
              border-top: 1px solid #000;
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div><strong>${
            printData.companyName || "NOME DA EMPRESA"
          }</strong></div>
          <div><strong>COMANDA DE SERVIÇO</strong></div>
          <hr/>
          <p><strong>Cliente:</strong> ${printData.clientName}</p>
          <p><strong>Serviço:</strong> ${printData.serviceName}</p>
          <p><strong>Início:</strong> ${printData.startTime}</p>
          <p><strong>Fim:</strong> ${printData.endTime}</p>
          ${
            printData.collaboratorName
              ? `<p><strong>Profissional:</strong> ${printData.collaboratorName}</p>`
              : ""
          }
          ${
            printData.price !== undefined
              ? `<p><strong>Valor:</strong> R$ ${Number(
                  printData.price
                ).toFixed(2)}</p>`
              : ""
          }
          ${
            printData.notes
              ? `<p><strong>Observações:</strong> ${printData.notes}</p>`
              : ""
          }
          <div class="footer">Obrigado pela preferência!</div>
        </body>
      </html>
    `;
  };

  return {
    printAppointment,
    isPrinting,
    // Sempre retorna true para compatibilidade com o código existente
    isConnected: true,
  };
}
