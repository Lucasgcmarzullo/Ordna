import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Token do Mercado Pago não configurado' },
        { status: 500 }
      );
    }

    // Criar assinatura no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Assinatura Premium - Planejador Semanal',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 19.90,
          currency_id: 'BRL',
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/premium/success`,
        payer_email: email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Mercado Pago:', data);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao criar assinatura no Mercado Pago',
          data: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura criada com sucesso',
      data: {
        init_point: data.init_point,
        id: data.id,
      },
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno ao processar assinatura',
        data: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
