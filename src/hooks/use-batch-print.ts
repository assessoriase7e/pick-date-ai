"use client";

import { toast } from "sonner";
import { useState } from "react";
import { getBatchPrintData } from "@/actions/appointments/batch-print";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function useBatchPrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printSelectedAppointments = async (appointmentIds: number[]) => {
    if (appointmentIds.length === 0) {
      toast.error("Selecione pelo menos um agendamento para imprimir");
      return;
    }

    try {
      setIsPrinting(true);
      toast.info("Preparando impressão...");

      const result = await getBatchPrintData(appointmentIds);

      if (!result.success) {
        toast.error(result.error || "Erro ao obter dados para impressão");
        return;
      }

      if (!result.printData || result.printData.length === 0) {
        toast.error("Nenhum dado encontrado para impressão");
        return;
      }

      // Criar PDF com múltiplas páginas
      await generatePDF(result.printData);

      toast.success(`${appointmentIds.length} comanda(s) gerada(s) com sucesso!`);
    } catch (error) {
      console.error("Erro na impressão em lote:", error);
      toast.error("Erro ao preparar impressão");
    } finally {
      setIsPrinting(false);
    }
  };

  const generatePDF = async (appointmentsData: any[]) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    for (let i = 0; i < appointmentsData.length; i++) {
      const appointmentData = appointmentsData[i];
      
      // Se não é a primeira página, adicionar nova página
      if (i > 0) {
        pdf.addPage();
      }

      // Criar elemento HTML temporário para captura
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // Largura A4
      tempDiv.style.padding = '20mm';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.innerHTML = generateAppointmentHTML(appointmentData);
      
      document.body.appendChild(tempDiv);

      try {
        // Capturar como imagem
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170; // Largura da imagem no PDF (mm)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Adicionar imagem ao PDF
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      } finally {
        // Remover elemento temporário
        document.body.removeChild(tempDiv);
      }
    }

    // Baixar o PDF
    pdf.save(`comandas-${format(new Date(), 'dd-MM-yyyy-HH-mm')}.pdf`);
  };

  const generateAppointmentHTML = (appointmentData: any): string => {
    const startTime = new Date(appointmentData.startTime);
    const endTime = new Date(appointmentData.endTime);

    const formatDate = (date: Date) => {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    const formatTime = (date: Date) => {
      return format(date, "HH:mm", { locale: ptBR });
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    return `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${appointmentData.companyName || "NOME DA EMPRESA"}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; color: #666;">COMANDA DE SERVIÇO</h2>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Detalhes do Agendamento</h3>
          <p style="margin: 8px 0;"><strong>Data:</strong> ${formatDate(startTime)}</p>
          <p style="margin: 8px 0;"><strong>Horário:</strong> ${formatTime(startTime)} às ${formatTime(endTime)}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Cliente</h3>
          <p style="margin: 8px 0;"><strong>Nome:</strong> ${appointmentData.clientName}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Serviço</h3>
          <p style="margin: 8px 0;"><strong>Nome:</strong> ${appointmentData.serviceName}</p>
          ${appointmentData.price !== undefined ? 
            `<p style="margin: 8px 0;"><strong>Valor:</strong> ${formatCurrency(appointmentData.price)}</p>` : 
            ''}
        </div>

        ${appointmentData.collaboratorName ? 
          `<div style="margin-bottom: 25px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Profissional</h3>
            <p style="margin: 8px 0;"><strong>Nome:</strong> ${appointmentData.collaboratorName}</p>
          </div>` : 
          ''}

        ${appointmentData.notes ? 
          `<div style="margin-bottom: 25px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Observações</h3>
            <p style="margin: 8px 0;">${appointmentData.notes}</p>
          </div>` : 
          ''}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
          <p style="margin: 0; font-size: 16px; font-weight: bold;">Obrigado pela preferência!</p>
        </div>
      </div>
    `;
  };

  return {
    printSelectedAppointments,
    isPrinting
  };
}