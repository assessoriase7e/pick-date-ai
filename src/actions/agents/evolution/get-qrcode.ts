"use server";

export async function getQRCode(instanceName: string) {
  try {
    // Fazer a chamada para a API da Evolution para obter o QR Code
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/qrcode/${instanceName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.EVOLUTION_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.message || "Falha ao obter QR Code" 
      };
    }

    const data = await response.json();
    
    return { 
      success: true, 
      data: data.qrcode 
    };
  } catch (error) {
    console.error("Erro ao obter QR Code:", error);
    return { 
      success: false, 
      error: "Falha ao obter QR Code" 
    };
  }
}